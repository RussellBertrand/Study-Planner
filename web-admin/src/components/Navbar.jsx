import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
          <div className="brand-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="brand-title">Belajar Aja</span>
        </Link>
        <button
          className={`mobile-toggle-btn ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigasi"
        >
          <span /><span /><span />
        </button>
        <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Beranda</Link></li>
          <li><a href="#courses" className="nav-link" onClick={() => setMobileOpen(false)}>Katalog Kursus</a></li>
          <li><a href="#gamification" className="nav-link" onClick={() => setMobileOpen(false)}>Sistem Belajar</a></li>
          <li><Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Study Planner</Link></li>
          {currentUser?.role === 'client' && (
            <li><Link to="/form" className={`nav-link ${isActive('/form') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Tambah Tugas</Link></li>
          )}
        </ul>
        <div className={`navbar-actions ${mobileOpen ? 'open' : ''}`}>
          {currentUser ? (
            <>
              <div className="user-profile">
                <div className="user-avatar-initial">
                  {(currentUser.name || currentUser.username).charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.name || currentUser.username}</span>
                  <span className={`user-role-label role-${currentUser.role}`}>
                    {currentUser.role === 'admin' ? 'Mentor & Advisor' : 'Mahasiswa Aktif'}
                  </span>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Keluar</button>
            </>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="btn-nav-login" onClick={() => setMobileOpen(false)}>Masuk</Link>
              <Link to="/login" className="btn-nav-register" onClick={() => setMobileOpen(false)}>Daftar Gratis</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
