const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// GET /api/queue/:eventId - Получить очередь для события
router.get('/:eventId', queueController.getQueue);

// POST /api/queue/join/:eventId - Встать в очередь
router.post('/join/:eventId', queueController.joinQueue);

// DELETE /api/queue/leave/:entryId - Покинуть очередь
router.delete('/leave/:entryId', queueController.leaveQueue);

// PATCH /api/queue/:entryId/pause - Временно покинуть (пауза)
router.patch('/:entryId/pause', queueController.pauseQueue);

// PATCH /api/queue/:entryId/resume - Вернуться в очередь
router.patch('/:entryId/resume', queueController.resumeQueue);

// PATCH /api/queue/:entryId/complete - Завершить обслуживание (admin)
router.patch('/:entryId/complete', queueController.completeService);

// GET /api/queue/user/:userId - Получить очереди пользователя
router.get('/user/:userId', queueController.getUserQueues);

module.exports = router;