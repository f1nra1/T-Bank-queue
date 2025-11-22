const db = require('../config/database');

const eventController = {
  // Получить все активные события
  getAllEvents: (req, res) => {
    console.log('📋 Запрос всех событий');

    db.all(
      'SELECT * FROM events WHERE is_active = 1 ORDER BY created_at DESC',
      [],
      (err, events) => {
        if (err) {
          console.error('❌ Ошибка получения событий:', err);
          return res.status(500).json({ error: 'Ошибка получения событий' });
        }

        console.log(`✅ Найдено событий: ${events.length}`);
        res.json({ events });
      }
    );
  },

  // Получить событие по ID
  getEventById: (req, res) => {
    const { id } = req.params;
    console.log('🔍 Запрос события:', id);

    db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
      if (err) {
        console.error('❌ Ошибка получения события:', err);
        return res.status(500).json({ error: 'Ошибка получения события' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Событие не найдено' });
      }

      console.log('✅ Событие найдено:', event.name);
      res.json({ event });
    });
  },

  // Создать событие
  createEvent: (req, res) => {
    const { name, description, location, avg_service_time, max_queue_size } = req.body;

    console.log('➕ Создание события:', name);

    if (!name) {
      return res.status(400).json({ error: 'Название события обязательно' });
    }

    db.run(
      `INSERT INTO events (name, description, location, avg_service_time, max_queue_size, is_active) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        name,
        description || '',
        location || '',
        avg_service_time || 5,
        max_queue_size || 100,
      ],
      function (err) {
        if (err) {
          console.error('❌ Ошибка создания события:', err);
          return res.status(500).json({ error: 'Ошибка создания события' });
        }

        const eventId = this.lastID;

        // Получаем созданное событие
        db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
          if (err) {
            return res.status(500).json({ error: 'Событие создано, но ошибка получения данных' });
          }

          console.log('✅ Событие создано:', event.name);
          res.status(201).json({
            message: 'Событие создано успешно',
            event,
          });
        });
      }
    );
  },

  // Обновить событие
  updateEvent: (req, res) => {
    const { id } = req.params;
    const { name, description, location, avg_service_time, max_queue_size, is_active } = req.body;

    console.log('📝 Обновление события:', id);

    db.run(
      `UPDATE events 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           location = COALESCE(?, location),
           avg_service_time = COALESCE(?, avg_service_time),
           max_queue_size = COALESCE(?, max_queue_size),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, description, location, avg_service_time, max_queue_size, is_active, id],
      function (err) {
        if (err) {
          console.error('❌ Ошибка обновления события:', err);
          return res.status(500).json({ error: 'Ошибка обновления события' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Событие не найдено' });
        }

        db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
          if (err) {
            return res.status(500).json({ error: 'Событие обновлено, но ошибка получения данных' });
          }

          console.log('✅ Событие обновлено:', event.name);
          res.json({
            message: 'Событие обновлено',
            event,
          });
        });
      }
    );
  },

  // Удалить событие (мягкое удаление - is_active = 0)
  deleteEvent: (req, res) => {
    const { id } = req.params;

    console.log('🗑️ Удаление события:', id);

    db.run('UPDATE events SET is_active = 0 WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('❌ Ошибка удаления события:', err);
        return res.status(500).json({ error: 'Ошибка удаления события' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Событие не найдено' });
      }

      console.log('✅ Событие удалено (деактивировано)');
      res.json({ message: 'Событие удалено' });
    });
  },
};

module.exports = eventController;