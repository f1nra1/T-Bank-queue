const db = require('../config/database');

const messageController = {
  // Получить все сообщения события
  getEventMessages: (req, res) => {
    const { eventId } = req.params;
    const { limit = 50 } = req.query;

    console.log('💬 Получение сообщений события:', eventId);

    db.all(
      `SELECT m.*, 
              u.name as sender_name,
              u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.event_id = ?
       ORDER BY m.created_at DESC
       LIMIT ?`,
      [eventId, parseInt(limit)],
      (err, messages) => {
        if (err) {
          console.error('❌ Ошибка получения сообщений:', err);
          return res.status(500).json({ error: 'Ошибка получения сообщений' });
        }

        // Сортируем в правильном порядке (старые -> новые)
        const sortedMessages = messages.reverse();

        console.log(`✅ Получено сообщений: ${messages.length}`);
        res.json({ messages: sortedMessages });
      }
    );
  },

  // Отправить сообщение
  sendMessage: (req, res) => {
    const { sender_id, receiver_id, event_id, content } = req.body;

    console.log('📤 Отправка сообщения от пользователя:', sender_id);

    if (!sender_id || !event_id || !content) {
      return res.status(400).json({
        error: 'sender_id, event_id и content обязательны',
      });
    }

    if (!content.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    db.run(
      `INSERT INTO messages (sender_id, receiver_id, event_id, content, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, datetime('now'))`,
      [sender_id, receiver_id || null, event_id, content.trim()],
      function (err) {
        if (err) {
          console.error('❌ Ошибка отправки сообщения:', err);
          return res.status(500).json({ error: 'Ошибка отправки сообщения' });
        }

        const messageId = this.lastID;

        // Получаем созданное сообщение
        db.get(
          `SELECT m.*,
                  u.name as sender_name,
                  u.email as sender_email
           FROM messages m
           JOIN users u ON m.sender_id = u.id
           WHERE m.id = ?`,
          [messageId],
          (err, message) => {
            if (err) {
              return res.status(500).json({ error: 'Сообщение отправлено, но ошибка получения' });
            }

            console.log('✅ Сообщение отправлено:', messageId);

            // Отправляем через WebSocket всем подключенным
            const io = req.app.get('io');
            io.emit('new-message', {
              eventId: event_id,
              message,
            });

            res.status(201).json({
              message: 'Сообщение отправлено',
              data: message,
            });
          }
        );
      }
    );
  },

  // Отметить сообщение как прочитанное
  markAsRead: (req, res) => {
    const { messageId } = req.params;

    console.log('✅ Отметка сообщения как прочитанного:', messageId);

    db.run(
      'UPDATE messages SET is_read = 1 WHERE id = ?',
      [messageId],
      function (err) {
        if (err) {
          console.error('❌ Ошибка обновления:', err);
          return res.status(500).json({ error: 'Ошибка обновления' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Сообщение не найдено' });
        }

        console.log('✅ Сообщение отмечено как прочитанное');
        res.json({ message: 'Сообщение отмечено как прочитанное' });
      }
    );
  },

  // Получить количество непрочитанных сообщений
  getUnreadCount: (req, res) => {
    const { userId } = req.params;

    console.log('🔔 Подсчет непрочитанных для пользователя:', userId);

    db.get(
      `SELECT COUNT(*) as count
       FROM messages
       WHERE receiver_id = ? AND is_read = 0`,
      [userId],
      (err, result) => {
        if (err) {
          console.error('❌ Ошибка подсчета:', err);
          return res.status(500).json({ error: 'Ошибка подсчета' });
        }

        console.log(`✅ Непрочитанных сообщений: ${result.count}`);
        res.json({ unread_count: result.count });
      }
    );
  },
};

module.exports = messageController;