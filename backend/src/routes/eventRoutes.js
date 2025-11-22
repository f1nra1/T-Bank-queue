const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /api/events - Получить все активные события
router.get('/', eventController.getAllEvents);

// GET /api/events/:id - Получить событие по ID
router.get('/:id', eventController.getEventById);

// POST /api/events - Создать событие (admin)
router.post('/', eventController.createEvent);

// PATCH /api/events/:id - Обновить событие (admin)
router.patch('/:id', eventController.updateEvent);

// DELETE /api/events/:id - Удалить событие (admin)
router.delete('/:id', eventController.deleteEvent);

module.exports = router;