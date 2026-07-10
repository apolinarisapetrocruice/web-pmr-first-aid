import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { mitigationTopics } from '../../data/dummyData';
import './MitigationListScreen.css';

export default function MitigationListScreen() {
  return (
    <div className="mitigation-container fade-in">
      <div className="practice-header">
        <h2 className="home-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={28} color="var(--mitigation-green)" /> Mitigasi Bencana
        </h2>
        <p className="home-welcome-subtitle">Panduan kesiapsiagaan untuk keselamatan diri dan lingkungan sekitar.</p>
      </div>

      <div className="mitigation-grid">
        {mitigationTopics.map((topic) => (
          <Link key={topic.id} to={`/mitigation/${topic.id}`} className="mitigation-card">
            <div className="mitigation-card-header">
              <span className="mitigation-card-icon">{topic.icon}</span>
              <h3 className="mitigation-card-title">{topic.title}</h3>
            </div>
            <p className="mitigation-card-desc">
              {topic.definition}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
