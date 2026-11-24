import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from './db.js';
import { authenticateToken } from './middleware.js';

const router = express.Router();
const secret = process.env.JWT_SECRET || 'supersecret_study_planner_jwt_key_2026';

// Register User Baru
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role = 'user' } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password, dan nama wajib diisi.' });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role harus "admin" atau "user".' });
    }

    // Cek duplikasi username
    const existing = await dbGet('SELECT id FROM users WHERE username = ?', [username.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ message: 'Username sudah digunakan, silakan pilih yang lain.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await dbRun(
      'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [username.toLowerCase().trim(), passwordHash, name.trim(), role]
    );

    const newUser = {
      id: result.lastID,
      username: username.toLowerCase().trim(),
      name: name.trim(),
      role,
      bio: '',
      avatar: '',
    };

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registrasi berhasil.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      bio: user.bio || '',
      avatar: user.avatar || '',
    };

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login berhasil.',
      token,
      user: payload,
    });
  } catch (error) {
    console.error('Error saat login:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Get Profil Pengguna yang Sedang Login
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, username, name, role, bio, avatar, created_at FROM users WHERE id = ?', [
      req.user.id,
    ]);

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Error saat mengambil data profil:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Update Profil (Nama, Bio, Avatar)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'Nama lengkap tidak boleh kosong.' });
    }

    const currentUser = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!currentUser) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    const updatedName = name !== undefined ? name.trim() : currentUser.name;
    const updatedBio = bio !== undefined ? bio.trim() : currentUser.bio || '';
    const updatedAvatar = avatar !== undefined ? avatar.trim() : currentUser.avatar || '';

    await dbRun(
      'UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?',
      [updatedName, updatedBio, updatedAvatar, req.user.id]
    );

    const updatedUser = await dbGet(
      'SELECT id, username, name, role, bio, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      message: 'Profil berhasil diperbarui.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error saat memperbarui profil:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Ubah Password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password saat ini dan password baru wajib diisi.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'Password baru minimal 4 karakter.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password saat ini tidak sesuai.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({ message: 'Password berhasil diubah. Silakan gunakan password baru pada sesi berikutnya.' });
  } catch (error) {
    console.error('Error saat mengubah password:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
