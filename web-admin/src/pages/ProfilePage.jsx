import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api, setStoredUser } from '../api';

export default function ProfilePage({ currentUser, onLogout, onUserUpdate }) {
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.updateProfile(profileData);
      setProfileSuccess(res.message || 'Profil berhasil diperbarui!');
      if (res.user && onUserUpdate) {
        onUserUpdate(res.user);
      }
    } catch (err) {
      setProfileError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await api.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordSuccess(res.message || 'Password berhasil diubah!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Gagal mengganti password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-indigo-500/25">
            {(currentUser?.name || currentUser?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {currentUser?.name || currentUser?.username}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 uppercase tracking-wider self-center sm:self-auto">
                {currentUser?.role === 'admin' ? 'Mentor / Admin' : 'Mahasiswa'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Username: <span className="font-semibold text-slate-700 dark:text-slate-200">@{currentUser?.username}</span>
            </p>
            {currentUser?.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                "{currentUser.bio}"
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span>👤</span>
              <span>Informasi Profil</span>
            </h2>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-800">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Nama Lengkap Anda"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bio / Deskripsi Studi
                </label>
                <textarea
                  rows="3"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Ceritakan fokus studimu, jurusan, atau target semester ini..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
              >
                {savingProfile ? 'Menyimpan...' : 'Perbarui Profil'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🔒</span>
              <span>Keamanan Kata Sandi</span>
            </h2>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-800">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password Saat Ini *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-xs"
              >
                {savingPassword ? 'Memperbarui...' : 'Ubah Password'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
