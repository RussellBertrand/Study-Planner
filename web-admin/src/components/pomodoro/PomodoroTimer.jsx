import React from 'react';

export default function PomodoroTimer({
  mode,
  timeLeft,
  isRunning,
  selectedTaskId,
  setSelectedTaskId,
  soundscape,
  setSoundscape,
  volume,
  setVolume,
  switchMode,
  toggleTimer,
  resetTimer,
  PRESETS,
  tasks = [],
}) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotal = PRESETS[mode].minutes * 60;
  const progressPercent = Math.round(((currentTotal - timeLeft) / currentTotal) * 100);

  const selectedTask = tasks.find((t) => String(t.id) === String(selectedTaskId));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Mode Switch Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl max-w-md mx-auto">
        {Object.entries(PRESETS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === key
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {config.label} ({config.minutes}m)
          </button>
        ))}
      </div>

      {/* Task Linker Dropdown */}
      <div className="max-w-md mx-auto space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
          Tautkan Sesi Fokus ke Tugas:
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Fokus Mandiri (Tanpa Tugas Spesifik) --</option>
          {tasks
            .filter((t) => t.status !== 'completed')
            .map((task) => (
              <option key={task.id} value={task.id}>
                [{task.priority || 'Medium'}] {task.title} ({task.subject || 'Umum'})
              </option>
            ))}
        </select>
        {selectedTask && (
          <p className="text-[11px] text-center text-indigo-600 font-medium">
            🎯 Fokus pada tugas: <strong>{selectedTask.title}</strong>
          </p>
        )}
      </div>

      {/* Modern Circular / Progress Countdown Display */}
      <div className="text-center py-4 space-y-2">
        <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight text-slate-900">
          {formattedTime}
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {mode === 'focus' ? 'Sesi Belajar Aktif' : 'Waktu Istirahat'} • {progressPercent}% Selesai
        </p>

        {/* Linear Progress Bar */}
        <div className="w-full max-w-sm mx-auto bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-500 ${
              mode === 'focus' ? 'bg-indigo-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-sm active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
          }`}
        >
          {isRunning ? '⏸ Jeda Sesi' : '▶ Mulai Fokus'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-3 rounded-xl font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          title="Reset timer"
        >
          ↺ Reset
        </button>
      </div>

      {/* Ambient Soundscapes Controls */}
      <div className="pt-5 border-t border-slate-100 max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span>🎧</span> Audio Latar Belakang (Soundscape):
          </span>
          <span className="text-[11px] text-slate-400 capitalize">
            {soundscape === 'none' ? 'Mati' : soundscape}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'none', label: 'Hening', icon: '🔇' },
            { id: 'rain', label: 'Hujan', icon: '🌧️' },
            { id: 'whitenoise', label: 'White Noise', icon: '📻' },
            { id: 'cafe', label: 'Cafe Ambience', icon: '☕' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSoundscape(item.id)}
              className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                soundscape === item.id
                  ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 font-bold'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {soundscape !== 'none' && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-[11px] text-slate-400">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-500 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

