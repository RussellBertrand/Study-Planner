import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DashboardPage({ currentUser, tasks = [], onLogout }) {
  const isAdmin = currentUser?.role === 'admin';
  const isClient = currentUser?.role === 'client';
  const [filter, setFilter] = useState('ALL');

  const high = tasks.filter((t) => t.priority === 'High');
  const medium = tasks.filter((t) => t.priority === 'Medium');
  const low = tasks.filter((t) => t.priority === 'Low');

  const displayed = filter === 'ALL' ? tasks
    : tasks.filter((t) => t.priority?.toUpperCase() === filter);

  const completionRate = tasks.length > 0 ? Math.round((low.length / tasks.length) * 100) : 0;

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
              <div className="role-eyebrow">{isAdmin ? 'Mode Pengawasan Mentor' : 'Ruang Belajar Mahasiswa'}</div>
              <h2 className="role-greeting">Selamat datang, {currentUser?.name || currentUser?.username}.</h2>
              <p className="role-desc">
                {isAdmin
                  ? 'Anda memiliki akses penuh untuk memantau progres tugas seluruh mahasiswa dan memberikan pendampingan terstruktur.'
                  : 'Kelola jadwal tugas akademis dan kursus Anda secara sistematis untuk memastikan setiap deadline terpenuhi.'}
              </p>
            </div>
            {isClient && (
              <Link to="/form" className="btn-role-action">
                Tambah Tugas Baru
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          {[
            { label: 'Total Tugas', value: tasks.length, sub: 'Terdaftar di sistem', accent: 'default', key: 'ALL' },
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
        {isClient && (
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
              <div className="pw-value">{tasks.length} Tugas Aktif</div>
              <div className="pw-bar-bg"><div className="pw-bar-fill pw-tasks" style={{ width: tasks.length > 0 ? '60%' : '0%' }} /></div>
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

          {displayed.length === 0 ? (
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
              {isClient && (
                <Link to="/form" className="btn-role-action" style={{ display: 'inline-flex', marginTop: '8px' }}>
                  Tambah Tugas Pertama
                </Link>
              )}
            </div>
          ) : (
            <div className="task-list">
              {displayed.map((task, i) => {
                const key = task.id ? `task-${task.id}` : `task-${i}-${task.title}`;
                const p = task.priority?.toLowerCase() || 'medium';
                return (
                  <div key={key} className={`task-card priority-${p}`}>
                    <div className="task-card-top">
                      <div className="task-num">#{i + 1}</div>
                      <h4 className="task-title">{task.title}</h4>
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
                    </div>
                    {isAdmin && (
                      <div className="task-admin-note">
                        Pengawasan aktif — siap untuk pendampingan dan umpan balik terstruktur
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
