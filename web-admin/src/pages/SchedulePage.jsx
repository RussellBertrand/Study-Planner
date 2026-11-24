import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function SchedulePage({ currentUser, onLogout }) {
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    day_of_week: 'Senin',
    start_time: '08:00',
    end_time: '10:00',
    room: '',
    lecturer: '',
    notes: '',
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getSchedules(selectedDay === 'ALL' ? null : selectedDay);
      setSchedules(data.schedules || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err.message || 'Gagal memuat jadwal dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDay]);

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setFormData({
      title: '',
      subject: '',
      day_of_week: selectedDay === 'ALL' ? 'Senin' : selectedDay,
      start_time: '08:00',
      end_time: '10:00',
      room: '',
      lecturer: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingSchedule(item);
    setFormData({
      title: item.title,
      subject: item.subject,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room || '',
      lecturer: item.lecturer || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Hapus jadwal "${title}"?`)) {
      try {
        await api.deleteSchedule(id);
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert(err.message || 'Gagal menghapus jadwal.');
      }
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        const res = await api.updateSchedule(editingSchedule.id, formData);
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingSchedule.id ? res.schedule : s))
        );
      } else {
        const res = await api.createSchedule(formData);
        setSchedules((prev) => [...prev, res.schedule]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan jadwal.');
    }
  };

  const filteredSchedules =
    selectedDay === 'ALL'
      ? schedules
      : schedules.filter((s) => s.day_of_week === selectedDay);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Jadwal Kuliah & Belajar 🗓️
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Atur agenda perkuliahan mingguan, ruang kelas, dan dosen pengampu dengan sinkronisasi otomatis.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all self-start md:self-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Jadwal</span>
          </button>
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedDay === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            Semua Hari ({schedules.length})
          </button>
          {DAYS_OF_WEEK.map((day) => {
            const count = schedules.filter((s) => s.day_of_week === day).length;
            const active = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {day} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Content State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Memuat jadwal perkuliahan...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-sm">
            {error}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/60 p-8 shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-3xl">
              📅
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum Ada Jadwal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ada jadwal kuliah untuk hari yang dipilih. Klik tombol Tambah Jadwal untuk menyusun agenda studi Anda.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Tambah Jadwal Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchedules.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                      {item.day_of_week}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      ⏱️ {item.start_time} - {item.end_time}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                    📚 {item.subject}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.room && (
                      <p className="flex items-center gap-1.5">
                        <span className="text-slate-400">📍 Ruang:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.room}</span>
                      </p>
                    )}
                    {item.lecturer && (
                      <p className="flex items-center gap-1.5">
                        <span className="text-slate-400">👨‍🏫 Dosen:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.lecturer}</span>
                      </p>
                    )}
                    {item.notes && (
                      <p className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Edit jadwal"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus jadwal"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingSchedule ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah Baru'}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Agenda / Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Kuliah Teori Deep Learning"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Contoh: Deep Learning"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hari *
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ruangan
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Contoh: Lab AI / Zoom"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    value={formData.lecturer}
                    onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                    placeholder="Nama dosen"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instruksi tugas atau persiapan pertemuan..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
