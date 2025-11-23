const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath);

// Инициализация таблиц
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица событий
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      avg_service_time INTEGER DEFAULT 5,
      max_queue_size INTEGER DEFAULT 100,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица очередей
  db.run(`
    CREATE TABLE IF NOT EXISTS queues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      status TEXT DEFAULT 'waiting',
      is_paused BOOLEAN DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      called_at DATETIME,
      completed_at DATETIME,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Таблица сообщений чата
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Таблица сообщений поддержки (пользователь <-> админ)
  db.run(`
    CREATE TABLE IF NOT EXISTS support_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_admin_message INTEGER DEFAULT 0,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Индексы для support_messages
  db.run('CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at)');
  db.run('CREATE INDEX IF NOT EXISTS idx_support_messages_is_read ON support_messages(is_read)');

  console.log('✅ База данных инициализирована');
});

module.exports = db;