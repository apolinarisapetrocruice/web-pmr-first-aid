import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { mitigationTopics } from '../../data/dummyData';
import './MitigationDetailScreen.css';

export default function MitigationDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('before'); // 'before', 'during', 'after'

  useEffect(() => {
    const found = mitigationTopics.find(t => t.id === id);
    if (!found) {
      navigate('/mitigation');
      return;
    }
    setTopic(found);
  }, [id, navigate]);

  if (!topic) {
    return <div style={{ padding: '40px', textAlignment: 'center', fontWeight: 600 }}>Loading mitigasi...</div>;
  }

  // Get active tab tips
  const currentTipsList = topic.tips[activeTab] || [];

  return (
    <div className="mitigation-detail-container fade-in">
      {/* Header Back */}
      <div className="detail-header">
        <Link to="/mitigation" className="back-link">
          <ArrowLeft size={18} /> Kembali ke Mitigasi
        </Link>
      </div>

      {/* Detail Card */}
      <div className="mitigation-detail-card">
        {/* Title & Icon Header */}
        <div className="mitigation-detail-header">
          <span className="mitigation-detail-icon">{topic.icon}</span>
          <div>
            <h2 className="profile-name">Mitigasi {topic.title}</h2>
            <span className="material-subtitle" style={{ color: 'var(--mitigation-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={14} /> Panduan Kesiapsiagaan
            </span>
          </div>
        </div>

        {/* Definisi */}
        <div className="mitigation-info-section">
          <span className="mitigation-section-lbl">Pengertian / Definisi</span>
          <p className="mitigation-section-txt">{topic.definition}</p>
        </div>

        {/* Penyebab */}
        <div className="mitigation-info-section">
          <span className="mitigation-section-lbl">Penyebab Umum</span>
          <p className="mitigation-section-txt">{topic.causes}</p>
        </div>

        {/* Risiko */}
        <div className="mitigation-info-section">
          <span className="mitigation-section-lbl">Risiko & Dampak</span>
          <p className="mitigation-section-txt">{topic.risks}</p>
        </div>

        {/* TIPS HEADER */}
        <div style={{ marginTop: '8px' }}>
          <span className="mitigation-section-lbl">Tips Siaga Bencana</span>
          
          {/* Tabs Nav */}
          <div className="tabs-navigation">
            <button 
              className={`tab-btn ${activeTab === 'before' ? 'active' : ''}`}
              onClick={() => setActiveTab('before')}
            >
              Pra-Bencana
            </button>
            <button 
              className={`tab-btn ${activeTab === 'during' ? 'active' : ''}`}
              onClick={() => setActiveTab('during')}
            >
              Saat Bencana
            </button>
            <button 
              className={`tab-btn ${activeTab === 'after' ? 'active' : ''}`}
              onClick={() => setActiveTab('after')}
            >
              Pasca-Bencana
            </button>
          </div>

          {/* Tab Content List */}
          <div className="tab-content-list" key={activeTab}>
            {currentTipsList.map((tip, idx) => (
              <div key={idx} className="bullet-item">
                <div className="bullet-dot" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
