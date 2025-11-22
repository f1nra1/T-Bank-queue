const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');

// Создаем подключение к БД
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  } else {
    console.log('✅ Подключено к SQLite базе данных');
    initDatabase();
  }
});

// Инициализация таблиц
function initDatabase() {
  db.serialize(() => {
    // Таблица пользователей
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        telegram_id TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Ошибка создания таблицы users:', err.message);
      } else {
        console.log('✅ Таблица users готова');
      }
    });

    // Таблица событий/активностей
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        avg_service_time INTEGER DEFAULT 5,
        max_queue_size INTEGER DEFAULT 100,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Ошибка создания таблицы events:', err.message);
      } else {
        console.log('✅ Таблица events готова');
      }
    });

    // Таблица очереди
    db.run(`
      CREATE TABLE IF NOT EXISTS queue_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        status TEXT DEFAULT 'waiting',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notified_at DATETIME,
        can_return_until DATETIME,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Ошибка создания таблицы queue_entries:', err.message);
      } else {
        console.log('✅ Таблица queue_entries готова');
      }
    });
  });
}

module.exports = db;