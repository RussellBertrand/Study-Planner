import express from 'express';
import { dbAll, dbGet, dbRun } from './db.js';
import { authenticateToken } from './middleware.js';

const router = express.Router();

router.use(authenticateToken);

const VALID_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/**
 * GET /api/schedules
 * - Role Admin: Mengambil seluruh jadwal
 * - Role User: Mengambil jadwal miliknya
 */
router.get('/', async (req, res) => {
  try {
    const { day } = req.query;
    let sql = '';
    let params = [];

    if (req.user.role === 'admin') {
      sql = `
        SELECT s.*, u.name as user_name, u.username as user_username
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;
    } else {
      sql = `
        SELECT s.*, u.name as user_name, u.username as user_username
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
      `;
      params.push(req.user.id);
    }

    if (day && VALID_DAYS.includes(day)) {
      sql += ' AND s.day_of_week = ?';
      params.push(day);
    }

    sql += " ORDER BY CASE s.day_of_week WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6 WHEN 'Minggu' THEN 7 ELSE 8 END, s.start_time ASC";

    const schedules = await dbAll(sql, params);
    return res.json({ schedules });
  } catch (error) {
    console.error('Error saat mengambil schedules:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * POST /api/schedules
 * Menambah jadwal baru
 */
router.post('/', async (req, res) => {
  try {
    const { title, subject, day_of_week, start_time, end_time, room = '', lecturer = '', notes = '', target_user_id } = req.body;

    if (!title || !subject || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: 'Judul, mata kuliah, hari, jam mulai, dan jam selesai wajib diisi.' });
    }

    if (!VALID_DAYS.includes(day_of_week)) {
      return res.status(400).json({ message: `Hari harus salah satu dari: ${VALID_DAYS.join(', ')}.` });
    }

    let assignedUserId = req.user.id;
    if (req.user.role === 'admin' && target_user_id) {
      assignedUserId = target_user_id;
    }

    const result = await dbRun(
      `INSERT INTO schedules (user_id, title, subject, day_of_week, start_time, end_time, room, lecturer, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assignedUserId, title.trim(), subject.trim(), day_of_week, start_time.trim(), end_time.trim(), room.trim(), lecturer.trim(), notes.trim()]
    );

    const createdSchedule = await dbGet(
      `SELECT s.*, u.name as user_name, u.username as user_username
       FROM schedules s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Jadwal belajar berhasil ditambahkan.',
      schedule: createdSchedule,
    });
  } catch (error) {
    console.error('Error saat membuat schedule:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * PUT /api/schedules/:id
 * Memperbarui jadwal
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, day_of_week, start_time, end_time, room, lecturer, notes } = req.body;

    const existing = await dbGet('SELECT * FROM schedules WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak untuk mengedit jadwal ini.' });
    }

    if (day_of_week !== undefined && !VALID_DAYS.includes(day_of_week)) {
      return res.status(400).json({ message: `Hari harus salah satu dari: ${VALID_DAYS.join(', ')}.` });
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedSubject = subject !== undefined ? subject.trim() : existing.subject;
    const updatedDay = day_of_week !== undefined ? day_of_week : existing.day_of_week;
    const updatedStart = start_time !== undefined ? start_time.trim() : existing.start_time;
    const updatedEnd = end_time !== undefined ? end_time.trim() : existing.end_time;
    const updatedRoom = room !== undefined ? room.trim() : existing.room;
    const updatedLecturer = lecturer !== undefined ? lecturer.trim() : existing.lecturer;
    const updatedNotes = notes !== undefined ? notes.trim() : existing.notes;

    await dbRun(
      `UPDATE schedules
       SET title = ?, subject = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?, lecturer = ?, notes = ?
       WHERE id = ?`,
      [updatedTitle, updatedSubject, updatedDay, updatedStart, updatedEnd, updatedRoom, updatedLecturer, updatedNotes, id]
    );

    const updatedSchedule = await dbGet(
      `SELECT s.*, u.name as user_name, u.username as user_username
       FROM schedules s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
    );

    return res.json({
      message: 'Jadwal belajar berhasil diperbarui.',
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error('Error saat memperbarui schedule:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * DELETE /api/schedules/:id
 * Menghapus jadwal
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await dbGet('SELECT * FROM schedules WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak untuk menghapus jadwal ini.' });
    }

    await dbRun('DELETE FROM schedules WHERE id = ?', [id]);
    return res.json({ message: 'Jadwal belajar berhasil dihapus.' });
  } catch (error) {
    console.error('Error saat menghapus schedule:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
