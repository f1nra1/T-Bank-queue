const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Получить все события
router.get('/', eventController.getEvents);

// Получить событие по ID - ВАЖНО: должен быть ПОСЛЕ '/'
router.get('/:id', eventController.getEventById);

// Создать событие
router.post('/', eventController.createEvent);

// Обновить событие
router.put('/:id', eventController.updateEvent);

// Удалить событие
router.delete('/:id', eventController.deleteEvent);

module.exports = router;