const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Регистрация
router.post('/register', authController.register);

// POST /api/auth/login - Вход
router.post('/login', authController.login);

// GET /api/auth/me - Получить текущего пользователя (требует токен)
router.get('/me', authController.getCurrentUser);

module.exports = router;