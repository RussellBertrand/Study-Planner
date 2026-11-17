import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CATEGORIES, COURSES } from '../data/courses';
import { getEnrolledCourseIds, enrollCourse } from '../utils/courseStorage';
import { awardXP } from '../utils/gamification';

export default function CoursesPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(() => getEnrolledCourseIds(currentUser?.id));

  useEffect(() => {
    setEnrolledIds(getEnrolledCourseIds(currentUser?.id));
  }, [currentUser?.id]);

  // Filter courses by category and search query
  const filteredCourses = useMemo(() => {
    return COURSES.filter((course) => {
      const matchCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleEnroll = (course) => {
    const updated = enrollCourse(currentUser?.id, course.id);
    setEnrolledIds(updated);
    awardXP(currentUser?.id, 50, `Pendaftaran kursus: ${course.title}`);
    setEnrolledCourse(course.title);
    setTimeout(() => setEnrolledCourse(null), 3500);
  };

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Floating Enrollment Toast */}
      {enrolledCourse && (
        <div className="toast-notification fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">Pendaftaran Berhasil</p>
            <p className="text-slate-300">
              Terdaftar di: <span className="text-emerald-400 font-medium">{enrolledCourse}</span>
            </p>
          </div>
        </div>
      )}

      {/* Clean Minimalist Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Katalog Kurikulum Terapan
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Eksplorasi Program & Kursus Industri
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tingkatkan kompetensi rekayasa perangkat lunak, desain produk, dan analitika data dengan kurikulum komprehensif tanpa biaya.
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Filter & Header Section (Horizontal Flex Bar) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input Bar with Magnifier Icon & Focus Ring */}
          <div className="relative w-full sm:w-80">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kursus atau instruktur..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Course Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6 pb-2 border-b border-slate-200">
          <span>
            Menampilkan <strong>{filteredCourses.length}</strong> kursus yang relevan
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Hapus Filter Pencarian
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Tidak ada kursus yang cocok</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Coba gunakan istilah kata kunci lain atau pilih kategori berbeda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Tampilkan Semua Kursus
            </button>
          </div>
        ) : (
          /* Responsive CSS Grid (1 col mobile, 2 col tablet, 3 col desktop) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isExpanded = expandedCourse === course.id;

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail with exact aspect-video */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="aspect-video object-cover w-full hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950/75 backdrop-blur-sm text-white">
                        {course.duration}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      {/* Category Badge & Rating */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <span className="text-amber-500">★</span> {course.rating}
                          <span className="text-slate-400 font-normal">({course.studentsCount.toLocaleString()})</span>
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Course Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Instructor Area (Avatar bulat w-8 h-8 rounded-full samping nama) */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none">
                            {course.instructor.name}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {course.instructor.role}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Syllabus */}
                      {isExpanded && (
                        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px]">
                            Silabus Program:
                          </p>
                          <ul className="text-slate-600 dark:text-slate-300 space-y-1 pl-3.5 list-disc">
                            {course.syllabus.map((item, idx) => (
                              <li key={idx} className="leading-tight">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {isExpanded ? 'Tutup Silabus' : 'Silabus'}
                    </button>
                    {enrolledIds.includes(course.id) ? (
                      <span className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center flex items-center justify-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Terdaftar
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course)}
                        className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] shadow-sm transition-all text-center"
                      >
                        Daftar Kursus
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Study Planner Integration Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Sinkronkan dengan Jadwal Belajar Harian
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Gunakan Study Planner untuk mengatur tenggat tugas modul, memantau streak belajar, dan mempertahankan ritme belajar teratur.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-all shadow-sm whitespace-nowrap"
          >
            Buka Study Planner →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
