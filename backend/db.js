import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

sqlite3.verbose();

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal menghubungkan database SQLite:', err.message);
  } else {
    console.log('✅ Terhubung ke database SQLite:', dbPath);
  }
});

// Helper wrapper untuk query promise-based
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Inisialisasi Tabel dan Seed Data
export const initDb = async () => {
  // Foreign Keys ON
  await dbRun('PRAGMA foreign_keys = ON;');

  // Tabel users
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabel tasks (entitas utama: tugas belajar mahasiswa)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      deadline TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('High', 'Medium', 'Low')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Cek apakah tabel users sudah ada isinya
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('🌱 Menjalankan Seeding Data Awal...');

    const saltRounds = 10;
    const adminPass = await bcrypt.hash('admin123', saltRounds);
    const userPass1 = await bcrypt.hash('321', saltRounds);
    const userPass2 = await bcrypt.hash('siswa123', saltRounds);

    const resAdmin = await dbRun(
      'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
      ['admin', adminPass, 'Pak Mentor Joy', 'admin']
    );

    const resUser1 = await dbRun(
      'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
      ['budi', userPass1, 'Budi Santoso', 'user']
    );

    const resUser2 = await dbRun(
      'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
      ['siswa', userPass2, 'Siswa Rajin', 'user']
    );

    // Seed tasks untuk budi (resUser1.lastID) dan siswa (resUser2.lastID)
    const initialTasks = [
      {
        userId: resUser1.lastID,
        title: 'Laporan Praktikum CNN & Deep Learning',
        subject: 'Deep Learning',
        deadline: '2026-10-05',
        priority: 'High',
        status: 'in_progress',
      },
      {
        userId: resUser1.lastID,
        title: 'Implementasi Antarmuka Web JoyVis',
        subject: 'Web and Mobile Application Development',
        deadline: '2026-10-10',
        priority: 'High',
        status: 'pending',
      },
      {
        userId: resUser2.lastID,
        title: 'Analisis Ergonomi UI/UX',
        subject: 'Human-Computer Interaction',
        deadline: '2026-10-15',
        priority: 'Medium',
        status: 'pending',
      },
      {
        userId: resUser2.lastID,
        title: 'Review Jurnal Visual Perception',
        subject: 'Visual Perception',
        deadline: '2026-10-20',
        priority: 'Low',
        status: 'completed',
      },
    ];

    for (const t of initialTasks) {
      await dbRun(
        `INSERT INTO tasks (user_id, title, subject, deadline, priority, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [t.userId, t.title, t.subject, t.deadline, t.priority, t.status]
      );
    }

    console.log('✅ Seed data berhasil dimasukkan ke SQLite.');
  }
};

export default db;
