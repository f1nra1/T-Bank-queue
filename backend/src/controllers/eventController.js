const db = require('../config/database');

const eventController = {
  // Получить все события
  getEvents: (req, res) => {
    console.log('📋 Запрос всех событий');
    
    db.all('SELECT * FROM events ORDER BY created_at DESC', [], (err, events) => {
      if (err) {
        console.error('❌ Ошибка получения событий:', err);
        return res.status(500).json({ error: 'Ошибка получения событий' });
      }
      
      console.log('✅ Найдено событий:', events.length);
      res.json(events);
    });
  },

  // Получить событие по ID
  getEventById: (req, res) => {
    const { id } = req.params;
    console.log('📋 Запрос события по ID:', id);
    
    db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
      if (err) {
        console.error('❌ Ошибка получения события:', err);
        return res.status(500).json({ error: 'Ошибка получения события' });
      }
      
      if (!event) {
        console.log('❌ Событие не найдено, ID:', id);
        return res.status(404).json({ error: 'Событие не найдено' });
      }
      
      console.log('✅ Событие найдено:', event.name);
      res.json(event);
    });
  },

  // Создать событие
  createEvent: (req, res) => {
    const { name, description, location, avg_service_time, max_queue_size } = req.body;
    console.log('➕ Создание события:', name);
    
    db.run(
      'INSERT INTO events (name, description, location, avg_service_time, max_queue_size, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [name, description, location, avg_service_time || 5, max_queue_size || 100],
      function (err) {
        if (err) {
          console.error('❌ Ошибка создания события:', err);
          return res.status(500).json({ error: 'Ошибка создания события' });
        }
        
        console.log('✅ Событие создано, ID:', this.lastID);
        res.status(201).json({
          id: this.lastID,
          name,
          description,
          location,
          avg_service_time: avg_service_time || 5,
          max_queue_size: max_queue_size || 100,
          is_active: 1,
        });
      }
    );
  },

  // Обновить событие
  updateEvent: (req, res) => {
    const { id } = req.params;
    const { name, description, location, avg_service_time, max_queue_size, is_active } = req.body;
    console.log('✏️ Обновление события:', id);
    
    db.run(
      'UPDATE events SET name = ?, description = ?, location = ?, avg_service_time = ?, max_queue_size = ?, is_active = ? WHERE id = ?',
      [name, description, location, avg_service_time, max_queue_size, is_active, id],
      function (err) {
        if (err) {
          console.error('❌ Ошибка обновления события:', err);
          return res.status(500).json({ error: 'Ошибка обновления события' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Событие не найдено' });
        }
        
        console.log('✅ Событие обновлено');
        res.json({ message: 'Событие обновлено' });
      }
    );
  },

  // Удалить событие
  deleteEvent: (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Удаление события:', id);
    
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
  },
};

module.exports = eventController;