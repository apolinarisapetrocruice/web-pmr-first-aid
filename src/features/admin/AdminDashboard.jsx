import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BookOpen,
  Video,
  HelpCircle,
  Users,
  Phone,
  TrendingUp,
  LogOut,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  Clock,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('summary');

  // Data States
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'material', 'video', 'quiz', 'contact', 'user'
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [formMaterial, setFormMaterial] = useState({ title: '', subtitle: '', content: '', imageAssets: '' });
  const [formVideo, setFormVideo] = useState({ title: '', description: '', videoUrl: '', folderUrl: '', durationText: '' });
  const [formQuiz, setFormQuiz] = useState({ question: '', opt0: '', opt1: '', opt2: '', opt3: '', correctAnswerIndex: 0, explanation: '', part: 1, number: 1 });
  const [formContact, setFormContact] = useState({ serviceName: '', phoneNumber: '', description: '' });
  const [formUser, setFormUser] = useState({ name: '', username: '', password: '', role: 'student' });
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const rawUsers = localStorageService.getUsers();
    setUsers(rawUsers);

    // Students are users with student role
    const studList = rawUsers.filter(u => u.role === 'student').map(u => {
      // Load progress
      const key = `user_profile_${u.username}`;
      const data = localStorage.getItem(key);
      let profile = { xp: 0, readMaterials: [], quizHistory: [] };
      if (data) {
        try {
          profile = JSON.parse(data);
        } catch (_) { }
      }
      return { ...u, ...profile };
    });
    setStudents(studList);

    setMaterials(localStorageService.getLearningMaterials());
    setVideos(localStorageService.getPracticeVideos());
    setQuizzes(localStorageService.getQuizQuestions());
    setContacts(localStorageService.getEmergencyContacts());
  };

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = () => {
    localStorageService.logoutUser();
    onLogout();
  };

  // --- CRUD HANDLERS ---
  const handleOpenAdd = (type) => {
    setEditingItem(null);
    setModalType(type);

    // Reset forms
    if (type === 'material') {
      setFormMaterial({ title: '', subtitle: '', content: '', imageAssets: '' });
    } else if (type === 'video') {
      setFormVideo({ title: '', description: '', videoUrl: '', folderUrl: '', durationText: '' });
    } else if (type === 'quiz') {
      const nextNum = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.number || 0)) + 1 : 1;
      setFormQuiz({ question: '', opt0: '', opt1: '', opt2: '', opt3: '', correctAnswerIndex: 0, explanation: '', part: 1, number: nextNum });
    } else if (type === 'contact') {
      setFormContact({ serviceName: '', phoneNumber: '', description: '' });
    } else if (type === 'user') {
      setFormUser({ name: '', username: '', password: '', role: 'student' });
    }

    setShowModal(true);
  };

  const handleOpenEdit = (type, item) => {
    setEditingItem(item);
    setModalType(type);

    if (type === 'material') {
      setFormMaterial({
        title: item.title,
        subtitle: item.subtitle,
        content: item.content,
        imageAssets: item.imageAssets ? item.imageAssets.join(', ') : ''
      });
    } else if (type === 'video') {
      setFormVideo({
        title: item.title,
        description: item.description,
        videoUrl: item.videoUrl,
        folderUrl: item.folderUrl || '',
        durationText: item.durationText
      });
    } else if (type === 'quiz') {
      setFormQuiz({
        question: item.question,
        opt0: item.options[0] || '',
        opt1: item.options[1] || '',
        opt2: item.options[2] || '',
        opt3: item.options[3] || '',
        correctAnswerIndex: item.correctAnswerIndex,
        explanation: item.explanation || '',
        part: item.part || 1,
        number: item.number || 1
      });
    } else if (type === 'contact') {
      setFormContact({
        serviceName: item.serviceName,
        phoneNumber: item.phoneNumber,
        description: item.description || ''
      });
    } else if (type === 'user') {
      setFormUser({
        name: item.name,
        username: item.username,
        password: item.password,
        role: item.role
      });
    }

    setShowModal(true);
  };

  const handleDeleteClick = (type, id) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const { type, id } = deleteTarget;
    if (type === 'material') {
      localStorageService.deleteLearningMaterial(id);
    } else if (type === 'video') {
      localStorageService.deletePracticeVideo(id);
    } else if (type === 'quiz') {
      localStorageService.deleteQuizQuestion(id);
    } else if (type === 'contact') {
      localStorageService.deleteEmergencyContact(id);
    } else if (type === 'user') {
      const u = users.find(x => x.id === id);
      if (u && u.username === 'admin') {
        alert('Akun admin utama tidak dapat dihapus!');
        setShowDeleteConfirm(false);
        return;
      }
      const updatedUsers = users.filter(x => x.id !== id);
      localStorageService.saveUsers(updatedUsers);
      // Also clean their profile
      if (u) {
        localStorage.removeItem(`user_profile_${u.username}`);
      }
    }
    setShowDeleteConfirm(false);
    loadAllData();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget({ type: '', id: null });
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (modalType === 'material') {
      const imagesArr = formMaterial.imageAssets
        ? formMaterial.imageAssets.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      if (editingItem) {
        localStorageService.updateLearningMaterial({
          ...editingItem,
          title: formMaterial.title,
          subtitle: formMaterial.subtitle,
          content: formMaterial.content,
          imageAssets: imagesArr
        });
      } else {
        localStorageService.addLearningMaterial({
          id: 'lm_' + Date.now(),
          title: formMaterial.title,
          subtitle: formMaterial.subtitle,
          content: formMaterial.content,
          imageAssets: imagesArr
        });
      }
    }

    else if (modalType === 'video') {
      if (editingItem) {
        localStorageService.updatePracticeVideo({
          ...editingItem,
          title: formVideo.title,
          description: formVideo.description,
          videoUrl: formVideo.videoUrl,
          folderUrl: formVideo.folderUrl,
          durationText: formVideo.durationText
        });
      } else {
        localStorageService.addPracticeVideo({
          id: 'pv_' + Date.now(),
          title: formVideo.title,
          description: formVideo.description,
          videoUrl: formVideo.videoUrl,
          folderUrl: formVideo.folderUrl,
          durationText: formVideo.durationText
        });
      }
    }

    else if (modalType === 'quiz') {
      const opts = [formQuiz.opt0, formQuiz.opt1, formQuiz.opt2, formQuiz.opt3].map(o => o.trim());
      if (opts.some(o => !o)) {
        alert('Semua pilihan jawaban harus diisi!');
        return;
      }

      const quizData = {
        question: formQuiz.question,
        options: opts,
        correctAnswerIndex: parseInt(formQuiz.correctAnswerIndex),
        explanation: formQuiz.explanation,
        part: parseInt(formQuiz.part),
        number: parseInt(formQuiz.number)
      };

      if (editingItem) {
        localStorageService.updateQuizQuestion({
          ...editingItem,
          ...quizData
        });
      } else {
        localStorageService.addQuizQuestion({
          id: 'q_' + Date.now(),
          ...quizData
        });
      }
    }

    else if (modalType === 'contact') {
      if (editingItem) {
        localStorageService.updateEmergencyContact({
          id: editingItem.id,
          serviceName: formContact.serviceName,
          phoneNumber: formContact.phoneNumber,
          description: formContact.description
        });
      } else {
        localStorageService.addEmergencyContact({
          id: 'ec_' + Date.now(),
          serviceName: formContact.serviceName,
          phoneNumber: formContact.phoneNumber,
          description: formContact.description
        });
      }
    }

    else if (modalType === 'user') {
      const cleanUsername = formUser.username.trim().toLowerCase();

      if (editingItem) {
        // Edit User
        const updatedUsers = users.map(u => {
          if (u.id === editingItem.id) {
            return {
              ...u,
              name: formUser.name.trim(),
              username: formUser.username.trim(),
              password: formUser.password,
              role: formUser.role
            };
          }
          return u;
        });
        localStorageService.saveUsers(updatedUsers);
      } else {
        // Add User
        const exists = users.some(u => u.username.toLowerCase() === cleanUsername);
        if (exists) {
          alert('Username sudah digunakan!');
          return;
        }

        const newUser = {
          id: 'usr_' + Date.now(),
          name: formUser.name.trim(),
          username: formUser.username.trim(),
          password: formUser.password,
          role: formUser.role
        };
        const list = [...users, newUser];
        localStorageService.saveUsers(list);

        // Init profile
        const profileKey = `user_profile_${newUser.username}`;
        const newProfile = {
          name: newUser.name,
          role: newUser.role === 'admin' ? 'Administrator' : 'PMR Madya',
          xp: 0,
          quizHistory: [],
          readMaterials: [],
          unlockedAchievements: []
        };
        localStorage.setItem(profileKey, JSON.stringify(newProfile));
      }
    }

    setShowModal(false);
    loadAllData();
  };

  return (
    <div className="admin-container">
      {/* Delete Confirmation Popup Modal */}
      {showDeleteConfirm && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-card">
            <div className="custom-popup-icon-container warning">
              <Trash2 size={32} />
            </div>
            <h3 className="custom-popup-title">Konfirmasi Hapus</h3>
            <p className="custom-popup-message">Apakah anda yakin ingin menghapus bagian ini?</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="custom-popup-btn"
                style={{ backgroundColor: 'var(--text-gray)', boxShadow: 'none', flex: 1 }}
                onClick={cancelDelete}
              >
                Tidak
              </button>
              <button
                type="button"
                className="custom-popup-btn"
                style={{ backgroundColor: 'var(--primary-red)', flex: 1 }}
                onClick={confirmDelete}
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Popup Modal */}
      {showLogoutPopup && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-card">
            <div className="custom-popup-icon-container warning">
              <LogOut size={32} />
            </div>
            <h3 className="custom-popup-title">Hati-hati di jalan</h3>
            <p className="custom-popup-message">
              Anda akan keluar dari dashboard Admin PMR First Aid. Sampai jumpa kembali!
            </p>
            <button
              className="custom-popup-btn"
              onClick={() => {
                setShowLogoutPopup(false);
                confirmLogout();
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img
            src="/assets/images/logo.png"
            alt="Logo PMI"
            className="brand-logo"
          />
          <div>
            <h1 className="logo-title">PMR ADMIN</h1>
            <p className="logo-subtitle">Kontrol Portal Pembelajaran</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <TrendingUp size={18} />
            <span>Ringkasan</span>
          </button>

          <button
            className={`admin-nav-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <BookOpen size={18} />
            <span>Kelola Materi</span>
          </button>

          <button
            className={`admin-nav-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <Video size={18} />
            <span>Kelola Video</span>
          </button>

          <button
            className={`admin-nav-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <HelpCircle size={18} />
            <span>Kelola Kuis</span>
          </button>

          <button
            className={`admin-nav-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Phone size={18} />
            <span>Kontak Darurat</span>
          </button>

          <button
            className={`admin-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
              setSelectedStudentHistory(null);
            }}
          >
            <Users size={18} />
            <span>Progres Siswa</span>
          </button>

          <button
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} style={{ color: 'var(--learning-blue)' }} />
            <span>Akun Pengguna</span>
          </button>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogoutClick}>
          <LogOut size={18} />
          <span>Keluar Sistem</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2 className="admin-header-title">
              {activeTab === 'summary' && 'Ringkasan Statistik'}
              {activeTab === 'materials' && 'Manajemen Materi Pembelajaran'}
              {activeTab === 'videos' && 'Manajemen Video Peraga'}
              {activeTab === 'quizzes' && 'Manajemen Soal Kuis'}
              {activeTab === 'contacts' && 'Manajemen Kontak Darurat'}
              {activeTab === 'students' && 'Aktivitas & Progres Belajar Siswa'}
              {activeTab === 'users' && 'Manajemen Akun Pengguna'}
            </h2>
            <p className="admin-header-subtitle">
              Sistem Administrator PMR First Aid • Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="admin-header-badge">
            <span className="badge-dot"></span> Admin Mode
          </div>
        </header>

        <div className="admin-content-body">

          {/* ==================== SUMMARY TAB ==================== */}
          {activeTab === 'summary' && (
            <div className="summary-tab fade-in">
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="stat-icon-wrap" style={{ backgroundColor: 'var(--soft-red)' }}>
                    <Users size={24} color="var(--primary-red)" />
                  </div>
                  <div className="stat-data">
                    <span className="stat-num">{students.length}</span>
                    <span className="stat-label">Siswa Terdaftar</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon-wrap" style={{ backgroundColor: '#E3F2FD' }}>
                    <BookOpen size={24} color="var(--learning-blue)" />
                  </div>
                  <div className="stat-data">
                    <span className="stat-num">{materials.length}</span>
                    <span className="stat-label">Materi Belajar</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon-wrap" style={{ backgroundColor: '#FFF3E0' }}>
                    <Video size={24} color="var(--practice-orange)" />
                  </div>
                  <div className="stat-data">
                    <span className="stat-num">{videos.length}</span>
                    <span className="stat-label">Video Peraga</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon-wrap" style={{ backgroundColor: '#E8F5E9' }}>
                    <HelpCircle size={24} color="var(--mitigation-green)" />
                  </div>
                  <div className="stat-data">
                    <span className="stat-num">{quizzes.length}</span>
                    <span className="stat-label">Soal Kuis</span>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-layout">
                {/* User List summary */}
                <div className="admin-card">
                  <h3 className="card-title">Siswa Berprestasi (XP Tertinggi)</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nama Siswa</th>
                          <th>Username</th>
                          <th>Tingkat XP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.sort((a, b) => b.xp - a.xp).slice(0, 5).map(s => (
                          <tr key={s.id}>
                            <td className="font-bold">{s.name}</td>
                            <td>{s.username}</td>
                            <td>
                              <span className="xp-badge">{s.xp} XP</span>
                            </td>
                          </tr>
                        ))}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '24px 0' }}>Belum ada siswa terdaftar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick info */}
                <div className="admin-card info-card">
                  <h3 className="card-title"><Info size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Panduan Administrator</h3>
                  <p>Sebagai Administrator, Anda bertanggung jawab penuh untuk mengelola modul pembelajaran di aplikasi PMR First Aid.</p>
                  <ul className="guide-list">
                    <li>Semua perubahan data (tambah/edit/hapus) langsung tersinkronisasi di sisi aplikasi Siswa.</li>
                    <li>Gunakan menu <strong>Progres Siswa</strong> untuk memantau nilai kuis dan riwayat belajar masing-masing siswa secara real-time.</li>
                    <li>Siswa tidak dapat mengubah atau menghapus data kontak darurat standar bawaan, hak eksklusif tersebut hanya dimiliki oleh Admin.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MATERIALS TAB ==================== */}
          {activeTab === 'materials' && (
            <div className="materials-tab fade-in">
              <div className="action-header">
                <h3>Daftar Materi Belajar ({materials.length})</h3>
                <button className="admin-btn-primary" onClick={() => handleOpenAdd('material')}>
                  <Plus size={16} /> Tambah Materi
                </button>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Judul Materi</th>
                        <th>Subjudul / Topik Utama</th>
                        <th>Jumlah Gambar</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map(m => (
                        <tr key={m.id}>
                          <td className="font-bold">{m.title}</td>
                          <td className="text-gray">{m.subtitle}</td>
                          <td>{m.imageAssets ? m.imageAssets.length : 0} gambar</td>
                          <td>
                            <div className="actions-wrap">
                              <button className="btn-edit" onClick={() => handleOpenEdit('material', m)}><Edit size={14} /> Edit</button>
                              <button className="btn-delete" onClick={() => handleDeleteClick('material', m.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIDEOS TAB ==================== */}
          {activeTab === 'videos' && (
            <div className="videos-tab fade-in">
              <div className="action-header">
                <h3>Daftar Video Peraga ({videos.length})</h3>
                <button className="admin-btn-primary" onClick={() => handleOpenAdd('video')}>
                  <Plus size={16} /> Tambah Video
                </button>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Judul Video</th>
                        <th>Durasi</th>
                        <th>Keterangan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map(v => (
                        <tr key={v.id}>
                          <td className="font-bold">{v.title}</td>
                          <td><span className="duration-badge"><Clock size={12} /> {v.durationText}</span></td>
                          <td className="text-gray" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.description}</td>
                          <td>
                            <div className="actions-wrap">
                              <button className="btn-edit" onClick={() => handleOpenEdit('video', v)}><Edit size={14} /> Edit</button>
                              <button className="btn-delete" onClick={() => handleDeleteClick('video', v.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== QUIZZES TAB ==================== */}
          {activeTab === 'quizzes' && (
            <div className="quizzes-tab fade-in">
              <div className="action-header">
                <h3>Daftar Soal Kuis ({quizzes.length})</h3>
                <button className="admin-btn-primary" onClick={() => handleOpenAdd('quiz')}>
                  <Plus size={16} /> Tambah Soal
                </button>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>No & Bagian</th>
                        <th>Teks Soal</th>
                        <th>Pilihan Jawaban (Indeks Benar)</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.sort((a, b) => (a.part - b.part) || (a.number - b.number)).map(q => (
                        <tr key={q.id}>
                          <td>
                            <span className="part-badge">Part {q.part}</span>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>No. {q.number}</div>
                          </td>
                          <td style={{ maxWidth: '280px', fontWeight: 600 }}>{q.question}</td>
                          <td>
                            <ul className="quiz-options-list">
                              {q.options.map((opt, idx) => (
                                <li key={idx} className={idx === q.correctAnswerIndex ? 'correct-opt' : ''}>
                                  {idx + 1}. {opt}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <div className="actions-wrap">
                              <button className="btn-edit" onClick={() => handleOpenEdit('quiz', q)}><Edit size={14} /> Edit</button>
                              <button className="btn-delete" onClick={() => handleDeleteClick('quiz', q.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CONTACTS TAB ==================== */}
          {activeTab === 'contacts' && (
            <div className="contacts-tab fade-in">
              <div className="action-header">
                <h3>Kelola Kontak Darurat ({contacts.length})</h3>
                <button className="admin-btn-primary" onClick={() => handleOpenAdd('contact')}>
                  <Plus size={16} /> Tambah Kontak
                </button>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Instansi / Layanan</th>
                        <th>Nomor Telepon</th>
                        <th>Keterangan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map(c => (
                        <tr key={c.id}>
                          <td className="font-bold">{c.serviceName}</td>
                          <td className="font-bold" style={{ color: 'var(--primary-red)' }}>{c.phoneNumber}</td>
                          <td className="text-gray">{c.description || '-'}</td>
                          <td>
                            <div className="actions-wrap">
                              <button className="btn-edit" onClick={() => handleOpenEdit('contact', c)}><Edit size={14} /> Edit</button>
                              <button className="btn-delete" onClick={() => handleDeleteClick('contact', c.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STUDENTS TAB ==================== */}
          {activeTab === 'students' && (
            <div className="students-tab fade-in">
              <div className="admin-dashboard-layout" style={{ gridTemplateColumns: selectedStudentHistory ? '1fr 1.1fr' : '1fr' }}>
                <div className="admin-card">
                  <h3 className="card-title">Daftar Aktivitas Belajar Siswa</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nama Lengkap</th>
                          <th>Username</th>
                          <th>Total XP</th>
                          <th>Materi Dibaca</th>
                          <th>Riwayat Kuis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.id} className={selectedStudentHistory?.username === s.username ? 'selected-row' : ''}>
                            <td className="font-bold">{s.name}</td>
                            <td>{s.username}</td>
                            <td><span className="xp-badge">{s.xp} XP</span></td>
                            <td><span className="material-badge">{s.readMaterials ? s.readMaterials.length : 0} / 9</span></td>
                            <td>
                              <button
                                className="btn-detail"
                                onClick={() => setSelectedStudentHistory(s)}
                              >
                                Lihat Detail ({s.quizHistory ? s.quizHistory.length : 0}) <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px 0' }}>Belum ada siswa terdaftar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Student Quiz History Side view */}
                {selectedStudentHistory && (
                  <div className="admin-card fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-gray)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>Riwayat Kuis: {selectedStudentHistory.name}</h3>
                      <button className="reset-btn" onClick={() => setSelectedStudentHistory(null)} style={{ border: 'none', background: 'none' }}><X size={18} /></button>
                    </div>

                    <div className="admin-quiz-history-list">
                      {selectedStudentHistory.quizHistory && selectedStudentHistory.quizHistory.length > 0 ? (
                        selectedStudentHistory.quizHistory.map((h, i) => (
                          <div key={i} className="admin-history-item">
                            <div className="history-header">
                              <span className="history-icon">{h.emoji || '📝'}</span>
                              <div>
                                <h4 className="history-label">{h.quizLabel}</h4>
                                <span className="history-time">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div className="history-score-wrap">
                              <span className="score-label">Skor:</span>
                              <span className="score-val">{h.score}/{h.total}</span>
                              <span className="mode-badge">{h.mode}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-gray)' }}>
                          Siswa ini belum pernah mengerjakan kuis.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== USERS TAB ==================== */}
          {activeTab === 'users' && (
            <div className="users-tab fade-in">
              <div className="action-header">
                <h3>Kelola Akun Pengguna ({users.length})</h3>
                <button className="admin-btn-primary" onClick={() => handleOpenAdd('user')}>
                  <Plus size={16} /> Tambah Akun
                </button>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nama Pengguna</th>
                        <th>Username</th>
                        <th>Kata Sandi</th>
                        <th>Peran (Role)</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="font-bold">{u.name}</td>
                          <td>{u.username}</td>
                          <td className="text-gray">{u.password}</td>
                          <td>
                            <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'student'}`}>
                              {u.role === 'admin' ? 'ADMIN' : 'SISWA'}
                            </span>
                          </td>
                          <td>
                            <div className="actions-wrap">
                              <button className="btn-edit" onClick={() => handleOpenEdit('user', u)}><Edit size={14} /> Edit</button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteClick('user', u.id)}
                                disabled={u.username === 'admin'}
                                style={{ opacity: u.username === 'admin' ? 0.4 : 1, cursor: u.username === 'admin' ? 'not-allowed' : 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==================== DYNAMIC FORM MODAL ==================== */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content admin-modal" onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-gray)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                {editingItem ? 'Edit ' : 'Tambah '}
                {modalType === 'material' && 'Materi Belajar'}
                {modalType === 'video' && 'Video Peraga'}
                {modalType === 'quiz' && 'Soal Kuis'}
                {modalType === 'contact' && 'Kontak Darurat'}
                {modalType === 'user' && 'Akun Pengguna'}
              </h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-form-fields">

              {/* MATERIAL FORM */}
              {modalType === 'material' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Judul Materi *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formMaterial.title}
                      onChange={(e) => setFormMaterial({ ...formMaterial, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subjudul *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formMaterial.subtitle}
                      onChange={(e) => setFormMaterial({ ...formMaterial, subtitle: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Konten Materi (Gunakan \n untuk baris baru) *</label>
                    <textarea
                      className="form-input"
                      style={{ height: '140px', resize: 'vertical' }}
                      value={formMaterial.content}
                      onChange={(e) => setFormMaterial({ ...formMaterial, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Aset Gambar (Pisahkan dengan koma) - Opsional</label>
                    <input
                      type="text"
                      placeholder="assets/images/materi/image_1.png, assets/images/materi/image_2.png"
                      className="form-input"
                      value={formMaterial.imageAssets}
                      onChange={(e) => setFormMaterial({ ...formMaterial, imageAssets: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* VIDEO FORM */}
              {modalType === 'video' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Judul Video *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formVideo.title}
                      onChange={(e) => setFormVideo({ ...formVideo, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi *</label>
                    <textarea
                      className="form-input"
                      style={{ height: '80px', resize: 'vertical' }}
                      value={formVideo.description}
                      onChange={(e) => setFormVideo({ ...formVideo, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL Video (Google Drive Link) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formVideo.videoUrl}
                      onChange={(e) => setFormVideo({ ...formVideo, videoUrl: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL Folder Drive Pendukung</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formVideo.folderUrl}
                      onChange={(e) => setFormVideo({ ...formVideo, folderUrl: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durasi Video (Contoh: 05:30) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formVideo.durationText}
                      onChange={(e) => setFormVideo({ ...formVideo, durationText: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {/* QUIZ FORM */}
              {modalType === 'quiz' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Pertanyaan (Teks Soal) *</label>
                    <textarea
                      className="form-input"
                      style={{ height: '60px', resize: 'vertical' }}
                      value={formQuiz.question}
                      onChange={(e) => setFormQuiz({ ...formQuiz, question: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Pilihan 1 *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formQuiz.opt0}
                        onChange={(e) => setFormQuiz({ ...formQuiz, opt0: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pilihan 2 *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formQuiz.opt1}
                        onChange={(e) => setFormQuiz({ ...formQuiz, opt1: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pilihan 3 *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formQuiz.opt2}
                        onChange={(e) => setFormQuiz({ ...formQuiz, opt2: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pilihan 4 *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formQuiz.opt3}
                        onChange={(e) => setFormQuiz({ ...formQuiz, opt3: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Jawaban Benar *</label>
                      <select
                        className="form-input"
                        value={formQuiz.correctAnswerIndex}
                        onChange={(e) => setFormQuiz({ ...formQuiz, correctAnswerIndex: parseInt(e.target.value) })}
                      >
                        <option value={0}>Pilihan 1</option>
                        <option value={1}>Pilihan 2</option>
                        <option value={2}>Pilihan 3</option>
                        <option value={3}>Pilihan 4</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bagian Kuis (Part) *</label>
                      <select
                        className="form-input"
                        value={formQuiz.part}
                        onChange={(e) => setFormQuiz({ ...formQuiz, part: parseInt(e.target.value) })}
                      >
                        <option value={1}>Part 1</option>
                        <option value={2}>Part 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor Soal *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formQuiz.number}
                      onChange={(e) => setFormQuiz({ ...formQuiz, number: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Penjelasan Jawaban *</label>
                    <textarea
                      className="form-input"
                      style={{ height: '60px', resize: 'vertical' }}
                      value={formQuiz.explanation}
                      onChange={(e) => setFormQuiz({ ...formQuiz, explanation: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {/* CONTACT FORM */}
              {modalType === 'contact' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nama Instansi / Layanan *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formContact.serviceName}
                      onChange={(e) => setFormContact({ ...formContact, serviceName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Telepon *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formContact.phoneNumber}
                      onChange={(e) => setFormContact({ ...formContact, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Keterangan (Opsional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formContact.description}
                      onChange={(e) => setFormContact({ ...formContact, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* USER FORM */}
              {modalType === 'user' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formUser.name}
                      onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username atau Email *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formUser.username}
                      onChange={(e) => setFormUser({ ...formUser, username: e.target.value })}
                      disabled={!!editingItem} // Cannot change username on edit
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kata Sandi (Password) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formUser.password}
                      onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Peran (Role) *</label>
                    <select
                      className="form-input"
                      value={formUser.role}
                      onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
                      disabled={editingItem && editingItem.username === 'admin'} // Cannot edit role of primary admin
                    >
                      <option value="student">Siswa (Student)</option>
                      <option value="admin">Administrator (Admin)</option>
                    </select>
                  </div>
                </>
              )}

            </div>

            <div className="modal-buttons">
              <button type="button" className="nav-btn" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button type="submit" className="nav-btn primary admin-btn-save">
                <Save size={16} /> Simpan Data
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
