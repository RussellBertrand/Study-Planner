import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const INITIAL_FORM = {
  title: "",
  subject: "",
  deadline: "",
  priority: "Medium",
};

const SUBJECTS = [
  "Deep Learning",
  "Visual Perception",
  "Web and Mobile Application Development",
  "Human-Computer Interaction",
  "Data Communication and Computer Network Security",
  "Christian Faith and Ethics",
];

function FormPage({ onAddTask, currentUser, onLogout }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // trim() agar input yang hanya berisi spasi juga dianggap kosong
    if (formData.title.trim() === "" || formData.deadline === "") {
      setError("Judul tugas dan deadline wajib diisi.");
      return; // hentikan proses, jangan tambah tugas
    }

    const newTask = {
      id: Date.now(),
      title: formData.title.trim(),
      subject: formData.subject || "Umum",
      deadline: formData.deadline,
      priority: formData.priority,
    };

    onAddTask(newTask);

    setError("");
    setFormData(INITIAL_FORM);
    navigate("/dashboard");
  };

  return (
    <div className="page-wrapper">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="form-page-main">
        <div className="form-page-inner">
          
          {/* Bagian Kiri: Judul, Deskripsi & Panduan */}
          <div className="form-page-left">
            <Link to="/dashboard" className="back-nav-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Kembali ke Dashboard
            </Link>

            <h1 className="form-page-title">Tambah Tugas Baru</h1>
            <p className="form-page-desc">
              Kelola jadwal tugas akademis dan kursus Anda secara sistematis. Tambahkan detail tugas baru agar tidak melewatkan deadline penting.
            </p>

            <div className="form-tips">
              <h3 className="form-tips-title">Tips Manajemen Tugas</h3>
              <ul className="form-tips-list">
                <li>Bagi tugas besar menjadi beberapa sub-tugas kecil yang lebih mudah dikerjakan.</li>
                <li>Tetapkan prioritas tinggi untuk tugas yang mendekati deadline atau berbobot nilai besar.</li>
                <li>Gunakan deskripsi judul yang spesifik agar memudahkan pemantauan progres belajar Anda.</li>
                <li>Periksa dashboard secara berkala untuk memantau sisa waktu pengerjaan tugas.</li>
              </ul>
            </div>
          </div>

          {/* Bagian Kanan: Form Card */}
          <div className="form-page-right">
            {error && (
              <div className="form-alert-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="task-form" noValidate>
              
              {/* Judul Tugas */}
              <div className="form-field">
                <label htmlFor="title" className="form-label">
                  Judul tugas <span className="required-mark">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Laporan praktikum CNN"
                  value={formData.title}
                  onChange={handleChange}
                />
                <span className="form-field-hint">Tuliskan nama tugas atau aktivitas belajar Anda dengan jelas.</span>
              </div>

              {/* Mata Kuliah */}
              <div className="form-field">
                <label htmlFor="subject" className="form-label">Mata kuliah</label>
                <div className="select-wrap">
                  <select
                    id="subject"
                    name="subject"
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="">-- Pilih mata kuliah --</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <span className="form-field-hint">Pilih mata kuliah terkait, atau kosongkan untuk tugas umum.</span>
              </div>

              {/* Deadline */}
              <div className="form-field">
                <label htmlFor="deadline" className="form-label">
                  Deadline <span className="required-mark">*</span>
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                />
                <span className="form-field-hint">Tentukan batas akhir pengumpulan atau waktu penyelesaian tugas.</span>
              </div>

              {/* Tingkat Prioritas */}
              <div className="form-field">
                <span className="form-label">Prioritas</span>
                <div className="priority-selector">
                  <div
                    className={`priority-option priority-low ${formData.priority === 'Low' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'Low' }))}
                  >
                    <div className="priority-option-dot"></div>
                    <div className="priority-option-info">
                      <div className="priority-option-label">Low Priority</div>
                      <div className="priority-option-desc">Tugas santai yang memiliki deadline panjang atau tingkat urgensi rendah.</div>
                    </div>
                  </div>

                  <div
                    className={`priority-option priority-medium ${formData.priority === 'Medium' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'Medium' }))}
                  >
                    <div className="priority-option-dot"></div>
                    <div className="priority-option-info">
                      <div className="priority-option-label">Medium Priority</div>
                      <div className="priority-option-desc">Tugas standar perkuliahan harian dengan tenggat waktu menengah.</div>
                    </div>
                  </div>

                  <div
                    className={`priority-option priority-high ${formData.priority === 'High' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'High' }))}
                  >
                    <div className="priority-option-dot"></div>
                    <div className="priority-option-info">
                      <div className="priority-option-label">High Priority</div>
                      <div className="priority-option-desc">Sangat penting! Tugas besar, ujian, atau proyek kelompok akademis yang mendesak.</div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-submit-form">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Tambah tugas
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FormPage;