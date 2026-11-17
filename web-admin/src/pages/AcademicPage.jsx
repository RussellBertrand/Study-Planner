import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseHub from '../components/academic/CourseHub';
import GpaCalculator from '../components/academic/GpaCalculator';

export default function AcademicPage({ currentUser, tasks = [], onLogout }) {
  const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'gpa'

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Pengorganisasian Akademik Mahasiswa
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Manajemen Mata Kuliah & Simulasi IPK
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Kelola jadwal mingguan, catatan silabus, bobot penilaian modul, dan simulasikan indeks prestasi kumulatif secara presisi.
            </p>
          </div>

          {/* Sub Navigation Switcher */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'hub'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🏛️</span>
              <span>Course Hub (Mata Kuliah & Silabus)</span>
            </button>
            <button
              onClick={() => setActiveTab('gpa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gpa'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📊</span>
              <span>Kalkulator Target IPK & Nilai</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'hub' ? (
          <CourseHub tasks={tasks} currentUser={currentUser} />
        ) : (
          <GpaCalculator currentUser={currentUser} />
        )}
      </main>

      <Footer />
    </div>
  );
}

