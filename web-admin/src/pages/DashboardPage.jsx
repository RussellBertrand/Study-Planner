import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api';

export default function DashboardPage({ currentUser, tasks = [], onTasksChange, onLogout, loading, error, onRefresh }) {
  const isAdmin = currentUser?.role === 'admin';
  const isUser = currentUser?.role === 'user' || currentUser?.role === 'client';
  const [filter, setFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const high = tasks.filter((t) => t.priority === 'High');
  const medium = tasks.filter((t) => t.priority === 'Medium');
  const low = tasks.filter((t) => t.priority === 'Low');

  const displayed = filter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.priority?.toUpperCase() === filter);

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      return;
    }

    try {
      setDeletingId(id);
      setActionError('');
      await api.deleteTask(id);
      if (onTasksChange) {
        onTasksChange((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      setActionError(err.message || 'Gagal menghapus tugas.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      setActionError('');
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updated = await api.updateTask(task.id, { status: nextStatus });
      if (onTasksChange) {
        onTasksChange((prev) =>
          prev.map((t) => (t.id === task.id ? updated.task : t))
        );
      }
    } catch (err) {
      setActionError(err.message || 'Gagal mengubah status tugas.');
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="dashboard-main">
        {/* Role Banner */}
        <div className={`role-banner role-banner-${isAdmin ? 'admin' : 'client'}`}>
          <div className="role-banner-inner">
            <div className="role-icon-box">
              {isAdmin ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              )}
            </div>
            <div className="role-copy">
              <div className="role-eyebrow">{isAdmin ? 'Mode Pengawasan Mentor (Admin)' : 'Ruang Belajar Mahasiswa (User)'}</div>
              <h2 className="role-greeting">Selamat datang, {currentUser?.name || currentUser?.username}.</h2>
              <p className="role-desc">
                {isAdmin
                  ? 'Anda memiliki akses penuh untuk memantau progres tugas seluruh mahasiswa dan memberikan pendampingan terstruktur.'
                  : 'Kelola jadwal tugas akademis dan kursus Anda secara sistematis untuk memastikan setiap deadline terpenuhi.'}
              </p>
            </div>
            <Link to="/form" className="btn-role-action">
              Tambah Tugas Baru
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Global Action Error */}
        {actionError && (
          <div style={{ margin: '1rem 0', padding: '12px 16px', background: '#ffebee', color: '#c62828', borderRadius: '8px' }}>
            ⚠️ {actionError}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#666', fontSize: '1.05rem' }}>
            ⏳ Memuat data tugas dari server backend...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ margin: '1.5rem 0', padding: '16px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030', textAlign: 'center' }}>
            <p><strong>⚠️ Gagal memuat data:</strong> {error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{ marginTop: '8px', padding: '6px 14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Coba Lagi
              </button>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-row">
          {[
            { label: 'Total Tugas', value: tasks.length, sub: 'Terdaftar di database', accent: 'default', key: 'ALL' },
            { label: 'Prioritas Tinggi', value: high.length, sub: 'Memerlukan perhatian segera', accent: 'high', key: 'HIGH' },
            { label: 'Prioritas Sedang', value: medium.length, sub: 'Perlu diselesaikan segera', accent: 'medium', key: 'MEDIUM' },
            { label: 'Prioritas Rendah', value: low.length, sub: 'Dapat dijadwalkan fleksibel', accent: 'low', key: 'LOW' },
          ].map((s) => (
            <div
              key={s.key}
              className={`stat-card stat-${s.accent} ${filter === s.key ? 'stat-active' : ''}`}
              onClick={() => setFilter(s.key)}
            >
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Gamification mini for students */}
        {isUser && (
          <div className="student-progress-row">
            <div className="progress-widget">
              <div className="pw-label">Streak Belajar</div>
              <div className="pw-value">7 Hari Berturut-turut</div>
              <div className="pw-bar-bg"><div className="pw-bar-fill" style={{ width: '70%' }} /></div>
            </div>
            <div className="progress-widget">
              <div className="pw-label">Level Pencapaian</div>
              <div className="pw-value">Tingkat 4 — 850 / 1.000 XP</div>
              <div className="pw-bar-bg"><div className="pw-bar-fill pw-xp" style={{ width: '85%' }} /></div>
            </div>
            <div className="progress-widget">
              <div className="pw-label">Penyelesaian Tugas</div>
              <div className="pw-value">{tasks.filter((t) => t.status === 'completed').length} / {tasks.length} Selesai</div>
              <div className="pw-bar-bg">
                <div
                  className="pw-bar-fill pw-tasks"
                  style={{
                    width: tasks.length > 0
                      ? `${Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Task Section */}
        <div className="task-section">
          <div className="task-section-header">
            <div>
              <h3 className="task-section-title">Daftar Tugas Belajar</h3>
              <p className="task-section-sub">
                {filter === 'ALL' ? `Menampilkan seluruh ${tasks.length} tugas` : `Filter aktif: Prioritas ${filter} (${displayed.length} tugas)`}
              </p>
            </div>
            <div className="filter-chips">
              {[['ALL', 'Semua'], ['HIGH', 'Tinggi'], ['MEDIUM', 'Sedang'], ['LOW', 'Rendah']].map(([k, l]) => (
                <button key={k} className={`filter-chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {!loading && displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h4 className="empty-state-title">Belum Ada Tugas Ditemukan</h4>
              <p className="empty-state-desc">
                {filter !== 'ALL'
                  ? `Tidak ada tugas dengan kategori prioritas ${filter}.`
                  : isAdmin
                  ? 'Belum ada catatan tugas dari mahasiswa di sistem ini.'
                  : 'Mulai catat jadwal tugas akademis dan kursus Anda agar lebih terorganisir.'}
              </p>
              <Link to="/form" className="btn-role-action" style={{ display: 'inline-flex', marginTop: '8px' }}>
                Tambah Tugas Pertama
              </Link>
            </div>
          ) : (
            <div className="task-list">
              {displayed.map((task, i) => {
                const key = task.id ? `task-${task.id}` : `task-${i}-${task.title}`;
                const p = task.priority?.toLowerCase() || 'medium';
                const isCompleted = task.status === 'completed';

                return (
                  <div key={key} className={`task-card priority-${p}`} style={{ opacity: isCompleted ? 0.75 : 1 }}>
                    <div className="task-card-top">
                      <div className="task-num">#{i + 1}</div>
                      <h4 className="task-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </h4>
                      <span className={`priority-badge priority-badge-${p}`}>{task.priority}</span>
                    </div>

                    <div className="task-card-meta">
                      <div className="task-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <span>{task.subject || 'Umum'}</span>
                      </div>
                      <div className="task-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span className="task-deadline">{task.deadline || 'Tanpa Deadline'}</span>
                      </div>
                      {isAdmin && task.user_name && (
                        <div className="task-meta-item" style={{ color: '#4a5568', fontWeight: '500' }}>
                          <span>👤 Siswa: {task.user_name}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #edf2f7' }}>
                      <button
                        onClick={() => handleToggleStatus(task)}
                        style={{
                          background: isCompleted ? '#c6f6d5' : '#edf2f7',
                          color: isCompleted ? '#22543d' : '#4a5568',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {isCompleted ? '✓ Selesai' : '○ Tandai Selesai'}
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingId === task.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e53e3e',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {deletingId === task.id ? 'Menghapus...' : '🗑️ Hapus'}
                      </button>
                    </div>

                    {isAdmin && (
                      <div className="task-admin-note" style={{ marginTop: '8px' }}>
                        Pengawasan aktif — data terhubung langsung ke SQLite database
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
