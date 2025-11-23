const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');

// Получить сообщения поддержки для конкретного пользователя
router.get('/messages/:userId', authMiddleware, supportController.getSupportMessages);

// Отправить сообщение в поддержку (от пользователя)
router.post('/messages', authMiddleware, supportController.sendSupportMessage);

// Отправить ответ от админа
router.post('/admin/reply', authMiddleware, supportController.sendAdminReply);

// Получить все разговоры (для админа)
router.get('/conversations', authMiddleware, supportController.getAllConversations);

// Получить количество непрочитанных
router.get('/unread/:userId', authMiddleware, supportController.getUnreadCount);

// Отметить сообщения как прочитанные
router.patch('/messages/:userId/read', authMiddleware, supportController.markAsRead);

module.exports = router;