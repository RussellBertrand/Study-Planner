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
              <a href="#instagram" className="social-icon" aria-label="Instagram">📸</a>
              <a href="#youtube" className="social-icon" aria-label="YouTube">▶️</a>
              <a href="#discord" className="social-icon" aria-label="Discord">💬</a>
              <a href="#linkedin" className="social-icon" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="footer-nav-group">
            <h4 className="footer-heading">Jelajahi Belajar</h4>
            <ul className="footer-links">
              <li><a href="#courses">Katalog Kursus Populer</a></li>
              <li><a href="#categories">Pilihan Kategori Skill</a></li>
              <li><a href="#gamification">Misi & Streak Belajar</a></li>
              <li><Link to="/dashboard">Perencana Belajar (Dashboard)</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-heading">Karier & Komunitas</h4>
            <ul className="footer-links">
              <li><a href="#mentors">Menjadi Mentor Tamu</a></li>
              <li><a href="#community">Komunitas Discord Belajar</a></li>
              <li><a href="#career">Pusat Karir & Magang</a></li>
              <li><a href="#cert">Cek Sertifikat Digital</a></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-heading">Bantuan & Legal</h4>
            <ul className="footer-links">
              <li><a href="#faq">Pusat Bantuan & FAQ</a></li>
              <li><a href="#terms">Syarat & Ketentuan</a></li>
              <li><a href="#privacy">Kebijakan Privasi</a></li>
              <li><a href="#contact">Hubungi Kami</a></li>
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
