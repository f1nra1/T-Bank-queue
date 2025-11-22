const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET /api/messages/:eventId - Получить все сообщения события
router.get('/:eventId', messageController.getEventMessages);

// POST /api/messages - Отправить сообщение
router.post('/', messageController.sendMessage);

// PATCH /api/messages/:messageId/read - Отметить как прочитанное
router.patch('/:messageId/read', messageController.markAsRead);

// GET /api/messages/unread/:userId - Получить количество непрочитанных
router.get('/unread/:userId', messageController.getUnreadCount);

module.exports = router;