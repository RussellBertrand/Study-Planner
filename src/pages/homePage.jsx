import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  CATEGORIES,
  VALUE_PROPOSITIONS,
  COURSES,
  TESTIMONIALS,
  GAMIFICATION_DATA,
} from '../data/courses';

// Icon components (SVG, no emoji)
const IconMap = {
  curriculum: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  mentor: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  interactive: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  certificate: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
};

export default function HomePage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [enrolledId, setEnrolledId] = useState(null);

  const filtered = selectedCategory === 'all'
    ? COURSES
    : COURSES.filter((c) => c.category === selectedCategory);

  const testimonial = TESTIMONIALS[testimonialIdx];

  const handleEnroll = (course) => {
    setEnrolledId(course.id);
    setTimeout(() => setEnrolledId(null), 3000);
  };

  return (
    <div className="page-wrapper">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Toast */}
      {enrolledId && (
        <div className="toast-notification">
          <div className="toast-indicator" />
          <div className="toast-body">
            <strong>Pendaftaran Berhasil</strong>
            <span>Anda telah terdaftar pada kursus pilihan. Buka Study Planner untuk memulai.</span>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ─────────────────────────────── */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-eyebrow">
              Platform Pembelajaran Digital
              <span className="hero-eyebrow-divider">•</span>
              45.000+ Mahasiswa Aktif
            </div>

            <h1 className="hero-title">
              Kuasai Keahlian Baru.<br />
              <span className="text-gradient">Wujudkan Karier</span><br />
              Impianmu.
            </h1>

            <p className="hero-subtitle">
              Belajar Aja menyediakan kurikulum terstruktur dari mentor praktisi industri, evaluasi berbasis proyek nyata, dan sertifikat resmi — semuanya tanpa biaya.
            </p>

            <div className="hero-cta-row">
              <button
                className="btn-cta-primary"
                onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              >
                Mulai Belajar Sekarang
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <a href="#courses" className="btn-cta-outline">Lihat Katalog Kursus</a>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat">
                <strong>45.000+</strong>
                <span>Pelajar Aktif</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong>48 Kursus</strong>
                <span>Berbasis Industri</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong>4.9 / 5</strong>
                <span>Rating Kepuasan</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-visual-frame">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=85"
                alt="Mahasiswa belajar kolaboratif"
                className="hero-img"
              />
              <div className="hero-img-overlay" />

              <div className="floating-stat-card floating-top-left">
                <div className="fsc-label">Sesi Hari Ini</div>
                <div className="fsc-value">7 Hari Berturut-turut</div>
                <div className="fsc-bar-bg"><div className="fsc-bar-fill" style={{ width: '85%' }} /></div>
              </div>

              <div className="floating-stat-card floating-bottom-right">
                <div className="fsc-label">Modul Diselesaikan</div>
                <div className="fsc-value">React 18 Fundamentals</div>
                <div className="fsc-progress-text">Progres: 92%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ──────────────────────────────── */}
      <section className="section-block" id="why-us">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Mengapa Belajar Aja</span>
            <h2 className="section-title">Platform Dirancang Khusus untuk Generasi Pelajar Indonesia</h2>
            <p className="section-desc">Setiap fitur dan kurikulum kami dikembangkan bersama para praktisi untuk memastikan relevansi dan kualitas terbaik.</p>
          </div>

          <div className="value-grid">
            {VALUE_PROPOSITIONS.map((vp, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{IconMap[vp.iconType]}</div>
                <div className="value-tag-pill">{vp.tag}</div>
                <h3 className="value-title">{vp.title}</h3>
                <p className="value-desc-text">{vp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ──────────────────────────── */}
      <section className="section-block section-alt" id="categories">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Bidang Keahlian</span>
            <h2 className="section-title">Eksplorasi Jalur Belajar Sesuai Minat & Tujuan Karier</h2>
          </div>

          <div className="category-pill-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
                <span className="pill-badge">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES CATALOG ──────────────────────────── */}
      <section className="section-block" id="courses">
        <div className="section-container">
          <div className="section-header-split">
            <div>
              <span className="section-tag">Katalog Kursus</span>
              <h2 className="section-title">Program Unggulan Minggu Ini</h2>
            </div>
            <Link to="/dashboard" className="btn-text-link">
              Buka Study Planner
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          <div className="courses-grid">
            {filtered.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-thumb-wrap">
                  <img src={course.thumbnail} alt={course.title} className="course-thumb" />
                  <span className={`course-badge-tag badge-${course.badgeType}`}>{course.badge}</span>
                  <span className="course-duration-tag">{course.duration}</span>
                </div>

                <div className="course-card-body">
                  <div className="course-meta-row">
                    <span className="course-level-tag">{course.level}</span>
                    <span className="course-rating-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      {course.rating} ({course.studentsCount.toLocaleString()})
                    </span>
                  </div>

                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description-short">{course.description}</p>

                  <div className="instructor-row">
                    <img src={course.instructor.avatar} alt={course.instructor.name} className="instructor-avatar" />
                    <div>
                      <div className="instructor-name">{course.instructor.name}</div>
                      <div className="instructor-role">{course.instructor.role}</div>
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="course-syllabus">
                      <div className="syllabus-title">Silabus Program</div>
                      <ul className="syllabus-list">
                        {course.syllabus.map((item, si) => (
                          <li key={si}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="course-card-footer">
                    <div className="course-price-block">
                      <span className="price-free">{course.price}</span>
                      <span className="price-original">{course.originalPrice}</span>
                    </div>
                    <div className="course-action-row">
                      <button
                        className="btn-syllabus"
                        onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                      >
                        {expandedCourse === course.id ? 'Tutup' : 'Silabus'}
                      </button>
                      <button className="btn-enroll" onClick={() => handleEnroll(course)}>
                        Daftar Kursus
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMIFICATION ─────────────────────────────── */}
      <section className="section-block gamification-section" id="gamification">
        <div className="section-container">
          <div className="gamification-layout">
            <div className="gamification-left">
              <span className="section-tag section-tag-light">Sistem Pembelajaran Adaptif</span>
              <h2 className="gamification-title">Belajar Terstruktur, Kemajuan Terukur</h2>
              <p className="gamification-desc">
                Sistem pelacakan belajar kami menggabungkan pencatatan progres harian, misi terstruktur, dan papan peringkat komunitas untuk menjaga motivasi dan konsistensi belajar Anda.
              </p>

              {/* Streak Tracker */}
              <div className="streak-card">
                <div className="streak-card-header">
                  <div>
                    <div className="streak-label">Streak Belajar Harian</div>
                    <div className="streak-value">{GAMIFICATION_DATA.streakDays} Hari Berturut-turut</div>
                  </div>
                  <span className="streak-status-badge">Aktif</span>
                </div>
                <div className="streak-day-row">
                  {GAMIFICATION_DATA.weekDays.map((d, i) => (
                    <div key={i} className={`streak-day ${d.active ? 'done' : ''}`}>
                      <div className="streak-day-dot">{d.active ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : null}</div>
                      <div className="streak-day-name">{d.day}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* XP Progress */}
              <div className="xp-card">
                <div className="xp-card-header">
                  <span className="xp-level-label">{GAMIFICATION_DATA.level}</span>
                  <span className="xp-numbers">{GAMIFICATION_DATA.xpCurrent} / {GAMIFICATION_DATA.xpTarget} XP</span>
                </div>
                <div className="xp-bar-track">
                  <div className="xp-bar-progress" style={{ width: `${(GAMIFICATION_DATA.xpCurrent / GAMIFICATION_DATA.xpTarget) * 100}%` }} />
                </div>
                <p className="xp-note">Selesaikan misi aktif untuk mendapatkan +150 XP tambahan</p>
              </div>

              {/* Active Quests */}
              <div className="quests-section">
                <div className="quests-title">Misi Aktif</div>
                <div className="quests-list">
                  {GAMIFICATION_DATA.activeQuests.map((q) => (
                    <div key={q.id} className={`quest-item ${q.completed ? 'completed' : ''}`}>
                      <div className="quest-check">
                        {q.completed ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : null}
                      </div>
                      <div className="quest-info">
                        <div className="quest-name">{q.title}</div>
                        <div className="quest-meta">
                          <span className="quest-category">{q.category}</span>
                          <span className="quest-xp">+{q.xpReward} XP</span>
                        </div>
                        <div className="quest-progress-bar">
                          <div className="quest-progress-fill" style={{ width: `${q.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="gamification-right">
              {/* Badges */}
              <div className="badges-panel">
                <div className="badges-panel-title">Lencana Prestasi</div>
                <div className="badges-list">
                  {GAMIFICATION_DATA.badges.map((b) => (
                    <div key={b.id} className={`badge-item ${b.unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="badge-tier-dot" data-tier={b.tier} />
                      <div className="badge-item-info">
                        <div className="badge-item-title">{b.title} <span className="badge-tier-label">{b.tier}</span></div>
                        <div className="badge-item-desc">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="leaderboard-panel">
                <div className="leaderboard-title">Papan Peringkat Komunitas</div>
                <div className="leaderboard-list">
                  {GAMIFICATION_DATA.leaderboard.map((u) => (
                    <div key={u.rank} className={`leaderboard-row ${u.isCurrentUser ? 'current-user' : ''}`}>
                      <span className={`lb-rank ${u.rank <= 3 ? 'top' : ''}`}>{u.rank}</span>
                      <div className="lb-user-info">
                        <div className="lb-user-name">{u.name} {u.isCurrentUser && <span className="lb-you-badge">Anda</span>}</div>
                        <div className="lb-user-college">{u.college}</div>
                      </div>
                      <div className="lb-user-stats">
                        <div className="lb-xp">{u.xp} XP</div>
                        <div className="lb-streak">{u.streak} hari</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planner CTA */}
              <div className="planner-cta-card">
                <div className="planner-cta-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="planner-cta-copy">
                  <strong>Study Planner Terintegrasi</strong>
                  <p>Catat dan kelola jadwal tugas belajar serta deadline akademis Anda dalam satu dasbor terpadu.</p>
                </div>
                <Link to="/dashboard" className="btn-planner-cta">Buka Planner</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="section-block" id="testimonials">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Cerita Alumni</span>
            <h2 className="section-title">Dipercaya oleh Ribuan Mahasiswa & Profesional</h2>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-quote-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </div>
            <p className="testimonial-text">{testimonial.story}</p>
            <div className="testimonial-user-row">
              <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
              <div className="testimonial-user-info">
                <div className="testimonial-name">{testimonial.name}</div>
                <div className="testimonial-role">{testimonial.role}</div>
                <div className="testimonial-course">Program: {testimonial.courseTaken}</div>
              </div>
              <div className="testimonial-nav">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <div className="nav-arrows">
                  <button className="nav-arrow-btn" onClick={() => setTestimonialIdx((testimonialIdx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} aria-label="Sebelumnya">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <span className="nav-indicator">{testimonialIdx + 1} / {TESTIMONIALS.length}</span>
                  <button className="nav-arrow-btn" onClick={() => setTestimonialIdx((testimonialIdx + 1) % TESTIMONIALS.length)} aria-label="Selanjutnya">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}