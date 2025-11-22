const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
  // Регистрация
  register: async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;

      console.log('📝 Попытка регистрации:', email);

      // Проверка обязательных полей
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Email, пароль и имя обязательны',
        });
      }

      // Проверка длины пароля
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Пароль должен быть минимум 6 символов',
        });
      }

      // Проверка существования пользователя
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error('❌ Ошибка БД:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (user) {
          return res.status(400).json({
            error: 'Пользователь с таким email уже существует',
          });
        }

        // Хешируем пароль
        const passwordHash = await bcrypt.hash(password, 10);

        // Создаем пользователя
        db.run(
          'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
          [email, passwordHash, name, phone || null],
          function (err) {
            if (err) {
              console.error('❌ Ошибка создания пользователя:', err);
              return res.status(500).json({ error: 'Ошибка создания пользователя' });
            }

            const userId = this.lastID;

            // Генерируем JWT токен
            const token = jwt.sign(
              { userId, email, role: 'user' },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            console.log('✅ Пользователь зарегистрирован:', email);

            res.status(201).json({
              message: 'Регистрация успешна',
              token,
              user: {
                id: userId,
                email,
                name,
                phone,
                role: 'user',
              },
            });
          }
        );
      });
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Вход
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log('🔐 Попытка входа:', email);

      // Проверка обязательных полей
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email и пароль обязательны',
        });
      }

      // Поиск пользователя
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error('❌ Ошибка БД:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (!user) {
          return res.status(401).json({
            error: 'Неверный email или пароль',
          });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
          return res.status(401).json({
            error: 'Неверный email или пароль',
          });
        }

        // Генерируем JWT токен
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log('✅ Вход выполнен:', email);

        res.json({
          message: 'Вход выполнен успешно',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
          },
        });
      });
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Получить текущего пользователя
  getCurrentUser: async (req, res) => {
    try {
      // Здесь будет middleware для проверки токена
      // Пока просто заглушка
      res.json({ message: 'Endpoint для получения текущего пользователя' });
    } catch (error) {
      console.error('❌ Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = authController;