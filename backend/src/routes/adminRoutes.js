const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Пользователи
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// События
router.get('/events/all', adminController.getAllEventsAdmin);
router.delete('/events/:id', adminController.deleteEvent);

// Очереди
router.get('/queues', adminController.getAllQueues);
router.delete('/queues/:id', adminController.deleteQueueEntry);
router.patch('/queues/:id/complete', adminController.completeQueueEntry);
router.patch('/queues/:id/skip', adminController.skipQueueEntry);

// Статистика
router.get('/stats', adminController.getStats);

module.exports = router;