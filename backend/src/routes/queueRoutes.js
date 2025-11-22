const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const authMiddleware = require('../middleware/authMiddleware');

// ВАЖНО: Статические маршруты должны быть ВЫШЕ динамических!

// Получить мои очереди (требуется авторизация)
router.get('/my', authMiddleware, queueController.getMyQueues);

// Получить очереди пользователя по ID
router.get('/user/:userId', queueController.getUserQueues);

// Получить очередь для события (публичный доступ)
router.get('/:eventId', queueController.getQueueByEvent);

// Встать в очередь
router.post('/:eventId/join', authMiddleware, queueController.joinQueue);

// Покинуть очередь
router.delete('/:entryId', authMiddleware, queueController.leaveQueue);

// Поставить на паузу
router.put('/:entryId/pause', authMiddleware, queueController.pauseQueue);

// Возобновить
router.put('/:entryId/resume', authMiddleware, queueController.resumeQueue);

module.exports = router;