import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="brand-logo">
              <span className="brand-icon">🚀</span>
              <span className="brand-title">Belajar Aja</span>
            </Link>
            <p className="footer-tagline">
              Platform belajar interaktif untuk pelajar, mahasiswa, dan profesional muda.
              Kuasai skill baru tanpa ribet dan bangun portofolio impianmu.
            </p>
            <div className="social-links">
              <span className="social-icon" title="Instagram">📸</span>
              <span className="social-icon" title="YouTube">▶️</span>
              <span className="social-icon" title="Discord">💬</span>
              <span className="social-icon" title="LinkedIn">💼</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="footer-nav-group">
            <h4 className="footer-heading">Jelajahi Belajar</h4>
            <ul className="footer-links">
              <li><Link to="/courses">Katalog Kursus Populer</Link></li>
              <li><Link to="/gamification">Sistem Belajar & Misi</Link></li>
              <li><Link to="/kanban">Papan Alur Tugas (Kanban)</Link></li>
              <li><Link to="/pomodoro">Pusat Fokus Pomodoro</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-heading">Akademik & Produktivitas</h4>
            <ul className="footer-links">
              <li><Link to="/academic">Hub Mata Kuliah & Jadwal</Link></li>
              <li><Link to="/academic">Kalkulator Target IPK</Link></li>
              <li><Link to="/kanban">Matriks Prioritas Eisenhower</Link></li>
              <li><Link to="/dashboard">Study Planner Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-heading">Bantuan & Informasi</h4>
            <ul className="footer-links">
              <li><Link to="/">Beranda Utama</Link></li>
              <li><Link to="/courses">Silabus Pembelajaran</Link></li>
              <li><Link to="/dashboard">Status Progres Belajar</Link></li>
              <li><Link to="/login">Pusat Akses Akun</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Belajar Aja Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="footer-badges">
            <span className="badge-secure">🔒 Platform Aman & Terverifikasi</span>
            <span className="badge-education">🎓 Standar Industri Edukasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
