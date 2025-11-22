const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const authMiddleware = require('../middleware/authMiddleware');

// Получить очередь для события (публичный доступ)
router.get('/:eventId', queueController.getQueueByEvent);

// Встать в очередь (требуется авторизация)
router.post('/:eventId/join', authMiddleware, queueController.joinQueue);

// Покинуть очередь (требуется авторизация)
router.delete('/:queueId', authMiddleware, queueController.leaveQueue);

// Поставить на паузу (требуется авторизация)
router.put('/:queueId/pause', authMiddleware, queueController.pauseQueue);

// Возобновить (требуется авторизация)
router.put('/:queueId/resume', authMiddleware, queueController.resumeQueue);

// Получить мои очереди (требуется авторизация)
router.get('/my', authMiddleware, queueController.getMyQueues);

module.exports = router;