const db = require('../config/database');

const adminController = {
  // Получить всех пользователей
  getAllUsers: (req, res) => {
    console.log('👥 Получение всех пользователей (admin)');

    db.all(
      `SELECT id, email, name, phone, role, created_at 
       FROM users 
       ORDER BY created_at DESC`,
      [],
      (err, users) => {
        if (err) {
          console.error('❌ Ошибка получения пользователей:', err);
          return res.status(500).json({ error: 'Ошибка получения пользователей' });
        }

        console.log(`✅ Получено пользователей: ${users.length}`);
        res.json({ users });
      }
    );
  },

  // Удалить пользователя
  deleteUser: (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Удаление пользователя:', id);

    db.serialize(() => {
      db.run('DELETE FROM queues WHERE user_id = ?', [id]);
      db.run('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [id, id]);
      db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('❌ Ошибка удаления пользователя:', err);
          return res.status(500).json({ error: 'Ошибка удаления пользователя' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Пользователь не найден' });
        }

        console.log('✅ Пользователь удален');
        res.json({ message: 'Пользователь удален' });
      });
    });
  },

  // Получить все события
  getAllEventsAdmin: (req, res) => {
    console.log('📋 Получение всех событий (admin)');

    db.all(
      'SELECT * FROM events ORDER BY created_at DESC',
      [],
      (err, events) => {
        if (err) {
          console.error('❌ Ошибка получения событий:', err);
          return res.status(500).json({ error: 'Ошибка получения событий' });
        }

        console.log(`✅ Получено событий: ${events.length}`);
        res.json({ events });
      }
    );
  },

  // Переключить активность события
  toggleEvent: (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    console.log('🔄 Переключение события:', id, 'active:', is_active);

    db.run(
      'UPDATE events SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id],
      function (err) {
        if (err) {
          console.error('❌ Ошибка обновления события:', err);
          return res.status(500).json({ error: 'Ошибка обновления' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Событие не найдено' });
        }

        console.log('✅ Статус события обновлен');
        res.json({ message: 'Статус обновлен' });
      }
    );
  },

  // Удалить событие
  deleteEvent: (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Удаление события:', id);

    db.serialize(() => {
      db.run('DELETE FROM queues WHERE event_id = ?', [id]);
      db.run('DELETE FROM messages WHERE event_id = ?', [id]);
      db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('❌ Ошибка удаления события:', err);
          return res.status(500).json({ error: 'Ошибка удаления события' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Событие не найдено' });
        }

        console.log('✅ Событие удалено');
        res.json({ message: 'Событие удалено' });
      });
    });
  },

  // Получить все очереди (только активные: waiting и called)
  getAllQueues: (req, res) => {
    console.log('📋 Получение всех очередей (admin)');

    db.all(
      `SELECT q.*, u.name as user_name, u.email as user_email, e.name as event_name
       FROM queues q
       JOIN users u ON q.user_id = u.id
       JOIN events e ON q.event_id = e.id
       WHERE q.status IN ('waiting', 'called')
       ORDER BY q.event_id, q.position`,
      [],
      (err, queues) => {
        if (err) {
          console.error('❌ Ошибка получения очередей:', err);
          return res.status(500).json({ error: 'Ошибка получения очередей' });
        }

        console.log(`✅ Получено записей очереди: ${queues.length}`);
        res.json({ queues });
      }
    );
  },

  // Удалить запись из очереди
  deleteQueueEntry: (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Удаление записи очереди:', id);

    db.run('DELETE FROM queues WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('❌ Ошибка удаления:', err);
        return res.status(500).json({ error: 'Ошибка удаления' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      console.log('✅ Запись удалена');
      res.json({ message: 'Запись удалена' });
    });
  },

  // Вызвать (статус waiting -> called)
  callQueueEntry: (req, res) => {
    const { id } = req.params;
    console.log('📢 Вызов в очереди:', id);

    db.run(
      'UPDATE queues SET status = "called" WHERE id = ?',
      [id],
      function (err) {
        if (err) {
          console.error('❌ Ошибка:', err);
          return res.status(500).json({ error: 'Ошибка обновления' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Запись не найдена' });
        }

        console.log('✅ Пользователь вызван');
        res.json({ message: 'Пользователь вызван' });
      }
    );
  },

  // Завершить обслуживание (удаляет запись + увеличивает счётчик)
  completeQueueEntry: (req, res) => {
    const { id } = req.params;
    console.log('✅ Завершение обслуживания:', id);

    // Сначала меняем статус на completed, потом удаляем
    db.run(
      'UPDATE queues SET status = "completed" WHERE id = ?',
      [id],
      function (err) {
        if (err) {
          console.error('❌ Ошибка:', err);
          return res.status(500).json({ error: 'Ошибка обновления' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Запись не найдена' });
        }

        console.log('✅ Обслуживание завершено, запись помечена как completed');
        res.json({ message: 'Обслуживание завершено' });
      }
    );
  },

  // Пропустить в очереди
  skipQueueEntry: (req, res) => {
    const { id } = req.params;
    console.log('⏭️ Пропуск в очереди:', id);

    db.get('SELECT * FROM queues WHERE id = ?', [id], (err, entry) => {
      if (err || !entry) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      db.get(
        'SELECT MAX(position) as max_pos FROM queues WHERE event_id = ?',
        [entry.event_id],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка' });
          }

          const newPosition = (result.max_pos || 0) + 1;

          db.run(
            'UPDATE queues SET position = ?, status = "waiting" WHERE id = ?',
            [newPosition, id],
            function (err) {
              if (err) {
                return res.status(500).json({ error: 'Ошибка обновления' });
              }

              console.log('✅ Позиция обновлена');
              res.json({ message: 'Участник перемещен в конец очереди' });
            }
          );
        }
      );
    });
  },

  // Статистика
  getStats: (req, res) => {
    console.log('📊 Получение статистики (admin)');

    const stats = {};

    db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
      stats.totalUsers = result?.count || 0;

      db.get('SELECT COUNT(*) as count FROM events', [], (err, result) => {
        stats.totalEvents = result?.count || 0;

        db.get(
          'SELECT COUNT(*) as count FROM queues WHERE status IN ("waiting", "called")',
          [],
          (err, result) => {
            stats.activeQueues = result?.count || 0;

            db.get(
              'SELECT COUNT(*) as count FROM queues WHERE status = "completed"',
              [],
              (err, result) => {
                stats.completedServices = result?.count || 0;

                db.get('SELECT COUNT(*) as count FROM messages', [], (err, result) => {
                  stats.totalMessages = result?.count || 0;

                  console.log('✅ Статистика получена:', stats);
                  res.json(stats);
                });
              }
            );
          }
        );
      });
    });
  },
};

module.exports = adminController;