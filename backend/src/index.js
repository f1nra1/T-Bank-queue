const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS настройки - ВАЖНО!
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Socket.IO с CORS
const io = socketIo(server, {
  cors: corsOptions,
});

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Маршруты
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const queueRoutes = require('./routes/queueRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'T-Bank Queue API' });
});

// WebSocket обработчики
io.on('connection', (socket) => {
  console.log('🔌 Новое подключение:', socket.id);

  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`👤 Пользователь присоединился к событию ${eventId}`);
  });

  socket.on('leave-event', (eventId) => {
    socket.leave(`event-${eventId}`);
    console.log(`👤 Пользователь покинул событие ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Отключение:', socket.id);
  });
});

// Экспортируем io для использования в других модулях
app.set('io', io);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});