import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, RotateCcw, BookOpen, AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Zap, HelpCircle } from 'lucide-react';
import './QuizResultScreen.css';

export default function QuizResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [showReview, setShowReview] = useState(false);

  // Guard clause if state is missing
  if (!state) {
    return (
      <div className="result-container fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={44} color="var(--emergency-red)" />
        <h3 style={{ marginTop: '16px', fontSize: '1.25rem', fontWeight: 900 }}>Hasil Kuis Tidak Ditemukan</h3>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: '12px 0 20px 0', fontWeight: 500 }}>
          Silakan ikuti kuis terlebih dahulu melalui halaman daftar kuis.
        </p>
        <button className="nav-btn primary" onClick={() => navigate('/quiz')}>
          Buka Daftar Kuis
        </button>
      </div>
    );
  }

  const { score, total, answers, questions, config, timeTakenSeconds } = state;
  const percentage = (score / total) * 100;

  // Formatting Elapsed Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} menit ${secs} detik`;
    }
    return `${secs} detik`;
  };

  // Predikat config
  const getPredikatClass = (predikat) => {
    switch (predikat?.toLowerCase()) {
      case 'istimewa':
      case 'sangat baik': return 'sangat-baik';
      case 'baik':
      case 'cukup': return 'baik';
      default: return 'kurang';
    }
  };

  const currentMeta = state.resultMeta;
  const isPerfect = score === total && total > 0;
  const isTanggap = config.mode?.toLowerCase() === 'tanggap' || config.isEvaluation;

  return (
    <div className="result-container fade-in">
      {/* HEADER NAV */}
      <div className="detail-header" style={{ width: '100%' }}>
        <button onClick={() => navigate('/quiz')} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Kembali ke Daftar Kuis
        </button>
      </div>

      {/* MAIN SCOREBOARD */}
      <div className="result-card-main">
        <span className="result-emoji">{currentMeta.emoji}</span>
        <h2 className="result-title">Hasil Latihan Kuis</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 600, marginTop: '-12px' }}>
          {config.quizLabel}
        </p>

        {/* Score Circle */}
        <div className="result-score-circle">
          <span className="score-num">{score}</span>
          <span className="score-denom">Dari {total}</span>
        </div>

        {/* Predikat Badge */}
        <span className={`result-predikat-tag ${getPredikatClass(currentMeta.predikat)}`}>
          {currentMeta.predikat}
        </span>

        {/* Stats Row */}
        <div className="result-stats-row">
          <div className="stat-item">
            <span className="stat-val">{percentage.toFixed(0)}%</span>
            <span className="stat-lbl">Akurasi</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{formatTime(timeTakenSeconds)}</span>
            <span className="stat-lbl">Waktu Tempuh</span>
          </div>
          <div className="stat-item">
            <span className="stat-val" style={{ color: 'var(--practice-orange)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Zap size={14} fill="var(--practice-orange)" color="var(--practice-orange)" />
              +{score * 10 + (isPerfect ? 50 : 0)} XP
            </span>
            <span className="stat-lbl">XP Diperoleh</span>
          </div>
        </div>
      </div>

      {/* BADGE AWARD CONTAINER */}
      {(isPerfect || isTanggap) && (
        <div className="badge-award-card">
          <div className="badge-award-icon">
            <Award size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F57F17' }}>
              Lencana Baru Terbuka!
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#5D4037', fontWeight: 600, marginTop: '2px' }}>
              {isPerfect && '🏆 Lencana "Nilai Sempurna" dibuka (Akurasi 100%)'}
              {isPerfect && isTanggap && ' | '}
              {isTanggap && '⚡ Lencana "Respon Cepat" dibuka (Menyelesaikan Mode Tanggap/Evaluasi)'}
            </p>
          </div>
        </div>
      )}

      {/* CTA BUTTONS */}
      <div className="nav-buttons" style={{ width: '100%', gap: '16px' }}>
        <button 
          className="nav-btn" 
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => {
            if (config.isEvaluation) {
              navigate(`/quiz/play?eval=${config.evaluationId}`);
            } else {
              navigate(`/quiz/play?part=${config.part}&mode=${config.mode}`);
            }
          }}
        >
          <RotateCcw size={16} /> Ulangi Kuis
        </button>

        <button 
          className="nav-btn primary" 
          style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
          onClick={() => setShowReview(!showReview)}
        >
          <BookOpen size={16} /> 
          <span>{showReview ? 'Sembunyikan Ulasan' : 'Ulas Pertanyaan'}</span>
          {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* QUESTION REVIEW */}
      {showReview && (
        <div className="review-list slide-up">
          <h3 className="review-header">Ulasan Detail Jawaban</h3>
          {questions.map((q, idx) => {
            const userAnswerIdx = answers[idx];
            const correctOptionIdx = q.correctAnswerIndex;
            const isAnsweredCorrectly = userAnswerIdx === correctOptionIdx;

            return (
              <div key={q.id} className="review-item">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--practice-orange)', flexShrink: 0, marginTop: '2px' }} />
                  <p className="review-question-text">{q.question}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    
                    let reviewClass = 'neutral';
                    if (optIdx === correctOptionIdx) {
                      reviewClass = 'correct';
                    } else if (optIdx === userAnswerIdx && !isAnsweredCorrectly) {
                      reviewClass = 'incorrect';
                    }

                    return (
                      <div key={optIdx} className={`review-option ${reviewClass}`}>
                        <strong style={{ opacity: 0.85 }}>{letter}.</strong>
                        <span>{opt}</span>
                        {optIdx === correctOptionIdx && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 800 }}>Jawab Benar</span>}
                        {optIdx === userAnswerIdx && !isAnsweredCorrectly && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 800 }}>Pilihan Anda</span>}
                      </div>
                    );
                  })}
                </div>

                {userAnswerIdx === -1 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--emergency-red)', fontWeight: 700 }}>
                    ⚠️ Tidak Dijawab (Waktu Habis)
                  </p>
                )}

                <div className="review-explanation">
                  <strong>Penjelasan:</strong> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
