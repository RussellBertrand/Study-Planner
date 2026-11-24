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
      bio TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrasi aman jika kolom bio / avatar belum ada di database lama
  try {
    await dbRun("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';");
  } catch (e) {}
  try {
    await dbRun("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT '';");
  } catch (e) {}

  // Tabel tasks (entitas tugas belajar)
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

  // Tabel schedules (entitas jadwal perkuliahan & studi mingguan)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT DEFAULT '',
      lecturer TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Tabel chat_messages (riwayat percakapan StudyMate AI)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sender TEXT NOT NULL CHECK(sender IN ('user', 'assistant')),
      message TEXT NOT NULL,
      action_data TEXT DEFAULT NULL,
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
      'INSERT INTO users (username, password_hash, name, role, bio) VALUES (?, ?, ?, ?, ?)',
      ['admin', adminPass, 'Pak Mentor Joy', 'admin', 'Mentor Akademik & Pembimbing Capstone Study Planner']
    );

    const resUser1 = await dbRun(
      'INSERT INTO users (username, password_hash, name, role, bio) VALUES (?, ?, ?, ?, ?)',
      ['budi', userPass1, 'Budi Santoso', 'user', 'Mahasiswa Teknik Informatika Angkatan 2024']
    );

    const resUser2 = await dbRun(
      'INSERT INTO users (username, password_hash, name, role, bio) VALUES (?, ?, ?, ?, ?)',
      ['siswa', userPass2, 'Siswa Rajin', 'user', 'Pembelajar Aktif & Pengembang Web/Mobile']
    );

    // Seed tasks untuk budi dan siswa
    const initialTasks = [
      {
        userId: resUser1.lastID,
        title: 'Laporan Praktikum CNN & Deep Learning',
        subject: 'Deep Learning',
        deadline: '2026-12-05',
        priority: 'High',
        status: 'in_progress',
      },
      {
        userId: resUser1.lastID,
        title: 'Implementasi Antarmuka Web JoyVis',
        subject: 'Web and Mobile Application Development',
        deadline: '2026-12-10',
        priority: 'High',
        status: 'pending',
      },
      {
        userId: resUser2.lastID,
        title: 'Analisis Ergonomi UI/UX Mobile',
        subject: 'Human-Computer Interaction',
        deadline: '2026-12-15',
        priority: 'Medium',
        status: 'pending',
      },
      {
        userId: resUser2.lastID,
        title: 'Review Jurnal Visual Perception',
        subject: 'Visual Perception',
        deadline: '2026-12-20',
        priority: 'Low',
        status: 'completed',
      },
      {
        userId: resUser2.lastID,
        title: 'Audit Keamanan Jaringan & Firewall Wireshark',
        subject: 'Data Communication & Network Security',
        deadline: '2026-12-08',
        priority: 'High',
        status: 'pending',
      },
    ];

    for (const t of initialTasks) {
      await dbRun(
        `INSERT INTO tasks (user_id, title, subject, deadline, priority, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [t.userId, t.title, t.subject, t.deadline, t.priority, t.status]
      );
    }

    // Seed schedules mingguan untuk siswa & admin
    const initialSchedules = [
      {
        userId: resUser2.lastID,
        title: 'Perkuliahan Deep Learning',
        subject: 'Deep Learning',
        day_of_week: 'Senin',
        start_time: '08:00',
        end_time: '10:30',
        room: 'Lab AI & Robotika',
        lecturer: 'Dr. Hendra Gunawan',
        notes: 'Membawa laptop & install PyTorch environment',
      },
      {
        userId: resUser2.lastID,
        title: 'Perkuliahan Visual Perception',
        subject: 'Visual Perception',
        day_of_week: 'Selasa',
        start_time: '13:00',
        end_time: '15:30',
        room: 'Ruang Teori 402',
        lecturer: 'Ir. Ratna Dewi, M.T.',
        notes: 'Materi segmentasi citra digital',
      },
      {
        userId: resUser2.lastID,
        title: 'Web & Mobile App Development',
        subject: 'Web and Mobile Application Development',
        day_of_week: 'Rabu',
        start_time: '09:30',
        end_time: '12:00',
        room: 'Lab Multimedia 1',
        lecturer: 'Dimas Wicaksono, M.Kom.',
        notes: 'Integrasi backend REST API dan frontend React/Expo',
      },
      {
        userId: resUser2.lastID,
        title: 'Human-Computer Interaction',
        subject: 'Human-Computer Interaction',
        day_of_week: 'Kamis',
        start_time: '10:00',
        end_time: '12:30',
        room: 'Studio Desain 2',
        lecturer: 'Nadia Putri, S.Ds., M.Sc.',
        notes: 'Review wireframe Figma & Usability Testing',
      },
      {
        userId: resUser2.lastID,
        title: 'Data Communication & Network Security',
        subject: 'Data Communication & Network Security',
        day_of_week: 'Jumat',
        start_time: '08:00',
        end_time: '10:30',
        room: 'Lab Jaringan Komputer',
        lecturer: 'Bambang Sudarsono, M.Kom.',
        notes: 'Praktikum paket data Wireshark',
      },
    ];

    for (const s of initialSchedules) {
      await dbRun(
        `INSERT INTO schedules (user_id, title, subject, day_of_week, start_time, end_time, room, lecturer, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.userId, s.title, s.subject, s.day_of_week, s.start_time, s.end_time, s.room, s.lecturer, s.notes]
      );
    }

    console.log('✅ Seed data users, tasks, dan schedules berhasil diinisialisasi.');
  }

  // Cek apakah tabel schedules sudah ada isinya untuk user yang sudah ada
  const scheduleCount = await dbGet('SELECT COUNT(*) as count FROM schedules');
  if (scheduleCount.count === 0) {
    const studentUser = await dbGet("SELECT id FROM users WHERE username = 'siswa'");
    if (studentUser) {
      const defaultSchedules = [
        {
          userId: studentUser.id,
          title: 'Perkuliahan Deep Learning',
          subject: 'Deep Learning',
          day_of_week: 'Senin',
          start_time: '08:00',
          end_time: '10:30',
          room: 'Lab AI & Robotika',
          lecturer: 'Dr. Hendra Gunawan',
          notes: 'Membawa laptop & install PyTorch',
        },
        {
          userId: studentUser.id,
          title: 'Perkuliahan Visual Perception',
          subject: 'Visual Perception',
          day_of_week: 'Selasa',
          start_time: '13:00',
          end_time: '15:30',
          room: 'Ruang Teori 402',
          lecturer: 'Ir. Ratna Dewi, M.T.',
          notes: 'Materi segmentasi citra',
        },
        {
          userId: studentUser.id,
          title: 'Web & Mobile App Development',
          subject: 'Web and Mobile Application Development',
          day_of_week: 'Rabu',
          start_time: '09:30',
          end_time: '12:00',
          room: 'Lab Multimedia 1',
          lecturer: 'Dimas Wicaksono, M.Kom.',
          notes: 'Integrasi backend REST API',
        },
        {
          userId: studentUser.id,
          title: 'Human-Computer Interaction',
          subject: 'Human-Computer Interaction',
          day_of_week: 'Kamis',
          start_time: '10:00',
          end_time: '12:30',
          room: 'Studio Desain 2',
          lecturer: 'Nadia Putri, S.Ds., M.Sc.',
          notes: 'Review wireframe Figma',
        },
        {
          userId: studentUser.id,
          title: 'Network Security',
          subject: 'Data Communication & Network Security',
          day_of_week: 'Jumat',
          start_time: '08:00',
          end_time: '10:30',
          room: 'Lab Jaringan Komputer',
          lecturer: 'Bambang Sudarsono, M.Kom.',
          notes: 'Praktikum Wireshark',
        },
      ];

      for (const s of defaultSchedules) {
        await dbRun(
          `INSERT INTO schedules (user_id, title, subject, day_of_week, start_time, end_time, room, lecturer, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.userId, s.title, s.subject, s.day_of_week, s.start_time, s.end_time, s.room, s.lecturer, s.notes]
        );
      }
    }
  }
};

export default db;
