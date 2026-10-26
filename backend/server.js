import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - mengizinkan akses dari Web Admin (Vite port 5173 / preview) dan Mobile App (Expo)
app.use(
  cors({
    origin: '*', // Mengizinkan semua origin untuk dev lokal (Web Vite + Expo)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Logging sederhana untuk request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Health-check Route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Study Planner REST API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
    },
  });
});

// Daftarkan Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Terjadi kesalahan internal pada server.' });
});

// Inisialisasi Database dan Start Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Study Planner Backend Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Gagal menginisialisasi database:', err);
    process.exit(1);
  });
