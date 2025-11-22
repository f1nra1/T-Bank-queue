const db = require('../config/database');

const queueController = {
  // Получить очередь для события
  getQueueByEvent: (req, res) => {
    const { eventId } = req.params;
    console.log('📋 Запрос очереди для события:', eventId);

    db.all(
      `SELECT q.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM queues q
       JOIN users u ON q.user_id = u.id
       WHERE q.event_id = ? AND q.status IN ('waiting', 'called')
       ORDER BY q.position ASC`,
      [eventId],
      (err, queue) => {
        if (err) {
          console.error('❌ Ошибка получения очереди:', err);
          return res.status(500).json({ error: 'Ошибка получения очереди' });
        }

        console.log('✅ Получена очередь, записей:', queue.length);
        res.json(queue);
      }
    );
  },

  // Встать в очередь
  joinQueue: (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
    console.log('➕ Пользователь', userId, 'встает в очередь события', eventId);

    db.get(
      'SELECT * FROM queues WHERE event_id = ? AND user_id = ? AND status IN ("waiting", "called")',
      [eventId, userId],
      (err, existing) => {
        if (err) {
          console.error('❌ Ошибка проверки очереди:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (existing) {
          console.log('⚠️ Пользователь уже в очереди');
          return res.status(400).json({ error: 'Вы уже в очереди' });
        }

        db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
          if (err) {
            console.error('❌ Ошибка проверки события:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
          }

          if (!event) {
            return res.status(404).json({ error: 'Событие не найдено' });
          }

          if (!event.is_active) {
            return res.status(400).json({ error: 'Событие не активно' });
          }

          db.get(
            'SELECT MAX(position) as max_position FROM queues WHERE event_id = ?',
            [eventId],
            (err, result) => {
              if (err) {
                console.error('❌ Ошибка получения позиции:', err);
                return res.status(500).json({ error: 'Ошибка сервера' });
              }

              const position = (result.max_position || 0) + 1;

              if (position > event.max_queue_size) {
                return res.status(400).json({ error: 'Очередь заполнена' });
              }

              db.run(
                'INSERT INTO queues (event_id, user_id, position, status) VALUES (?, ?, ?, ?)',
                [eventId, userId, position, 'waiting'],
                function (err) {
                  if (err) {
                    console.error('❌ Ошибка добавления в очередь:', err);
                    return res.status(500).json({ error: 'Ошибка добавления в очередь' });
                  }

                  console.log('✅ Пользователь добавлен в очередь, позиция:', position);
                  res.status(201).json({
                    id: this.lastID,
                    event_id: eventId,
                    user_id: userId,
                    position,
                    status: 'waiting',
                    message: 'Вы успешно встали в очередь',
                  });
                }
              );
            }
          );
        });
      }
    );
  },

  // Покинуть очередь
  leaveQueue: (req, res) => {
    const { entryId } = req.params;
    const userId = req.user.id;
    console.log('➖ Пользователь', userId, 'покидает очередь', entryId);

    db.get('SELECT * FROM queues WHERE id = ?', [entryId], (err, entry) => {
      if (err) {
        console.error('❌ Ошибка получения записи:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!entry) {
        return res.status(404).json({ error: 'Запись в очереди не найдена' });
      }

      if (entry.user_id !== userId) {
        return res.status(403).json({ error: 'Нет доступа' });
      }

      db.run('DELETE FROM queues WHERE id = ?', [entryId], (err) => {
        if (err) {
          console.error('❌ Ошибка удаления из очереди:', err);
          return res.status(500).json({ error: 'Ошибка удаления из очереди' });
        }

        db.run(
          'UPDATE queues SET position = position - 1 WHERE event_id = ? AND position > ?',
          [entry.event_id, entry.position],
          (err) => {
            if (err) {
              console.error('❌ Ошибка обновления позиций:', err);
            }
            console.log('✅ Пользователь покинул очередь');
            res.json({ message: 'Вы покинули очередь' });
          }
        );
      });
    });
  },

  // Поставить на паузу
  pauseQueue: (req, res) => {
    const { entryId } = req.params;
    const userId = req.user.id;
    console.log('⏸️ Пауза очереди', entryId);

    db.get('SELECT * FROM queues WHERE id = ?', [entryId], (err, entry) => {
      if (err) {
        console.error('❌ Ошибка получения записи:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!entry) {
        return res.status(404).json({ error: 'Запись в очереди не найдена' });
      }

      if (entry.user_id !== userId) {
        return res.status(403).json({ error: 'Нет доступа' });
      }

      db.run('UPDATE queues SET is_paused = 1 WHERE id = ?', [entryId], (err) => {
        if (err) {
          console.error('❌ Ошибка паузы:', err);
          return res.status(500).json({ error: 'Ошибка паузы' });
        }

        console.log('✅ Очередь поставлена на паузу');
        res.json({ message: 'Очередь поставлена на паузу' });
      });
    });
  },

  // Возобновить
  resumeQueue: (req, res) => {
    const { entryId } = req.params;
    const userId = req.user.id;
    console.log('▶️ Возобновление очереди', entryId);

    db.get('SELECT * FROM queues WHERE id = ?', [entryId], (err, entry) => {
      if (err) {
        console.error('❌ Ошибка получения записи:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!entry) {
        return res.status(404).json({ error: 'Запись в очереди не найдена' });
      }

      if (entry.user_id !== userId) {
        return res.status(403).json({ error: 'Нет доступа' });
      }

      db.run('UPDATE queues SET is_paused = 0 WHERE id = ?', [entryId], (err) => {
        if (err) {
          console.error('❌ Ошибка возобновления:', err);
          return res.status(500).json({ error: 'Ошибка возобновления' });
        }

        console.log('✅ Очередь возобновлена');
        res.json({ message: 'Очередь возобновлена' });
      });
    });
  },

  // Получить мои очереди
  getMyQueues: (req, res) => {
    const userId = req.user.id;
    console.log('📋 Запрос очередей пользователя:', userId);

    db.all(
      `SELECT q.*, e.name as event_name, e.location, e.avg_service_time
       FROM queues q
       JOIN events e ON q.event_id = e.id
       WHERE q.user_id = ? AND q.status IN ('waiting', 'called')
       ORDER BY q.joined_at DESC`,
      [userId],
      (err, queues) => {
        if (err) {
          console.error('❌ Ошибка получения очередей:', err);
          return res.status(500).json({ error: 'Ошибка получения очередей' });
        }

        console.log('✅ Получены очереди пользователя, записей:', queues.length);
        res.json({ queues });
      }
    );
  },

  // Получить очереди пользователя по ID
  getUserQueues: (req, res) => {
    const { userId } = req.params;
    console.log('📋 Запрос очередей пользователя по ID:', userId);

    db.all(
      `SELECT q.*, e.name as event_name, e.location, e.avg_service_time
       FROM queues q
       JOIN events e ON q.event_id = e.id
       WHERE q.user_id = ? AND q.status IN ('waiting', 'called')
       ORDER BY q.joined_at DESC`,
      [userId],
      (err, queues) => {
        if (err) {
          console.error('❌ Ошибка получения очередей:', err);
          return res.status(500).json({ error: 'Ошибка получения очередей' });
        }

        console.log('✅ Получены очереди, записей:', queues.length);
        res.json({ queues });
      }
    );
  },
};

module.exports = queueController;