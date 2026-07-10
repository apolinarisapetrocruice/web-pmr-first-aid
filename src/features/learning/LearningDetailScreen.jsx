import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  Award,
  Zap
} from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import { parseSubTopics } from './learningHelper';
import './LearningDetailScreen.css';

export default function LearningDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState(null);
  const [subTopics, setSubTopics] = useState([]);
  const [readSubtopics, setReadSubtopics] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const mat = localStorageService.getLearningMaterials().find(m => m.id === id);
    if (!mat) {
      navigate('/learning');
      return;
    }
    setMaterial(mat);

    const parsed = parseSubTopics(mat.content, mat.imageAssets, mat.id);
    setSubTopics(parsed);

    const read = localStorageService.getReadSubtopics(mat.id);
    setReadSubtopics(read);

    const materialRead = localStorageService.isMaterialRead(mat.id);
    setIsRead(materialRead);
  }, [id, navigate]);

  if (!material || subTopics.length === 0) {
    return <div style={{ padding: '40px', textAlignment: 'center' }}>Loading materi...</div>;
  }

  const currentSubTopic = subTopics[activeIndex];
  const isCurrentRead = readSubtopics.includes(currentSubTopic.title);
  const totalSubTopics = subTopics.length;
  const progressPercent = (readSubtopics.length / totalSubTopics) * 100;

  const handleToggleRead = () => {
    if (isCurrentRead) return; // Do not allow unchecking to maintain progressive gamification

    const updated = [...readSubtopics, currentSubTopic.title];
    setReadSubtopics(updated);
    localStorageService.markSubtopicAsRead(material.id, currentSubTopic.title);

    // If all subtopics are completed now
    if (updated.length === totalSubTopics) {
      setIsRead(true);
      localStorageService.markMaterialAsRead(material.id);
      setShowCompleteModal(true);
      // Dispatch event to update Layout XP instantly
      window.dispatchEvent(new Event('profile-updated'));
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengulang pelajaran ini dari awal? Progres membaca materi ini akan dikosongkan.')) {
      localStorageService.resetMaterialProgress(material.id);
      setReadSubtopics([]);
      setIsRead(false);
      setActiveIndex(0);
      window.dispatchEvent(new Event('profile-updated'));
    }
  };

  const handleNext = () => {
    if (activeIndex < totalSubTopics - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <div className="detail-container fade-in">
      {/* HEADER ROW */}
      <div className="detail-header">
        <Link to="/learning" className="back-link">
          <ArrowLeft size={18} /> Kembali ke Daftar
        </Link>
        {(readSubtopics.length > 0 || isRead) && (
          <button onClick={handleReset} className="reset-btn">
            <RotateCcw size={14} /> Ulangi Materi
          </button>
        )}
      </div>

      {/* TITLE & META */}
      <div className="material-meta">
        <span className="material-subtitle" style={{ color: 'var(--learning-blue)' }}>
          {material.subtitle}
        </span>
        <h2 className="material-detail-title">{material.title}</h2>
      </div>

      {/* PROGRESS BAR */}
      <div className="material-progress-section" style={{ border: 'none', padding: 0 }}>
        <div className="progress-info">
          <span>Progres Subtopik</span>
          <span>{readSubtopics.length} dari {totalSubTopics} Selesai</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className={`progress-bar-fill ${progressPercent === 100 ? 'complete' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* CAROUSEL BODY */}
      <div className="carousel-wrapper">
        <div className="subtopic-card">
          <div className="subtopic-text-side">
            <h3 className="subtopic-card-title">{currentSubTopic.title}</h3>
            <div className="subtopic-card-body">
              {currentSubTopic.content}
            </div>
          </div>
          {currentSubTopic.imageAsset && (
            <div className="subtopic-image-side">
              <img 
                src={`/${currentSubTopic.imageAsset}`} 
                alt={currentSubTopic.title} 
                className="subtopic-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="card-action-bar">
          {/* Read Checkbox */}
          <div className="check-container" onClick={handleToggleRead}>
            <div className={`check-box ${isCurrentRead ? 'checked' : ''}`}>
              <Check size={16} strokeWidth={3} />
            </div>
            <span style={{ color: isCurrentRead ? 'var(--mitigation-green)' : 'var(--text-gray)' }}>
              {isCurrentRead ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
            </span>
          </div>

          {/* Indicator */}
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-gray)' }}>
            {activeIndex + 1} dari {totalSubTopics}
          </span>

          {/* Nav Buttons */}
          <div className="nav-buttons">
            <button 
              className="nav-btn" 
              onClick={handlePrev} 
              disabled={activeIndex === 0}
            >
              <ChevronLeft size={16} /> Kembali
            </button>
            
            {activeIndex === totalSubTopics - 1 ? (
              <button 
                className={`nav-btn primary ${isCurrentRead ? '' : 'disabled'}`}
                onClick={handleToggleRead}
                disabled={isCurrentRead}
              >
                Selesaikan Materi
              </button>
            ) : (
              <button 
                className="nav-btn primary" 
                onClick={handleNext}
                disabled={!isCurrentRead}
              >
                Lanjut <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CELEBRATION MODAL */}
      {showCompleteModal && (
        <div className="complete-overlay">
          <div className="complete-card">
            <div className="celebration-icon">
              <Award size={44} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Materi Selesai!</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', fontWeight: 500 }}>
              Selamat! Kamu telah membaca seluruh subtopik dalam materi ini dengan baik.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--practice-soft-orange)', padding: '10px 18px', borderRadius: 'var(--radius-md)' }}>
              <Zap size={18} fill="var(--practice-orange)" color="var(--practice-orange)" />
              <span style={{ fontWeight: 800, color: 'var(--practice-orange)' }}>+20 XP Reward</span>
            </div>
            <button 
              className="nav-btn primary" 
              style={{ width: '100%', padding: '12px 0', justifyContent: 'center' }}
              onClick={() => {
                setShowCompleteModal(false);
                navigate('/learning');
              }}
            >
              Kembali ke Daftar Materi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
