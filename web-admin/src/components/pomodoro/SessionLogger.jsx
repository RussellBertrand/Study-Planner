import React from 'react';

export default function SessionLogger({ sessions = [], tasks = [], onClearSessions }) {
  // Calculate today's total study minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date && s.date.startsWith(todayStr));
  const todayMinutes = todaySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  // Calculate this week's total minutes (last 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter((s) => new Date(s.date) >= oneWeekAgo);
  const weekMinutes = weekSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const getTaskTitle = (taskId) => {
    if (!taskId) return 'Sesi Mandiri Umum';
    const found = tasks.find((t) => String(t.id) === String(taskId));
    return found ? found.title : 'Tugas #' + taskId;
  };

  const formatSessionTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">Log Sesi Belajar Aktif</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam jejak akumulasi waktu produktif Anda secara otomatis.
          </p>
        </div>
        {sessions.length > 0 && onClearSessions && (
          <button
            onClick={onClearSessions}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
          >
            Hapus Riwayat
          </button>
        )}
      </div>

      {/* Metric Cards (Hari Ini vs Mingguan) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Hari Ini
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-1">
            {todayMinutes} <span className="text-xs font-normal text-slate-500">Menit</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">
            {todaySessions.length} Sesi Pomodoro
          </span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Akumulasi 7 Hari
          </span>
          <div className="text-2xl font-extrabold text-indigo-950 font-display mt-1">
            {(weekMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-indigo-700">Jam</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">
            {weekSessions.length} Total Sesi
          </span>
        </div>
      </div>

      {/* Session History List */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Riwayat Sesi Terakhir
        </span>

        {sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            Belum ada riwayat sesi. Selesaikan 1 putaran timer fokus untuk mencatat log otomatis.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sessions.slice(0, 10).map((sess) => (
              <div
                key={sess.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800 leading-tight">
                      {getTaskTitle(sess.taskId)}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(sess.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      • {formatSessionTime(sess.date)}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200">
                  +{sess.durationMinutes} m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

