import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmModal from '../components/common/ConfirmModal';
import EditTaskModal from '../components/common/EditTaskModal';
import { api } from '../api';
import { awardXP } from '../utils/gamification';

// Format tanggal lokal Indonesia & kalkulasi status sisa hari
function formatDeadline(dateString) {
  if (!dateString) return { formatted: 'Tanpa batas waktu', badgeClass: 'bg-slate-100 text-slate-600', label: 'Fleksibel' };
  
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const formatted = new Intl.DateTimeFormat('id-ID', options).format(targetDate);

  if (diffDays < 0) {
    return { formatted, badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', label: `Terlambat ${Math.abs(diffDays)} hari` };
  } else if (diffDays === 0) {
    return { formatted, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', label: 'Hari ini!' };
  } else if (diffDays <= 2) {
    return { formatted, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', label: `${diffDays} hari lagi` };
  }
  return { formatted, badgeClass: 'bg-slate-50 text-slate-600 border-slate-200', label: `${diffDays} hari lagi` };
}

export default function DashboardPage({ currentUser, tasks = [], onTasksChange, onLogout, loading, error, onRefresh }) {
  const isAdmin = currentUser?.role === 'admin';
  const isUser = currentUser?.role === 'user' || currentUser?.role === 'client';

  // State Filter & Pencarian
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Modals State
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [xpToast, setXpToast] = useState(null);

  // Perhitungan Ringkasan Statistik
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const high = tasks.filter((t) => t.priority === 'High' && t.status !== 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, high, percentage };
  }, [tasks]);

  // Logika Filter Multi-Kriteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchPriority = priorityFilter === 'ALL' || task.priority?.toUpperCase() === priorityFilter;
      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'pending'
          ? task.status !== 'completed'
          : task.status === 'completed';
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.subject && task.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchPriority && matchStatus && matchSearch;
    });
  }, [tasks, priorityFilter, statusFilter, searchQuery]);

  const handleToggleStatus = async (task) => {
    try {
      setActionError('');
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updated = await api.updateTask(task.id, { status: nextStatus });
      
      if (onTasksChange) {
        onTasksChange((prev) =>
          prev.map((t) => (String(t.id) === String(task.id) ? { ...t, ...updated.task, status: nextStatus } : t))
        );
      }

      // Integrasi Ekosistem: Menghadiahkan XP otomatis saat tugas diselesaikan
      if (nextStatus === 'completed') {
        const xpAmount = task.priority === 'High' ? 50 : task.priority === 'Medium' ? 30 : 15;
        const awarded = awardXP(currentUser?.id, xpAmount, `Penyelesaian tugas: ${task.title}`);
        if (awarded) {
          setXpToast(`🎉 Selamat! +${xpAmount} XP diperoleh.`);
          setTimeout(() => setXpToast(null), 3500);
        }
      }
    } catch (err) {
      setActionError(err.message || 'Gagal mengubah status tugas.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeletingId(taskToDelete.id);
      setActionError('');
      await api.deleteTask(taskToDelete.id);
      if (onTasksChange) {
        onTasksChange((prev) => prev.filter((t) => String(t.id) !== String(taskToDelete.id)));
      }
      setTaskToDelete(null);
    } catch (err) {
      setActionError(err.message || 'Gagal menghapus tugas.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTaskSaved = (updatedTask) => {
    if (onTasksChange) {
      onTasksChange((prev) =>
        prev.map((t) => (String(t.id) === String(updatedTask.id) ? { ...t, ...updatedTask } : t))
      );
    }
  };

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Floating XP Reward Toast */}
      {xpToast && (
        <div className="toast-notification fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            ⭐
          </div>
          <div>
            <p className="font-bold text-xs text-white">Gamifikasi Sinkron</p>
            <p className="text-amber-300 text-xs">{xpToast}</p>
          </div>
        </div>
      )}

      {/* Reusable Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Hapus Tugas Belajar"
        message={`Apakah Anda yakin ingin menghapus "${taskToDelete?.title}" dari jadwal belajar? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Tugas"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        currentUser={currentUser}
        onClose={() => setEditingTask(null)}
        onSaveSuccess={handleTaskSaved}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Glassmorphism Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-800/80">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {isAdmin ? 'Mode Pembimbing (Admin)' : 'Portal Belajar Mahasiswa'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                Halo, {currentUser?.name || currentUser?.username} 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {isAdmin
                  ? 'Monitor seluruh aktivitas tugas, progres belajar mahasiswa, dan status kelulusan materi.'
                  : 'Atur ritme belajar Anda, selesaikan tugas sebelum tenggat, dan jaga streak konsistensi.'}
              </p>
            </div>

            <Link
              to="/form"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-indigo-600/30 w-fit whitespace-nowrap"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Tugas Baru
            </Link>
          </div>
        </div>

        {/* Quick Productivity Nav Dock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/kanban"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
              📋
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Papan Tugas</div>
              <div className="text-[10px] text-slate-400">Kanban & Matriks</div>
            </div>
          </Link>

          <Link
            to="/pomodoro"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
              ⏱️
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Fokus & Timer</div>
              <div className="text-[10px] text-slate-400">Pomodoro + Audio</div>
            </div>
          </Link>

          <Link
            to="/academic"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Hub Akademik</div>
              <div className="text-[10px] text-slate-400">Mata Kuliah & IPK</div>
            </div>
          </Link>

          <Link
            to="/gamification"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
              🏆
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Sistem Belajar</div>
              <div className="text-[10px] text-slate-400">Misi, XP & Badges</div>
            </div>
          </Link>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError('')} className="text-rose-500 hover:text-rose-700 font-bold">&times;</button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm text-center space-y-2">
            <p><strong>⚠️ Gagal memuat data:</strong> {error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
              >
                Coba Muat Ulang
              </button>
            )}
          </div>
        )}

        {/* Ringkasan Metrik (Stats Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setPriorityFilter('ALL')}
            className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
              priorityFilter === 'ALL' ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-slate-200/80 dark:border-slate-800 shadow-soft-sm'
            }`}
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tugas</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-display">{stats.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Semua materi terdaftar</div>
          </div>

          <div
            onClick={() => setPriorityFilter('HIGH')}
            className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
              priorityFilter === 'HIGH' ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200/80 dark:border-slate-800 shadow-soft-sm'
            }`}
          >
            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Prioritas Tinggi</div>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-display">{stats.high}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Perlu perhatian segera</div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tugas Selesai</div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-display">{stats.completed}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dari {stats.total} total penugasan</div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tingkat Kelulusan</div>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-2 font-display">{stats.percentage}%</div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter & Toolbar Area */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Input Pencarian */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama tugas atau mata kuliah..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Opsi Tab Status & Prioritas */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                {[['ALL', 'Semua Status'], ['pending', 'Aktif'], ['completed', 'Selesai']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setStatusFilter(val)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${statusFilter === val ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                {[['ALL', 'Semua Prioritas'], ['HIGH', 'Tinggi'], ['MEDIUM', 'Sedang'], ['LOW', 'Rendah']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setPriorityFilter(val)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${priorityFilter === val ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task List Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-500">Memuat data jadwal tugas...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">Tidak ada tugas ditemukan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {searchQuery || priorityFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Tidak ada tugas yang cocok dengan filter aktif. Coba ubah kata kunci atau reset filter.'
                : 'Mulai catat jadwal tugas akademis dan kursus Anda agar lebih terorganisir.'}
            </p>
            <Link to="/form" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm">
              Buat Tugas Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const deadlineInfo = formatDeadline(task.deadline);
              const priorityColor =
                task.priority === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                  : task.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';

              return (
                <div
                  key={task.id}
                  className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 hover:shadow-soft-xl ${
                    isCompleted ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 opacity-80' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityColor}`}>
                        {task.priority || 'Medium'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${deadlineInfo.badgeClass}`}>
                        {deadlineInfo.label}
                      </span>
                    </div>

                    <div>
                      <h3 className={`font-bold text-base transition-colors duration-200 line-clamp-2 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        {task.subject || 'Umum'}
                      </p>
                    </div>

                    {isAdmin && task.user_name && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-500">
                        <span>👤 Mahasiswa:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{task.user_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi Lengkap (Status, Edit, Delete) */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isCompleted ? '✓ Selesai' : '○ Tandai Selesai'}
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Tombol Edit Task */}
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                        title="Edit tugas"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Tombol Hapus Task */}
                      <button
                        onClick={() => setTaskToDelete(task)}
                        disabled={deletingId === task.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all duration-150"
                        title="Hapus tugas"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
