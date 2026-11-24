import express from 'express';
import { authenticateToken } from './middleware.js';
import { getUserContext, generateStudyMateResponse, executeAiAction } from './aiService.js';
import { dbAll, dbRun } from './db.js';

const router = express.Router();

// Semua rute AI diproteksi oleh token
router.use(authenticateToken);

/**
 * GET /api/ai/history
 * Mengambil riwayat percakapan AI untuk user saat ini
 */
router.get('/history', async (req, res) => {
  try {
    const history = await dbAll(
      'SELECT id, sender, message, action_data, created_at FROM chat_messages WHERE user_id = ? ORDER BY id ASC LIMIT 50',
      [req.user.id]
    );

    const formatted = history.map((item) => ({
      ...item,
      action_data: item.action_data ? JSON.parse(item.action_data) : null,
    }));

    res.json({ history: formatted });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Gagal mengambil riwayat pesan AI.' });
  }
});

/**
 * DELETE /api/ai/history
 * Menghapus seluruh riwayat chat user saat ini
 */
router.delete('/history', async (req, res) => {
  try {
    await dbRun('DELETE FROM chat_messages WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Riwayat percakapan StudyMate AI berhasil dibersihkan.' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Gagal menghapus riwayat chat.' });
  }
});

/**
 * POST /api/ai/chat
 * Mengirim pesan ke StudyMate AI dan menerima balasan kontekstual + proposal aksi jika relevan
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Pesan chat wajib diisi.' });
    }

    const trimmedMsg = message.trim();

    // 1. Simpan pesan pengguna ke chat_messages
    await dbRun(
      'INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?)',
      [req.user.id, 'user', trimmedMsg]
    );

    // 2. Ambil konteks aktual pengguna (tugas aktif, deadline mendesak, jadwal kuliah)
    const userContext = await getUserContext(req.user.id);
    if (!userContext) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // 3. Ambil riwayat chat terakhir untuk konteks percakapan berkelanjutan
    const recentHistory = await dbAll(
      'SELECT sender, message FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT 8',
      [req.user.id]
    );
    const chronologicalHistory = recentHistory.reverse();

    // 4. Hasilkan balasan AI menggunakan StudyMate Intelligence Engine
    const { reply, actionProposal } = await generateStudyMateResponse({
      userMessage: trimmedMsg,
      userContext,
      history: chronologicalHistory,
    });

    // 5. Simpan balasan AI ke chat_messages
    const proposalJson = actionProposal ? JSON.stringify(actionProposal) : null;
    const saveRes = await dbRun(
      'INSERT INTO chat_messages (user_id, sender, message, action_data) VALUES (?, ?, ?, ?)',
      [req.user.id, 'assistant', reply, proposalJson]
    );

    res.json({
      reply,
      actionProposal,
      messageId: saveRes.lastID,
    });
  } catch (error) {
    console.error('Error in StudyMate AI chat:', error);
    res.status(500).json({ message: 'Terjadi gangguan saat memproses balasan StudyMate AI.' });
  }
});

/**
 * POST /api/ai/action/confirm
 * Mengeksekusi aksi yang diusulkan oleh StudyMate AI setelah konfirmasi eksplisit dari pengguna
 */
router.post('/action/confirm', async (req, res) => {
  try {
    const { actionType, actionData } = req.body;
    if (!actionType || !actionData) {
      return res.status(400).json({ message: 'actionType dan actionData wajib disertakan.' });
    }

    const result = await executeAiAction(req.user.id, actionType, actionData);

    // Catat konfirmasi eksekusi ke riwayat chat
    const logMsg = `✅ **Aksi Dikonfirmasi:** ${result.message}`;
    await dbRun(
      'INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?)',
      [req.user.id, 'assistant', logMsg]
    );

    res.json(result);
  } catch (error) {
    console.error('Error executing AI action:', error);
    res.status(400).json({ message: error.message || 'Gagal mengeksekusi aksi AI.' });
  }
});

export default router;
