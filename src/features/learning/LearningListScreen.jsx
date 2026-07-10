import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import { parseSubTopics, getMaterialOverview } from './learningHelper';
import './LearningListScreen.css';

export default function LearningListScreen() {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const list = localStorageService.getLearningMaterials().map(m => {
      const parsed = parseSubTopics(m.content, m.imageAssets, m.id);
      const readSubtopics = localStorageService.getReadSubtopics(m.id);
      const isRead = localStorageService.isMaterialRead(m.id);
      const percent = parsed.length > 0 ? (readSubtopics.length / parsed.length) * 100 : 0;
      const overview = getMaterialOverview(m.id);

      return {
        ...m,
        totalSubtopics: parsed.length,
        readCount: readSubtopics.length,
        isRead,
        percentage: percent,
        overview
      };
    });

    setProgressData(list);
  }, []);

  return (
    <div className="learning-container fade-in">
      <div className="learning-header">
        <h2 className="home-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={28} color="var(--learning-blue)" /> Materi Belajar
        </h2>
        <p className="home-welcome-subtitle">Pelajari langkah-langkah pertolongan pertama secara terstruktur.</p>
      </div>

      <div className="learning-grid">
        {progressData.map((item) => (
          <Link key={item.id} to={`/learning/${item.id}`} className="material-card">
            <div className="material-card-body">
              <div className="material-badge-row">
                <span className="material-subtitle">{item.subtitle}</span>
                {item.isRead ? (
                  <span className="status-badge read" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> Selesai
                  </span>
                ) : (
                  <span className="status-badge unread">Belum Selesai</span>
                )}
              </div>

              <h3 className="material-title">{item.title}</h3>
              <p className="menu-desc" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.overview}
              </p>

              <div className="material-progress-section">
                <div className="progress-info">
                  <span>Progres Belajar</span>
                  <span>{item.readCount}/{item.totalSubtopics} Subtopik</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar-fill ${item.percentage === 100 ? 'complete' : ''}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
