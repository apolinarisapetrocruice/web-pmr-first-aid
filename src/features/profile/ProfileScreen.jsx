import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit2, 
  Save, 
  X, 
  Award, 
  History, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  Info,
  Zap,
  CheckCircle,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './ProfileScreen.css';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Form Fields State
  const [name, setName] = useState('');
  const [role, setRole] = useState('PMR Madya');
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');

  const loadProfile = () => {
    const prof = localStorageService.getUserProfile();
    setProfile(prof);
    
    // Set form fields
    setName(prof.name || 'Relawan PMR');
    setRole(prof.role || 'PMR Madya');
    setDob(prof.dateOfBirth || '');
    setBloodType(prof.bloodType || '');
    setHeight(prof.height || '');
    setWeight(prof.weight || '');
    setAllergies(prof.allergies || '');
    setNotes(prof.medicalNotes || '');
    setAddress(prof.address || '');
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) {
    return <div style={{ padding: '40px', textAlignment: 'center', fontWeight: 600 }}>Loading Profil...</div>;
  }

  const xp = profile.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  const achievements = [
    {
      id: 'ach_read_5',
      title: 'Pustakawan PMR',
      desc: 'Membaca minimal 5 materi belajar pertolongan pertama.',
      emoji: '📖'
    },
    {
      id: 'ach_quiz_perfect',
      title: 'Nilai Sempurna',
      desc: 'Mencapai akurasi 100% pada salah satu kuis.',
      emoji: '🏆'
    },
    {
      id: 'ach_mode_tanggap',
      title: 'Respon Cepat',
      desc: 'Menyelesaikan kuis dalam mode Tanggap atau Evaluasi.',
      emoji: '⚡'
    },
    {
      id: 'ach_consistency_3',
      title: 'Relawan Konsisten',
      desc: 'Menyelesaikan minimal 3 latihan kuis reguler.',
      emoji: '📅'
    },
    {
      id: 'ach_pakar_pmr',
      title: 'Pakar PMR',
      desc: 'Membaca seluruh 9 materi & menyelesaikan Evaluasi A & B.',
      emoji: '👑'
    }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    
    const updated = {
      ...profile,
      name,
      role,
      dateOfBirth: dob,
      bloodType,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      allergies,
      medicalNotes: notes,
      address
    };

    localStorageService.saveUserProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    
    // Dispatch event to update Layout header
    window.dispatchEvent(new Event('profile-updated'));
  };

  return (
    <div className="profile-container fade-in">
      {/* Logout Popup Modal */}
      {showLogoutPopup && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-card">
            <div className="custom-popup-icon-container warning">
              <LogOut size={32} />
            </div>
            <h3 className="custom-popup-title">Hati-hati di jalan</h3>
            <p className="custom-popup-message">
              Anda akan keluar dari sistem PMR First Aid. Sampai jumpa kembali!
            </p>
            <button 
              className="custom-popup-btn" 
              onClick={() => {
                setShowLogoutPopup(false);
                localStorageService.logoutUser();
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
      {/* HEADER CARD */}
      <div className="profile-card-header">
        <div className="profile-avatar-large">
          {name.substring(0, 2).toUpperCase()}
        </div>

        <div className="profile-header-info" style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="profile-name">{name}</h2>
              <span className="profile-role-badge">{role}</span>
            </div>
            <button 
              className="nav-btn" 
              onClick={() => {
                setShowLogoutPopup(true);
              }}
              style={{ 
                padding: '8px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: 'var(--primary-red)', 
                border: '1.5px solid var(--primary-red)', 
                background: 'var(--light-red)',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
          
          {/* Level Progress */}
          <div className="level-progress-section">
            <div className="level-text-row">
              <span>Level {level}</span>
              <span>{xpProgress}/100 XP</span>
            </div>
            <div className="progress-bar-container" style={{ height: '8px' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${xpProgress}%`,
                  backgroundColor: 'var(--primary-red)'
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)', fontWeight: 600 }}>
              Total Akumulasi: {xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS BODY */}
      <div className="profile-two-col-grid">
        {/* LEFT COLUMN: Bio & Medical notes */}
        <div className="bio-card">
          <div className="bio-title-row">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--primary-red)" /> Profil & Medis Relawan
            </h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="reset-btn" style={{ gap: '4px' }}>
                <Edit2 size={12} /> Ubah
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsEditing(false)} className="reset-btn" style={{ color: 'var(--text-gray)' }}>
                  <X size={12} /> Batal
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="bio-form-grid">
              <div className="bio-val-item">
                <span className="bio-val-label">Nama Relawan</span>
                <span className="bio-val-text">{name}</span>
              </div>
              <div className="bio-val-item">
                <span className="bio-val-label">Tingkatan PMR</span>
                <span className="bio-val-text">{role}</span>
              </div>
              <div className="bio-val-item">
                <span className="bio-val-label">Tanggal Lahir</span>
                <span className="bio-val-text">{dob ? new Date(dob).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
              </div>
              <div className="bio-val-item">
                <span className="bio-val-label">Golongan Darah</span>
                <span className="bio-val-text">{bloodType || '-'}</span>
              </div>
              <div className="bio-val-item">
                <span className="bio-val-label">Tinggi Badan</span>
                <span className="bio-val-text">{height ? `${height} cm` : '-'}</span>
              </div>
              <div className="bio-val-item">
                <span className="bio-val-label">Berat Badan</span>
                <span className="bio-val-text">{weight ? `${weight} kg` : '-'}</span>
              </div>
              <div className="bio-val-item" style={{ gridColumn: 'span 2' }}>
                <span className="bio-val-label">Alergi Makanan / Obat</span>
                <span className="bio-val-text" style={{ color: allergies ? 'var(--emergency-red)' : 'inherit' }}>
                  {allergies || 'Tidak ada riwayat alergi'}
                </span>
              </div>
              <div className="bio-val-item" style={{ gridColumn: 'span 2' }}>
                <span className="bio-val-label">Catatan Medis Khusus</span>
                <span className="bio-val-text">{notes || 'Tidak ada catatan khusus'}</span>
              </div>
              <div className="bio-val-item" style={{ gridColumn: 'span 2' }}>
                <span className="bio-val-label">Alamat Tinggal</span>
                <span className="bio-val-text">{address || '-'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="bio-form-grid">
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                
                {/* Role dropdown */}
                <div className="form-group">
                  <label className="form-label">Tingkatan PMR</label>
                  <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="PMR Madya">PMR Madya (SMP)</option>
                    <option value="PMR Wira">PMR Wira (SMA)</option>
                  </select>
                </div>

                {/* DoB */}
                <div className="form-group">
                  <label className="form-label">Tanggal Lahir</label>
                  <input type="date" className="form-input" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>

                {/* Blood */}
                <div className="form-group">
                  <label className="form-label">Golongan Darah</label>
                  <select className="form-input" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                    <option value="">Pilih Golongan Darah</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                {/* Height */}
                <div className="form-group">
                  <label className="form-label">Tinggi Badan (cm)</label>
                  <input type="number" className="form-input" placeholder="cm" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>

                {/* Weight */}
                <div className="form-group">
                  <label className="form-label">Berat Badan (kg)</label>
                  <input type="number" className="form-input" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>

                {/* Allergies */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Alergi Makanan / Obat</label>
                  <input type="text" className="form-input" placeholder="Tulis alergi obat/makanan jika ada" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Catatan Medis Khusus</label>
                  <textarea className="form-input" style={{ resize: 'vertical', height: '60px' }} placeholder="Riwayat penyakit kronis atau asma jika ada" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                {/* Address */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Alamat Tinggal</label>
                  <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="nav-btn primary" style={{ width: 'fit-content', alignSelf: 'flex-end', gap: '6px' }}>
                <Save size={16} /> Simpan Perubahan
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Badges & Achievements */}
        <div className="bio-card" style={{ gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-gray)', paddingBottom: '12px' }}>
            <Award size={20} color="var(--practice-orange)" /> Koleksi Lencana (Badge)
          </h3>

          <div className="badges-container">
            {achievements.map((badge) => {
              const isUnlocked = profile.unlockedAchievements.includes(badge.id);
              return (
                <div key={badge.id} className={`badge-row-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="badge-icon-wrap">
                    {badge.emoji}
                  </div>
                  <div className="badge-info">
                    <span className="badge-title">{badge.title}</span>
                    <span className="badge-desc">{badge.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM AREA: Quiz History Log */}
      <div className="bio-card history-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-gray)', paddingBottom: '12px' }}>
          <History size={20} color="var(--learning-blue)" /> Riwayat Percobaan Kuis
        </h3>

        <div className="history-list">
          {profile.quizHistory && profile.quizHistory.length > 0 ? (
            profile.quizHistory.map((item, idx) => (
              <div key={idx} className="history-item-row">
                <div className="history-left">
                  <span className="history-emoji">{item.emoji}</span>
                  <div className="history-meta">
                    <span className="history-title-text">{item.quizLabel}</span>
                    <span className="history-subtitle-text">
                      Mode {item.mode} • {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <div className="history-right">
                  <span className="history-score-badge">
                    SKOR: {item.score}/{item.total}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-gray)' }}>
                    Waktu: {item.timeTakenSeconds ? `${Math.floor(item.timeTakenSeconds / 60)}m ${item.timeTakenSeconds % 60}d` : '-'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 0', color: 'var(--text-gray)', fontWeight: 600, justifyContent: 'center' }}>
              <AlertCircle size={18} /> Belum ada riwayat pengerjaan kuis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
