import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  BookOpen, 
  Award, 
  Bolt, 
  GraduationCap, 
  X,
  School,
  Star,
  ChevronRight
} from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './QuizListScreen.css';

export default function QuizListScreen() {
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(localStorageService.getQuizQuestions());
  }, []);

  const getPartTitle = (part) => {
    switch (part) {
      case 1: return 'Dasar dan Prinsip Umum';
      case 2: return 'Penilaian Korban';
      case 3: return 'Luka dan Patah Tulang';
      case 4: return 'Luka Bakar dan Pingsan';
      case 5: return 'Terkilir dan Gangguan Pernapasan';
      default: return `Bagian ${part}`;
    }
  };

  const getPartSubtitle = (part) => {
    switch (part) {
      case 1: return 'Dasar PP, APD, Anatomi';
      case 2: return 'Penilaian keadaan, dini, fisik';
      case 3: return 'Luka terbuka/tertutup, patah tulang';
      case 4: return 'Luka bakar, pingsan, syok';
      case 5: return 'Terkilir, sesak napas, triage';
      default: return '10 soal pilihan ganda';
    }
  };

  const countQuestionsInPart = (part) => {
    return questions.filter(q => q.part === part).length;
  };

  const handleOpenModeSelector = (part) => {
    setSelectedPart(part);
    setShowModal(true);
  };

  const handleStartRegularQuiz = (mode) => {
    setShowModal(false);
    navigate(`/quiz/play?part=${selectedPart}&mode=${mode}`);
  };

  const handleStartEvaluation = (evalId) => {
    navigate(`/quiz/play?eval=${evalId}`);
  };

  const regularModes = [
    {
      id: 'belajar',
      title: 'Mode Belajar',
      desc: 'Waktu 7 menit • Cocok untuk berlatih santai',
      icon: School,
      color: '#4CAF50',
      bgColor: '#E8F5E9'
    },
    {
      id: 'terampil',
      title: 'Mode Terampil',
      desc: 'Waktu 5 menit • Latihan kecepatan berpikir',
      icon: Star,
      color: '#1976D2',
      bgColor: '#E3F2FD'
    },
    {
      id: 'tanggap',
      title: 'Mode Tanggap',
      desc: 'Waktu 3 menit • Uji respon cepat darurat',
      icon: Bolt,
      color: '#D32F2F',
      bgColor: '#FFEBEE'
    }
  ];

  return (
    <div className="quiz-list-container fade-in">
      {/* Title */}
      <div className="practice-header">
        <h2 className="home-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HelpCircle size={28} color="var(--practice-orange)" /> Latihan Kuis
        </h2>
        <p className="home-welcome-subtitle">Pilih bagian kuis materi reguler atau uji dengan evaluasi akhir.</p>
      </div>

      {/* Regular Quizzes */}
      <h3 className="quiz-section-title">
        <BookOpen size={18} /> Kuis Reguler Materi
      </h3>
      <div className="contact-card-list">
        {[1, 2, 3, 4, 5].map((part) => (
          <div key={part} className="quiz-card" onClick={() => handleOpenModeSelector(part)}>
            <div className="quiz-badge-icon">
              <HelpCircle size={24} />
            </div>
            <div className="quiz-card-info">
              <h4 className="quiz-card-title">{getPartTitle(part)}</h4>
              <p className="quiz-card-subtitle">{getPartSubtitle(part)}</p>
              <div className="quiz-meta-info">
                <span className="quiz-meta-tag">Bagian {part}</span>
                <span className="quiz-meta-tag">{countQuestionsInPart(part)} Pertanyaan</span>
              </div>
            </div>
            <ChevronRight size={20} color="var(--text-gray)" />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="quiz-section-divider" />

      {/* Evaluations */}
      <h3 className="quiz-section-title" style={{ color: 'var(--emergency-red)' }}>
        <GraduationCap size={20} /> Evaluasi Hasil Belajar
      </h3>
      <div className="contact-card-list">
        {/* Eval A */}
        <div className="quiz-card evaluation-theme" onClick={() => handleStartEvaluation('a')}>
          <div className="quiz-badge-icon">
            <Award size={24} />
          </div>
          <div className="quiz-card-info">
            <h4 className="quiz-card-title">Evaluasi Akhir - Bagian A</h4>
            <p className="quiz-card-subtitle">Soal Nomor 1 s.d 25 • Meliputi materi Dasar, APD, Anatomi & Penilaian</p>
            <div className="quiz-meta-info">
              <span className="quiz-meta-tag" style={{ color: 'var(--emergency-red)', backgroundColor: 'var(--emergency-soft-red)' }}>Wajib Tanggap</span>
              <span className="quiz-meta-tag">25 Pertanyaan</span>
              <span className="quiz-meta-tag">Waktu 11 Menit</span>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-gray)" />
        </div>

        {/* Eval B */}
        <div className="quiz-card evaluation-theme" onClick={() => handleStartEvaluation('b')}>
          <div className="quiz-badge-icon">
            <Award size={24} />
          </div>
          <div className="quiz-card-info">
            <h4 className="quiz-card-title">Evaluasi Akhir - Bagian B</h4>
            <p className="quiz-card-subtitle">Soal Nomor 26 s.d 50 • Meliputi Luka, Patah Tulang, Luka Bakar, Pingsan & Terkilir</p>
            <div className="quiz-meta-info">
              <span className="quiz-meta-tag" style={{ color: 'var(--emergency-red)', backgroundColor: 'var(--emergency-soft-red)' }}>Wajib Tanggap</span>
              <span className="quiz-meta-tag">25 Pertanyaan</span>
              <span className="quiz-meta-tag">Waktu 11 Menit</span>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-gray)" />
        </div>
      </div>

      {/* MODE SELECTOR MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="mode-selector-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Pilih Mode Kuis</h3>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '-8px', fontWeight: 500 }}>
              Silakan pilih mode kecepatan kuis untuk **{getPartTitle(selectedPart)}**:
            </p>

            <div className="mode-option-list">
              {regularModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button 
                    key={mode.id} 
                    className="mode-option-btn" 
                    onClick={() => handleStartRegularQuiz(mode.id)}
                  >
                    <div 
                      className="mode-option-icon" 
                      style={{ backgroundColor: mode.bgColor, color: mode.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="mode-option-info">
                      <span className="mode-option-title">{mode.title}</span>
                      <span className="mode-option-desc">{mode.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
