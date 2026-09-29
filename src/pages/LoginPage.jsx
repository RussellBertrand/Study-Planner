import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ users, setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      navigate('/dashboard');
    } else {
      setErrorMsg('Username atau password salah! Silakan coba lagi atau gunakan tombol demo.');
    }
  };

  const handleQuickDemo = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setErrorMsg('');

    const foundUser = users.find(
      (u) => u.username === demoUsername && u.password === demoPassword
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Sisi Kiri: Branding & Nilai Tambah */}
        <div className="login-brand-panel">
          <Link to="/" className="login-brand-link">
            <span className="brand-icon">🚀</span>
            <span className="brand-title">Belajar Aja</span>
          </Link>

          <div className="login-hero-copy">
            <h2>Kuasai Skill Baru Tanpa Ribet</h2>
            <p>
              Masuk untuk melanjutkan alur belajar, mempertahankan streak harian, dan mengelola tugas belajarmu.
            </p>
          </div>

          <div className="login-trust-quote">
            <p>“Belajar konsisten di Belajar Aja ngebantu aku dapet pekerjaan pertama di tech startup.”</p>
            <span>— Rizky Ramadhan, Alumni 2026</span>
          </div>
        </div>

        {/* Sisi Kanan: Form Login & Quick Demo */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h3>Selamat Datang Kembali! 👋</h3>
            <p>Silakan masukkan akun Anda untuk masuk ke sistem.</p>
          </div>

          {errorMsg && (
            <div className="login-error-alert" role="alert">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: siswa atau admin"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-login-submit">
              Masuk Sekarang →
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="demo-accounts-box">
            <p className="demo-title">Akun Cepat untuk Uji Coba (Demo 1-Klik):</p>
            <div className="demo-button-group">
              <button
                type="button"
                className="btn-demo demo-client"
                onClick={() => handleQuickDemo('siswa', 'siswa123')}
              >
                🎓 Masuk sebagai Siswa
              </button>
              <button
                type="button"
                className="btn-demo demo-admin"
                onClick={() => handleQuickDemo('admin', '123')}
              >
                👨‍🏫 Masuk sebagai Mentor (Admin)
              </button>
            </div>
          </div>

          <div className="login-footer-links">
            <Link to="/" className="link-back-home">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
