import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ users, setUsers, setCurrentUser }) {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle antara Login dan Sign Up
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUsername = username.trim();

    if (isSignUp) {
      // Logika Sign Up (Pendaftaran Akun Baru & Simpan)
      const existingUser = users.find(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
      );

      if (existingUser) {
        setErrorMsg('Username sudah dipakai! Silakan gunakan username lain atau masuk.');
        return;
      }

      // Buat objek user baru
      const newUser = {
        id: Date.now(),
        username: trimmedUsername,
        password: password,
        role: 'siswa', // Default role untuk pendaftaran baru
      };

      // Simpan ke state global users (dan localStorage jika ada sinkronisasi di App.jsx)
      const updatedUsers = [...users, newUser];
      if (setUsers) {
        setUsers(updatedUsers);
      }

      setSuccessMsg('Akun berhasil dibuat! Silakan masuk.');
      setIsSignUp(false); // Pindahkan kembali ke mode login
      setPassword('');
    } else {
      // Logika Sign In / Login
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.password === password
      );

      if (foundUser) {
        setCurrentUser(foundUser);
        navigate('/dashboard');
      } else {
        setErrorMsg('Username atau password salah! Silakan periksa kembali.');
      }
    }
  };

  const handleQuickDemo = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setErrorMsg('');
    setSuccessMsg('');

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

        {/* Sisi Kanan: Form Sign In / Sign Up & Quick Demo */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h3>{isSignUp ? 'Buat Akun Baru 📝' : 'Selamat Datang Kembali! 👋'}</h3>
            <p>
              {isSignUp
                ? 'Daftarkan username dan password Anda untuk mulai belajar.'
                : 'Silakan masukkan akun Anda untuk masuk ke sistem.'}
            </p>
          </div>

          {errorMsg && (
            <div className="login-error-alert" role="alert">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-success-alert" role="alert" style={{ color: 'green', marginBottom: '1rem' }}>
              <span>✅ {successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
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
              {isSignUp ? 'Daftar Sekarang →' : 'Masuk Sekarang →'}
            </button>
          </form>

          {/* Tombol Toggle antara Login & Sign Up */}
          <div className="auth-toggle-box" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
              </button>
            </p>
          </div>

          {!isSignUp && (
            /* Quick Demo Login Buttons */
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
          )}

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