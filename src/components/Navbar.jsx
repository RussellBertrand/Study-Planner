import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';


export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-logo">
            <span className="brand-icon">📚</span>
            <span className="brand-title">Study Planner</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-links">
          <li>
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>

          {/* Conditional: Link Tambah Tugas hanya untuk Client (Siswa) */}
          {(!currentUser || currentUser.role === 'client') && (
            <li>
              <Link
                to="/form"
                className={`nav-link ${isActive('/form') ? 'active' : ''}`}
              >
                Tambah Tugas
              </Link>
            </li>
          )}

          <li>
            <Link
              to="/output"
              className={`nav-link ${isActive('/output') ? 'active' : ''}`}
            >
              Ringkasan
            </Link>
          </li>
        </ul>

        {/* User Info & Logout Button */}
        <div className="navbar-actions">
          {currentUser && (
            <div className="user-profile">
              <span className={`user-badge badge-${currentUser.role || 'client'}`}>
                {currentUser.role === 'admin' ? 'Admin / Mentor' : 'Siswa'}
              </span>
              <span className="user-name">
                {currentUser.name || currentUser.username}
              </span>
            </div>
          )}

          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            title="Keluar dari akun"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
