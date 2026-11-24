import express from 'express';
import { dbAll, dbGet, dbRun } from './db.js';
import { authenticateToken, requireRole } from './middleware.js';

const router = express.Router();

// Semua rute admin memerlukan token dan role admin
router.use(authenticateToken);
router.use(requireRole('admin'));

/**
 * GET /api/admin/users
 * Mengambil daftar seluruh pengguna beserta statistik tugasnya
 */
router.get('/users', async (req, res) => {
  try {
    const users = await dbAll(`
      SELECT 
        u.id, 
        u.username, 
        u.name, 
        u.role, 
        u.bio, 
        u.created_at,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return res.json({ users });
  } catch (error) {
    console.error('Error saat mengambil daftar users admin:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * GET /api/admin/stats
 * Mengambil ringkasan statistik global platform untuk mentor/admin
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalMentors = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const taskStats = await dbGet(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high_priority_tasks
      FROM tasks
    `);

    const completionRate = taskStats.total_tasks > 0 
      ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100) 
      : 0;

    return res.json({
      stats: {
        totalStudents: totalUsers.count || 0,
        totalMentors: totalMentors.count || 0,
        totalTasks: taskStats.total_tasks || 0,
        completedTasks: taskStats.completed_tasks || 0,
        inProgressTasks: taskStats.in_progress_tasks || 0,
        pendingTasks: taskStats.pending_tasks || 0,
        highPriorityTasks: taskStats.high_priority_tasks || 0,
        completionRate,
      },
    });
  } catch (error) {
    console.error('Error saat mengambil statistik admin:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Menghapus akun pengguna (Admin tidak boleh menghapus dirinya sendiri)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.' });
    }

    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: `Pengguna "${targetUser.name}" (@${targetUser.username}) berhasil dihapus.` });
  } catch (error) {
    console.error('Error saat menghapus user oleh admin:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
