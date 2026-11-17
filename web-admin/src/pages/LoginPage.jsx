import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuthToken, setStoredUser } from '../api';

export default function LoginPage({ setCurrentUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); // 'user' (Mahasiswa) atau 'admin' (Mentor)
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

        const regData = await api.register(username.trim(), password, name.trim(), role);
        if (regData.token && regData.user) {
          setAuthToken(regData.token);
          setStoredUser(regData.user);
          setCurrentUser(regData.user);
          navigate('/dashboard');
          return;
        }
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

  const handleGoogleMockLogin = () => {
    handleQuickDemo('siswa', 'siswa123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-100">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px]" />
      </div>

      {/* Main Centered Floating Card Split Layout */}
      <div className="relative max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[620px] border border-slate-200/50 dark:border-slate-800/80">
        
        {/* ── SISI KIRI: Vibrant Visual Section (md:col-span-5) ───────────── */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle Background Circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-900/30 rounded-full blur-2xl pointer-events-none" />

          {/* Header Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight font-display text-white">
                Belajar<span className="text-blue-200">Aje</span>
              </span>
            </Link>

            {/* Content Area */}
            <div className="mt-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display leading-tight">
                Start your Journey
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xs">
                Platform cerdas untuk mengorganisasi tugas, mempertahankan fokus ritme belajar, dan memantau target akademis Anda.
              </p>
            </div>
          </div>

          {/* Step Indicator Cards (Glassmorphism & Active Card) */}
          <div className="relative z-10 space-y-3 mt-8">
            {/* Step 1: Active Clean White Card */}
            <div className="bg-white text-slate-900 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/10 transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                1
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  Buat / Masuk Akun
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Akses dashboard personal Anda
                </p>
              </div>
            </div>

            {/* Step 2: Glassmorphic Inactive Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3.5 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                2
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
                  Rancang Jadwal Belajar
                </h4>
                <p className="text-[11px] text-blue-100/80 mt-0.5 truncate">
                  Atur prioritas dan tenggat tugas
                </p>
              </div>
            </div>

            {/* Step 3: Glassmorphic Inactive Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3.5 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                3
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
                  Capai Target IPK & XP
                </h4>
                <p className="text-[11px] text-blue-100/80 mt-0.5 truncate">
                  Pantau streak dan evaluasi nilai
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SISI KANAN: Form Autentikasi (md:col-span-7) ─────────────────── */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          
          {/* Header & Toggle Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {isSignUp ? 'Join Us' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isSignUp
                  ? 'Daftarkan identitas Anda untuk memulai akun belajar.'
                  : 'Silakan masukkan kredensial akun Anda.'}
              </p>
            </div>

            {/* Toggle Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 w-fit self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !isSignUp
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isSignUp
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Daftar
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <span>✅ {successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    disabled={loading}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Peran Akun
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="user">Siswa / Mahasiswa (User)</option>
                    <option value="admin">Mentor / Pembimbing (Admin)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                required
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {!isSignUp && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Lupa password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3.5 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl py-3.5 w-full shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99] text-sm mt-2 disabled:opacity-60"
            >
              {loading
                ? 'Memproses...'
                : isSignUp
                ? 'Buat Akun Sekarang →'
                : 'Masuk Sekarang →'}
            </button>
          </form>

          {/* Social Login Section */}
          <div className="mt-5 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase font-semibold absolute">
                atau
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleMockLogin}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Quick Demo 1-Click Buttons */}
          {!isSignUp && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center sm:text-left">
                Uji Coba Cepat (Akun Demo 1-Klik):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('siswa', 'siswa123')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    🎓 Akun Siswa
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    siswa / siswa123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin', 'admin123')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    👨‍🏫 Akun Mentor
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    admin / admin123
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
