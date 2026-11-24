import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api';

export default function AdminPage({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser && currentUser.role === 'admin';

  const loadAdminData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError('');
      const [usersRes, statsRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminStats(),
      ]);
      setUsers(usersRes.users || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Gagal memuat data panel admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [currentUser]);

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (window.confirm(`Hapus pengguna "${name}" beserta seluruh data tugas dan jadwalnya?`)) {
      try {
        await api.deleteAdminUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        // Refresh stats
        const refreshedStats = await api.getAdminStats();
        setStats(refreshedStats.stats);
      } catch (err) {
        alert(err.message || 'Gagal menghapus pengguna.');
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
        <Navbar currentUser={currentUser} onLogout={onLogout} />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-2xl flex items-center justify-center text-3xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akses Terbatas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Halaman ini khusus untuk pengguna dengan hak akses Mentor / Admin. Silakan hubungi administrator atau login dengan akun mentor.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
              Control Panel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
            Dashboard Manajemen Mentor & Admin 🛡️
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pantau statistik menyeluruh, progres tugas siswa, dan manajemen pengguna platform Study Planner.
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengguna</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalUsers}</p>
              <span className="text-[11px] text-slate-400">Akun terdaftar</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Siswa Aktif</span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats.activeStudents}</p>
              <span className="text-[11px] text-slate-400">Role Mahasiswa</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tugas Belajar</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalTasks}</p>
              <span className="text-[11px] text-slate-400">{stats.completedTasks} tugas terselesaikan</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tingkat Penyelesaian</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.completionRate}%</p>
              <span className="text-[11px] text-slate-400">Rata-rata platform</span>
            </div>
          </div>
        )}

        {/* User Management Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Daftar Mahasiswa & Pengguna
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola status akun dan lihat aktivitas pengerjaan tugas setiap siswa.
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau username..."
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-medium">Memuat data pengguna...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-3">Pengguna</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-center">Total Tugas</th>
                    <th className="py-3 px-3 text-center">Selesai</th>
                    <th className="py-3 px-3 text-center">Sedang Jalan</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {(u.name || u.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                {u.name} {isSelf && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">(Anda)</span>}
                              </p>
                              <span className="text-xs text-slate-400">@{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {u.role === 'admin' ? 'Mentor' : 'Mahasiswa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {u.total_tasks || 0}
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {u.completed_tasks || 0}
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-amber-600 dark:text-amber-400">
                          {u.in_progress_tasks || 0}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Hapus pengguna"
                            >
                              Hapus
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
