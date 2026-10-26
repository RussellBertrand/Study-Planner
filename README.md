# 📚 Study Planner — Platform Manajemen & Perencanaan Belajar Siswa

Proyek Capstone Web & Mobile Application Development (Kelompok 4).  
Aplikasi manajemen tugas belajar cerdas yang menghubungkan **Mahasiswa/Siswa** dalam menyusun rencana studi dan **Mentor/Admin** dalam memantau serta mendampingi progres belajar.

---

## 👥 Tim Pengembang (Kelompok 4)

| Nama Lengkap | NIM | Peran Utama |
|---|---|---|
| **Jason Benaia Hamonangan Simanjuntak** | 01881250045 | Web Admin Frontend |
| **Joy Cristian Sinaga** | 01881250048 | Backend & Database Architect |
| **Russell Betrand Victorio Pakpahan** | 01881250053 | System Integration & Deployment |

---

## 🏗️ Arsitektur Sistem (3 Komponen)

Sistem dirancang modular menjadi tiga komponen independen:

```
Study-Planner/
├── web-admin/           # Web Frontend Admin & Dashboard (React + Vite)
├── backend/             # RESTful API Server (Node.js Express + SQLite + JWT Auth)
├── mobile-app/          # Mobile Application (React Native + Expo) [Tahap Pengembangan]
├── project-submission-guide.md # Panduan milestone Capstone UAS
├── .gitignore           # Mengabaikan node_modules, .env, database sqlite, & build dist
└── README.md            # Dokumentasi proyek
```

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm versi 9 atau lebih baru

---

### 1. Menjalankan Backend API (`backend/`)

Server backend menyediakan REST API, otentikasi JWT, dan database SQLite lokal.

```bash
# Masuk ke folder backend
cd backend

# Pasang dependensi
npm install

# Buat file konfigurasi environment lokal
# (Bisa menduplikasi dari .env.example)
copy .env.example .env

# Jalankan server
npm run dev   # atau npm start
```

- Server backend akan berjalan di: **`http://localhost:3000`**
- Database SQLite (`database.sqlite`) akan dibuat dan di-seed data awal secara otomatis saat pertama kali server dijalankan.

---

### 2. Menjalankan Web Admin Dashboard (`web-admin/`)

Dashboard web dibangun menggunakan React + Vite, terintegrasi penuh ke backend API.

```bash
# Buka terminal baru, masuk ke folder web-admin
cd web-admin

# Pasang dependensi
npm install

# Jalankan Vite development server
npm run dev
```

- Buka tautan di browser: **`http://localhost:5173/study-planner/`**
- Terdapat fitur proteksi rute (otomatis redirect ke `/login` jika belum memiliki sesi aktif).

---

### 3. Mobile App (`mobile-app/`)
*(Sedang dalam tahap pengembangan menggunakan React Native + Expo).*

---

## 🔐 Akun Demo untuk Pengujian

Database sudah dilengkapi akun bawaan (*seeded data*):

| Role | Username | Password | Deskripsi Akses |
|---|---|---|---|
| **Mentor / Admin** | `admin` | `admin123` | Akses penuh melihat semua tugas mahasiswa & kontrol status |
| **Siswa / User** | `siswa` | `siswa123` | Mengelola tugas mandiri, menambah tugas, cek prioritas |
| **Siswa / User** | `budi` | `321` | Akun mahasiswa kedua untuk simulasi multi-pengguna |

> 💡 **Tip:** Pada halaman Login, tersedia tombol **"Demo 1-Klik"** untuk masuk secara instan tanpa perlu mengetik manual.

---

## 🔌 Rangkuman REST API Endpoints

Backend berjalan di `http://localhost:3000` dengan endpoint berikut:

### Autentikasi (`/api/auth`)
- `POST /api/auth/register` — Pendaftaran pengguna baru (`user` atau `admin`)
- `POST /api/auth/login` — Login pengguna & menghasilkan token JWT
- `GET /api/auth/me` — Mengambil data profil pengguna yang sedang login (*Auth Bearer*)

### Manajemen Tugas / Tasks (`/api/tasks`)
- `GET /api/tasks` — Mengambil daftar tugas (Admin: semua tugas; User: tugas pribadi)
- `GET /api/tasks/:id` — Mengambil detail satu tugas
- `POST /api/tasks` — Menambah tugas baru (judul, mata kuliah, deadline, prioritas)
- `PUT /api/tasks/:id` — Mengupdate data tugas atau status (`pending` / `completed`)
- `DELETE /api/tasks/:id` — Menghapus tugas dari sistem

---

## 🛠️ Tech Stack

- **Frontend Web Admin:** React 18, Vite, React Router 6, Vanilla CSS Modern (Responsive, Glassmorphism, CSS Tokens)
- **Backend API:** Node.js, Express.js, SQLite3, JSON Web Tokens (JWT), BcryptJS, CORS, Dotenv
- **Version Control:** Git & GitHub
