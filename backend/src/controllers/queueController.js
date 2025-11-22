const db = require('../config/database');

const queueController = {
  // Получить очередь для события
  getQueue: (req, res) => {
    const { eventId } = req.params;
    console.log('📋 Получение очереди для события:', eventId);

    // Получаем информацию о событии
    db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
      if (err) {
        console.error('❌ Ошибка получения события:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Событие не найдено' });
      }

      // Получаем очередь
      db.all(
        `SELECT q.*, u.name as user_name, u.email as user_email, u.phone as user_phone
         FROM queue_entries q
         JOIN users u ON q.user_id = u.id
         WHERE q.event_id = ? AND q.status IN ('waiting', 'paused')
         ORDER BY q.position ASC`,
        [eventId],
        (err, queue) => {
          if (err) {
            console.error('❌ Ошибка получения очереди:', err);
            return res.status(500).json({ error: 'Ошибка получения очереди' });
          }

          console.log(`✅ Очередь получена: ${queue.length} человек`);

          // Рассчитываем примерное время ожидания
          const queueWithEstimates = queue.map((entry, index) => ({
            ...entry,
            estimated_wait_time: (index + 1) * event.avg_service_time,
          }));

          res.json({
            event,
            queue: queueWithEstimates,
            total_in_queue: queue.length,
          });
        }
      );
    });
  },

  // Встать в очередь
  joinQueue: (req, res) => {
    const { eventId } = req.params;
    const { userId } = req.body;

    console.log(`➕ Пользователь ${userId} встает в очередь на событие ${eventId}`);

    if (!userId) {
      return res.status(400).json({ error: 'userId обязателен' });
    }

    // Проверяем существование события
    db.get('SELECT * FROM events WHERE id = ? AND is_active = 1', [eventId], (err, event) => {
      if (err) {
        console.error('❌ Ошибка:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Событие не найдено или неактивно' });
      }

      // Проверяем, не состоит ли пользователь уже в этой очереди
      db.get(
        'SELECT * FROM queue_entries WHERE event_id = ? AND user_id = ? AND status IN ("waiting", "paused")',
        [eventId, userId],
        (err, existing) => {
          if (err) {
            console.error('❌ Ошибка:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
          }

          if (existing) {
            return res.status(400).json({ error: 'Вы уже в очереди на это событие' });
          }

          // Получаем последнюю позицию в очереди
          db.get(
            'SELECT MAX(position) as max_position FROM queue_entries WHERE event_id = ? AND status IN ("waiting", "paused")',
            [eventId],
            (err, result) => {
              if (err) {
                console.error('❌ Ошибка:', err);
                return res.status(500).json({ error: 'Ошибка сервера' });
              }

              const newPosition = (result.max_position || 0) + 1;

              // Проверяем лимит очереди
              if (event.max_queue_size && newPosition > event.max_queue_size) {
                return res.status(400).json({ error: 'Очередь переполнена' });
              }

              // Добавляем в очередь
              db.run(
                `INSERT INTO queue_entries (event_id, user_id, position, status, joined_at)
                 VALUES (?, ?, ?, 'waiting', datetime('now'))`,
                [eventId, userId, newPosition],
                function (err) {
                  if (err) {
                    console.error('❌ Ошибка добавления в очередь:', err);
                    return res.status(500).json({ error: 'Ошибка добавления в очередь' });
                  }

                  const entryId = this.lastID;

                  // Получаем созданную запись
                  db.get(
                    `SELECT q.*, u.name as user_name, u.email as user_email
                     FROM queue_entries q
                     JOIN users u ON q.user_id = u.id
                     WHERE q.id = ?`,
                    [entryId],
                    (err, entry) => {
                      if (err) {
                        return res.status(500).json({ error: 'Ошибка получения данных' });
                      }

                      console.log(`✅ Пользователь добавлен в очередь на позицию ${newPosition}`);

                      // Отправляем WebSocket уведомление всем подключенным
                      const io = req.app.get('io');
                      io.emit('queue-updated', {
                        eventId,
                        action: 'join',
                        entry,
                      });

                      res.status(201).json({
                        message: 'Вы успешно встали в очередь',
                        entry: {
                          ...entry,
                          estimated_wait_time: newPosition * event.avg_service_time,
                        },
                        position: newPosition,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  },

  // Покинуть очередь
  leaveQueue: (req, res) => {
    const { entryId } = req.params;

    console.log('❌ Выход из очереди:', entryId);

    // Получаем информацию о записи
    db.get('SELECT * FROM queue_entries WHERE id = ?', [entryId], (err, entry) => {
      if (err) {
        console.error('❌ Ошибка:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!entry) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      // Удаляем запись
      db.run('DELETE FROM queue_entries WHERE id = ?', [entryId], function (err) {
        if (err) {
          console.error('❌ Ошибка удаления:', err);
          return res.status(500).json({ error: 'Ошибка выхода из очереди' });
        }

        // Пересчитываем позиции для оставшихся
        db.run(
          `UPDATE queue_entries 
           SET position = position - 1 
           WHERE event_id = ? AND position > ? AND status IN ('waiting', 'paused')`,
          [entry.event_id, entry.position],
          (err) => {
            if (err) {
              console.error('❌ Ошибка пересчета позиций:', err);
            }

            console.log('✅ Пользователь вышел из очереди');

            // WebSocket уведомление
            const io = req.app.get('io');
            io.emit('queue-updated', {
              eventId: entry.event_id,
              action: 'leave',
              entryId,
            });

            res.json({ message: 'Вы вышли из очереди' });
          }
        );
      });
    });
  },

  // Временно покинуть (пауза)
  pauseQueue: (req, res) => {
    const { entryId } = req.params;
    const { minutes } = req.body; // Сколько минут можно отсутствовать

    console.log('⏸️ Пауза в очереди:', entryId);

    const canReturnUntil = new Date(Date.now() + (minutes || 15) * 60000).toISOString();

    db.run(
      `UPDATE queue_entries 
       SET status = 'paused', can_return_until = ? 
       WHERE id = ?`,
      [canReturnUntil, entryId],
      function (err) {
        if (err) {
          console.error('❌ Ошибка:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Запись не найдена' });
        }

        console.log('✅ Очередь поставлена на паузу');
        res.json({
          message: 'Вы временно покинули очередь',
          can_return_until: canReturnUntil,
        });
      }
    );
  },

  // Вернуться в очередь
  resumeQueue: (req, res) => {
    const { entryId } = req.params;

    console.log('▶️ Возврат в очередь:', entryId);

    db.run('UPDATE queue_entries SET status = "waiting" WHERE id = ?', [entryId], function (err) {
      if (err) {
        console.error('❌ Ошибка:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      console.log('✅ Вернулись в очередь');
      res.json({ message: 'Вы вернулись в очередь' });
    });
  },

  // Завершить обслуживание (admin)
  completeService: (req, res) => {
    const { entryId } = req.params;

    console.log('✅ Завершение обслуживания:', entryId);

    db.run(
      'UPDATE queue_entries SET status = "completed" WHERE id = ?',
      [entryId],
      function (err) {
        if (err) {
          console.error('❌ Ошибка:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Запись не найдена' });
        }

        console.log('✅ Обслуживание завершено');
        res.json({ message: 'Обслуживание завершено' });
      }
    );
  },

  // Получить очереди пользователя
  getUserQueues: (req, res) => {
    const { userId } = req.params;

    console.log('👤 Получение очередей пользователя:', userId);

    db.all(
      `SELECT q.*, e.name as event_name, e.location, e.avg_service_time
       FROM queue_entries q
       JOIN events e ON q.event_id = e.id
       WHERE q.user_id = ? AND q.status IN ('waiting', 'paused')
       ORDER BY q.joined_at DESC`,
      [userId],
      (err, queues) => {
        if (err) {
          console.error('❌ Ошибка:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        console.log(`✅ Найдено очередей: ${queues.length}`);
        res.json({ queues });
      }
    );
  },
};

module.exports = queueController;