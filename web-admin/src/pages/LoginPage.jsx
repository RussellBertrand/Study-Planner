import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuthToken, setStoredUser } from '../api';

export default function LoginPage({ setCurrentUser }) {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle Login vs Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); // 'user' atau 'admin'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setErrorMsg('Nama lengkap wajib diisi untuk pendaftaran.');
          setLoading(false);
          return;
        }

        const data = await api.register(username.trim(), password, name.trim(), role);
        setSuccessMsg('Akun berhasil dibuat! Silakan masuk dengan kredensial Anda.');
        setIsSignUp(false);
        setPassword('');
      } else {
        const data = await api.login(username.trim(), password);
        setAuthToken(data.token);
        setStoredUser(data.user);
        setCurrentUser(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await api.login(demoUsername, demoPassword);
      setAuthToken(data.token);
      setStoredUser(data.user);
      setCurrentUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal login dengan akun demo.');
    } finally {
      setLoading(false);
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
                ? 'Daftarkan nama, username, dan password Anda untuk masuk ke sistem.'
                : 'Silakan masukkan kredensial akun Anda yang tersimpan di sistem.'}
            </p>
          </div>

          {errorMsg && (
            <div className="login-error-alert" role="alert" style={{ marginBottom: '1rem' }}>
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="login-success-alert"
              role="alert"
              style={{
                background: '#e6fffa',
                color: '#234e52',
                border: '1px solid #b2f5ea',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              <span>✅ {successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Nama Lengkap</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required={isSignUp}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role Akun</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-input"
                    disabled={loading}
                    style={{ padding: '0.65rem 0.85rem' }}
                  >
                    <option value="user">Siswa / Mahasiswa (User)</option>
                    <option value="admin">Mentor / Advisor (Admin)</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: admin atau siswa"
                required
                className="form-input"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading
                ? 'Memproses...'
                : isSignUp
                ? 'Daftar Sekarang →'
                : 'Masuk Sekarang →'}
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
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
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
                  disabled={loading}
                >
                  🎓 Masuk sebagai Siswa
                </button>
                <button
                  type="button"
                  className="btn-demo demo-admin"
                  onClick={() => handleQuickDemo('admin', 'admin123')}
                  disabled={loading}
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