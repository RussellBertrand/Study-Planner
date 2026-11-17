import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GAMIFICATION_DATA } from '../data/courses';
import { getGamificationState, saveGamificationState, subscribeToGamification } from '../utils/gamification';

export default function GamificationPage({ currentUser, onLogout }) {
  const [gameState, setGameState] = useState(() => getGamificationState(currentUser?.id));
  const [toastNotice, setToastNotice] = useState(null);

  // Sync state when currentUser changes or global XP event fires
  useEffect(() => {
    setGameState(getGamificationState(currentUser?.id));
    const unsubscribe = subscribeToGamification((detail) => {
      if (!detail.userId || detail.userId === currentUser?.id) {
        setGameState(getGamificationState(currentUser?.id));
      }
    });
    return unsubscribe;
  }, [currentUser?.id]);

  const quests = gameState.activeQuests || GAMIFICATION_DATA.activeQuests;
  const currentXP = gameState.xpCurrent ?? GAMIFICATION_DATA.xpCurrent;
  const xpTarget = gameState.xpTarget ?? GAMIFICATION_DATA.xpTarget;
  const level = gameState.level || GAMIFICATION_DATA.level;
  const badges = gameState.badges || GAMIFICATION_DATA.badges;
  const streakDays = gameState.streakDays ?? GAMIFICATION_DATA.streakDays;
  const weekDays = gameState.weekDays || GAMIFICATION_DATA.weekDays;
  const leaderboard = gameState.leaderboard || GAMIFICATION_DATA.leaderboard;

  const toggleQuest = (questId) => {
    const updatedQuests = quests.map((q) => {
      if (q.id === questId) {
        const nextCompleted = !q.completed;
        const diff = nextCompleted ? q.xpReward : -q.xpReward;
        const newXP = Math.min(xpTarget, Math.max(0, currentXP + diff));

        if (nextCompleted) {
          setToastNotice(`Misi tuntas! +${q.xpReward} XP ditambahkan.`);
          setTimeout(() => setToastNotice(null), 3000);
        }
        return {
          ...q,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : Math.max(0, q.progress - 30),
        };
      }
      return q;
    });

    const diff = updatedQuests.find((q) => q.id === questId)?.completed
      ? quests.find((q) => q.id === questId)?.xpReward || 0
      : -(quests.find((q) => q.id === questId)?.xpReward || 0);

    const newState = {
      ...gameState,
      xpCurrent: Math.min(xpTarget, Math.max(0, currentXP + diff)),
      activeQuests: updatedQuests,
    };
    setGameState(newState);
    saveGamificationState(currentUser?.id, newState);
  };

  const xpPercent = Math.min(100, Math.round((currentXP / xpTarget) * 100));

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Floating XP Toast */}
      {toastNotice && (
        <div className="toast-notification fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            ★
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">Progres Belajar Terkini</p>
            <p className="text-amber-300 font-medium">{toastNotice}</p>
          </div>
        </div>
      )}

      {/* Clean Header Section */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Sistem Pembelajaran Adaptif
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Sistem Belajar & Progres Adaptif
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pantau konsistensi belajar harian, tuntaskan misi terarah, dan kumpulkan poin pengalaman (XP) menuju jenjang kompetensi berikutnya.
            </p>
          </div>
        </div>
      </header>

      {/* Main Asymmetrical 2-Column Dashboard Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ── KOLOM KIRI / UTAMA (2/3 Width) ────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Daily Streak Tracker Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Konsistensi Belajar
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                    Streak {streakDays} Hari Berturut-turut
                  </h3>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Sedang Berjalan
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Buka materi atau selesaikan minimal 1 agenda belajar setiap hari untuk mempertahankan streak.
              </p>

              {/* Senin - Minggu Bulatan / Kotak Horizontal */}
              <div className="flex gap-2 sm:gap-3 justify-between">
                {weekDays.map((d, i) => (
                  <div
                    key={i}
                    className={`flex-1 text-center flex flex-col items-center justify-center transition-all ${
                      d.active
                        ? 'bg-indigo-600 text-white rounded-xl p-3 shadow-sm'
                        : 'bg-slate-100 text-slate-400 rounded-xl p-3'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase">{d.day}</span>
                    <div className="mt-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                      {d.active ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. XP Progress Level Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Tingkat Kemahiran
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
                    {level}
                  </h3>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {currentXP} <span className="text-xs font-normal text-slate-400">/ {xpTarget} XP</span>
                </span>
              </div>

              {/* Sleek Progress Bar with Indigo Gradient Fill */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{xpPercent}% terselesaikan menuju jenjang berikutnya</span>
                <span className="font-semibold text-indigo-600">
                  Kurang {Math.max(0, xpTarget - currentXP)} XP
                </span>
              </div>
            </div>

            {/* 3. Misi Belajar Checklist Card List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                    Misi Belajar Aktif
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selesaikan target modul mingguan untuk mengklaim reward poin pengalaman.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {quests.filter((q) => q.completed).length} dari {quests.length} Selesai
                </span>
              </div>

              {/* Checklist Card List */}
              <div className="space-y-3">
                {quests.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => toggleQuest(q.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                      q.completed
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Custom Checkbox */}
                    <button
                      type="button"
                      aria-label="Tandai misi selesai"
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold mt-0.5 transition-colors flex-shrink-0 ${
                        q.completed
                          ? 'bg-indigo-600 text-white'
                          : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                    >
                      ✓
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold leading-tight ${
                            q.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {q.title}
                        </h4>
                        {/* XP Badge */}
                        <span className="bg-amber-50 text-amber-600 font-semibold text-xs px-2.5 py-1 rounded-lg flex-shrink-0">
                          +{q.xpReward} XP
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-normal">
                        {q.description}
                      </p>

                      <div className="pt-2 flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          Kategori: {q.category}
                        </span>
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              q.completed ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${q.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {q.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── KOLOM KANAN / SIDEBAR (1/3 Width) ────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. Lencana Prestasi (Badges Grid) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Lencana Prestasi
                </h3>
                <span className="text-xs text-slate-400 font-medium">Koleksi Digital</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      b.unlocked
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{b.unlocked ? '🎖️' : '🔒'}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {b.title}
                          </h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                            Tier {b.tier}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        b.unlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {b.unlocked ? 'Terbuka' : 'Terkunci'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Papan Peringkat (Leaderboard Table/List) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Papan Peringkat
                </h3>
                <span className="text-xs font-semibold text-indigo-600">Nasional</span>
              </div>

              <div className="space-y-2">
                {leaderboard.map((user) => {
                  // Aksen khusus untuk peringkat 1 (Gold), 2 (Silver), 3 (Bronze)
                  const isGold = user.rank === 1;
                  const isSilver = user.rank === 2;
                  const isBronze = user.rank === 3;

                  const badgeClass = isGold
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isSilver
                    ? 'bg-slate-200 text-slate-700 border border-slate-300'
                    : isBronze
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200';

                  return (
                    <div
                      key={user.rank}
                      className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all ${
                        user.isCurrentUser
                          ? 'bg-indigo-50/70 border border-indigo-200 font-medium'
                          : 'bg-white border border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Rank Badge */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${badgeClass}`}
                        >
                          {user.rank}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-600 text-white font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{user.college}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-indigo-600">{user.xp} XP</div>
                        <div className="text-[10px] text-slate-400">{user.streak} hari streak</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action to Study Planner */}
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Punya Tugas Kuliah Baru?
              </h4>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Catat tenggat tugas akademis Anda sekarang agar otomatis masuk ke jadwal belajar adaptif.
              </p>
              <Link
                to="/form"
                className="inline-block w-full py-2.5 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                + Tambah Tugas Baru
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
