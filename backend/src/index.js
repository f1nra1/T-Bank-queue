const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./config/database'); // Добавили подключение к БД

// Загружаем переменные окружения
dotenv.config();

const app = express();
const server = http.createServer(app);

// Настройка Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware - CORS должен быть ПЕРВЫМ!
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Базовый роут для проверки
app.get('/', (req, res) => {
  console.log('✅ Получен запрос на /');
  res.json({
    message: '🎯 Queue Management System API',
    status: 'running',
    version: '1.0.0',
    database: 'SQLite',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Получен запрос на /api/health');
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Подключаем роуты
const authRoutes = require('./routes/authRoutes');

// Роуты авторизации
app.use('/api/auth', authRoutes);

// WebSocket подключения
io.on('connection', (socket) => {
  console.log('✅ Новый клиент подключен:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Клиент отключен:', socket.id);
  });

  socket.on('test', (data) => {
    console.log('📨 Получено сообщение:', data);
    socket.emit('test-response', { message: 'Сервер получил ваше сообщение!' });
  });
});

// Сохраняем io в app
app.set('io', io);

// 404 handler
app.use((req, res) => {
  console.log('❌ 404:', req.path);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket ready`);
  console.log(`💾 Database: SQLite initialized`);
  console.log('🚀 ========================================\n');
});