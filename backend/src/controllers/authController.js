const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
  // Регистрация
  register: async (req, res) => {
    const { name, email, phone, password } = req.body;
    console.log('📝 Попытка регистрации:', email);

    try {
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, hashedPassword, 'user'],
        function (err) {
          if (err) {
            console.error('❌ Ошибка создания пользователя:', err);
            if (err.message.includes('UNIQUE')) {
              return res.status(400).json({ error: 'Email уже используется' });
            }
            return res.status(500).json({ error: 'Ошибка создания пользователя' });
          }

          const token = jwt.sign(
            { id: this.lastID, email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
          );

          console.log('✅ Пользователь создан:', email);

          res.status(201).json({
            token,
            user: {
              id: this.lastID,
              email,
              name,
              phone: phone || null,
              role: 'user',
            },
          });
        }
      );
    } catch (error) {
      console.error('❌ Ошибка хеширования:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Вход
  login: (req, res) => {
    const { email, password } = req.body;
    console.log('🔐 Попытка входа:', email);

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error('❌ Ошибка БД:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (!user) {
          console.log('❌ Пользователь не найден');
          return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        try {
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            console.log('❌ Неверный пароль');
            return res.status(401).json({ error: 'Неверный email или пароль' });
          }

          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
          );

          console.log('✅ Вход успешен для:', email);

          res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone,
              role: user.role,
            },
          });
        } catch (error) {
          console.error('❌ Ошибка проверки пароля:', error);
          res.status(500).json({ error: 'Ошибка сервера' });
        }
      }
    );
  },
};

module.exports = authController;