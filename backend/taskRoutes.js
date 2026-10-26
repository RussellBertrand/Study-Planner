import express from 'express';
import { dbAll, dbGet, dbRun } from './db.js';
import { authenticateToken } from './middleware.js';

const router = express.Router();

// Terapkan proteksi autentikasi ke semua rute tasks
router.use(authenticateToken);

/**
 * GET /api/tasks
 * - Role Admin: Mengambil semua tugas dari seluruh mahasiswa/user
 * - Role User: Hanya mengambil tugas milik dirinya sendiri
 */
router.get('/', async (req, res) => {
  try {
    const { priority, status } = req.query;
    let sql = '';
    let params = [];

    if (req.user.role === 'admin') {
      sql = `
        SELECT t.*, u.name as user_name, u.username as user_username
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
      `;
    } else {
      sql = `
        SELECT t.*, u.name as user_name, u.username as user_username
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ?
      `;
      params.push(req.user.id);
    }

    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.deadline ASC, t.id DESC';

    const tasks = await dbAll(sql, params);
    return res.json({ tasks });
  } catch (error) {
    console.error('Error saat mengambil daftar tasks:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * GET /api/tasks/:id
 * - Mengambil detail satu task (Admin bebas akses, User hanya task miliknya)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await dbGet(
      `SELECT t.*, u.name as user_name, u.username as user_username
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak ke data tugas ini.' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Error saat mengambil detail task:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * POST /api/tasks
 * - Membuat tugas baru.
 * - Siswa/User membuat tugas untuk dirinya sendiri.
 * - Admin juga bisa membuat tugas (dapat menentukan target_user_id jika diinginkan).
 */
router.post('/', async (req, res) => {
  try {
    const { title, subject, deadline, priority = 'Medium', status = 'pending', target_user_id } = req.body;

    if (!title || !subject || !deadline) {
      return res.status(400).json({ message: 'Judul tugas, mata kuliah, dan deadline wajib diisi.' });
    }

    if (!['High', 'Medium', 'Low'].includes(priority)) {
      return res.status(400).json({ message: 'Prioritas harus salah satu dari: High, Medium, Low.' });
    }

    let assignedUserId = req.user.id;
    if (req.user.role === 'admin' && target_user_id) {
      assignedUserId = target_user_id;
    }

    const result = await dbRun(
      `INSERT INTO tasks (user_id, title, subject, deadline, priority, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [assignedUserId, title, subject, deadline, priority, status]
    );

    const createdTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Tugas berhasil dibuat.',
      task: createdTask,
    });
  } catch (error) {
    console.error('Error saat membuat task:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * PUT /api/tasks/:id
 * - Memperbarui task
 * - Admin bisa mengedit task siapa pun (misal: memberikan review / update status)
 * - User hanya bisa mengedit task milik dirinya sendiri
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, deadline, priority, status } = req.body;

    const existingTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existingTask) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    // Cek otorisasi
    if (req.user.role !== 'admin' && existingTask.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak untuk mengedit tugas ini.' });
    }

    const updatedTitle = title !== undefined ? title : existingTask.title;
    const updatedSubject = subject !== undefined ? subject : existingTask.subject;
    const updatedDeadline = deadline !== undefined ? deadline : existingTask.deadline;
    const updatedPriority = priority !== undefined ? priority : existingTask.priority;
    const updatedStatus = status !== undefined ? status : existingTask.status;

    await dbRun(
      `UPDATE tasks
       SET title = ?, subject = ?, deadline = ?, priority = ?, status = ?
       WHERE id = ?`,
      [updatedTitle, updatedSubject, updatedDeadline, updatedPriority, updatedStatus, id]
    );

    const updatedTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);

    return res.json({
      message: 'Tugas berhasil diperbarui.',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error saat memperbarui task:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * DELETE /api/tasks/:id
 * - Menghapus task
 * - Admin bisa menghapus tugas mana pun
 * - User hanya bisa menghapus tugas miliknya
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existingTask) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && existingTask.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak untuk menghapus tugas ini.' });
    }

    await dbRun('DELETE FROM tasks WHERE id = ?', [id]);

    return res.json({ message: 'Tugas berhasil dihapus.' });
  } catch (error) {
    console.error('Error saat menghapus task:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
