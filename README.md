# Study Planner (Capstone UAS)

Sistem Manajemen & Perencanaan Belajar Siswa berbasis Web Admin, Backend API, dan Mobile App dengan fitur AI Assistant.

---

## 👥 Tim Pengembang (Kelompok 4)

- **Jason Benaia Hamonangan Simanjuntak** — 01881250045
- **Joy Cristian Sinaga** — 01881250048
- **Daniel Xavier Christian Perangin-Angin Sinurat** — 01881250013
- **Russell Betrand Victorio Pakpahan** — 01881250053

---

## 🏗️ Struktur Arsitektur Repositori

Proyek ini dibangun secara terpisah menjadi 3 komponen utama:

```
Study-Planner-main/
├── README.md                      # Dokumentasi umum proyek
├── .gitignore                     # Git ignore global
├── project-submission-guide.md    # Panduan deliverable dan milestone proyek
├── web-admin/                     # Web Admin Dashboard (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── backend/                       # REST API (Express + SQLite) [Tahap UAS]
│   └── .env.example
└── mobile-app/                    # Mobile Application (React Native + Expo) [Tahap UAS]
```

---

## 🚀 Panduan Menjalankan Komponen

### 1. Web Admin (`web-admin/`)
Aplikasi web dashboard untuk admin/mentor dan siswa mengelola tugas belajar.

```bash
cd web-admin
npm install
npm run dev
```
Buka browser pada tautan yang ditampilkan (default: `http://localhost:5173/`).

### 2. Backend API (`backend/`)
REST API server berbasis Express.js dan SQLite dengan JWT Auth dan proteksi role.

```bash
cd backend
npm install
npm run dev # atau npm start
```
Server berjalan di `http://localhost:3000/`. Database SQLite otomatis terinisialisasi dan di-seed data awal.

### 3. Mobile App (`mobile-app/`)
*(Sedang dalam pengembangan - React Native + Expo)*

---

## 🔐 Akun Demo (Web Admin)

| Role | Username | Password |
|------|----------|----------|
| Mentor / Admin | `admin` | `123` atau `admin123` |
| Siswa / Client | `budi` | `321` |
| Siswa / Client | `siswa` | `siswa123` |
