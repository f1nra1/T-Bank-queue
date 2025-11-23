const db = require('../config/database');

const supportController = {
  // Получить сообщения поддержки для конкретного пользователя
  getSupportMessages: (req, res) => {
    const { userId } = req.params;

    console.log('💬 Получение сообщений поддержки для пользователя:', userId);

    db.all(
      `SELECT sm.*,
              u.name as sender_name,
              u.email as sender_email
       FROM support_messages sm
       LEFT JOIN users u ON sm.sender_id = u.id
       WHERE sm.user_id = ?
       ORDER BY sm.created_at ASC`,
      [userId],
      (err, messages) => {
        if (err) {
          console.error('❌ Ошибка получения сообщений поддержки:', err);
          return res.status(500).json({ error: 'Ошибка получения сообщений' });
        }

        console.log(`✅ Получено сообщений поддержки: ${messages.length}`);
        res.json({ messages });
      }
    );
  },

  // Отправить сообщение в поддержку (от пользователя)
  sendSupportMessage: (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // Из middleware

    console.log('📤 Отправка сообщения в поддержку от пользователя:', userId);

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    db.run(
      `INSERT INTO support_messages (user_id, sender_id, content, is_admin_message, is_read, created_at)
       VALUES (?, ?, ?, 0, 0, datetime('now'))`,
      [userId, userId, content.trim()],
      function (err) {
        if (err) {
          console.error('❌ Ошибка отправки сообщения в поддержку:', err);
          return res.status(500).json({ error: 'Ошибка отправки сообщения' });
        }

        const messageId = this.lastID;

        // Получаем созданное сообщение
        db.get(
          `SELECT sm.*,
                  u.name as sender_name,
                  u.email as sender_email
           FROM support_messages sm
           LEFT JOIN users u ON sm.sender_id = u.id
           WHERE sm.id = ?`,
          [messageId],
          (err, message) => {
            if (err) {
              return res.status(500).json({ error: 'Сообщение отправлено, но ошибка получения' });
            }

            console.log('✅ Сообщение в поддержку отправлено:', messageId);

            // Отправляем через WebSocket
            const io = req.app.get('io');
            io.emit('new-support-message', {
              userId: userId,
              senderId: userId,
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

  // Отправить ответ от админа
  sendAdminReply: (req, res) => {
    const { user_id, content } = req.body;
    const adminId = req.user.id;

    console.log('📤 Отправка ответа от админа пользователю:', user_id);

    if (!user_id || !content || !content.trim()) {
      return res.status(400).json({ error: 'user_id и content обязательны' });
    }

    db.run(
      `INSERT INTO support_messages (user_id, sender_id, content, is_admin_message, is_read, created_at)
       VALUES (?, ?, ?, 1, 0, datetime('now'))`,
      [user_id, adminId, content.trim()],
      function (err) {
        if (err) {
          console.error('❌ Ошибка отправки ответа админа:', err);
          return res.status(500).json({ error: 'Ошибка отправки ответа' });
        }

        const messageId = this.lastID;

        // Получаем созданное сообщение
        db.get(
          `SELECT sm.*,
                  u.name as sender_name,
                  u.email as sender_email
           FROM support_messages sm
           LEFT JOIN users u ON sm.sender_id = u.id
           WHERE sm.id = ?`,
          [messageId],
          (err, message) => {
            if (err) {
              return res.status(500).json({ error: 'Ответ отправлен, но ошибка получения' });
            }

            console.log('✅ Ответ админа отправлен:', messageId);

            // Отправляем через WebSocket
            const io = req.app.get('io');
            io.emit('new-support-message', {
              userId: user_id,
              senderId: adminId,
              message,
            });

            res.status(201).json({
              message: 'Ответ отправлен',
              data: message,
            });
          }
        );
      }
    );
  },

  // Получить все разговоры (для админа)
  getAllConversations: (req, res) => {
    console.log('💬 Получение всех разговоров поддержки для админа');

    db.all(
      `SELECT 
         u.id as user_id,
         u.name as user_name,
         u.email as user_email,
         (SELECT content FROM support_messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT created_at FROM support_messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
         (SELECT COUNT(*) FROM support_messages WHERE user_id = u.id AND is_admin_message = 0 AND is_read = 0) as unread_count
       FROM users u
       WHERE EXISTS (SELECT 1 FROM support_messages WHERE user_id = u.id)
       ORDER BY last_message_time DESC`,
      [],
      (err, conversations) => {
        if (err) {
          console.error('❌ Ошибка получения разговоров:', err);
          return res.status(500).json({ error: 'Ошибка получения разговоров' });
        }

        console.log(`✅ Получено разговоров: ${conversations.length}`);
        res.json({ conversations });
      }
    );
  },

  // Получить количество непрочитанных сообщений
  getUnreadCount: (req, res) => {
    const { userId } = req.params;

    console.log('🔔 Подсчет непрочитанных сообщений поддержки для пользователя:', userId);

    db.get(
      `SELECT COUNT(*) as count
       FROM support_messages
       WHERE user_id = ? AND is_admin_message = 1 AND is_read = 0`,
      [userId],
      (err, result) => {
        if (err) {
          console.error('❌ Ошибка подсчета непрочитанных:', err);
          return res.status(500).json({ error: 'Ошибка подсчета' });
        }

        console.log(`✅ Непрочитанных сообщений поддержки: ${result.count}`);
        res.json({ unread_count: result.count });
      }
    );
  },

  // Отметить сообщения как прочитанные
  markAsRead: (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    console.log('✅ Отметка сообщений как прочитанных для пользователя:', userId);

    // Если это админ, отмечаем сообщения от пользователя
    // Если это пользователь, отмечаем сообщения от админа
    const isAdmin = true; // TODO: Проверить роль из req.user

    const query = isAdmin
      ? 'UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND is_admin_message = 0 AND is_read = 0'
      : 'UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND is_admin_message = 1 AND is_read = 0';

    db.run(query, [userId], function (err) {
      if (err) {
        console.error('❌ Ошибка отметки прочитанных:', err);
        return res.status(500).json({ error: 'Ошибка отметки прочитанных' });
      }

      console.log(`✅ Отмечено как прочитанных: ${this.changes}`);
      res.json({ message: 'Сообщения отмечены как прочитанные', count: this.changes });
    });
  },
};

module.exports = supportController;