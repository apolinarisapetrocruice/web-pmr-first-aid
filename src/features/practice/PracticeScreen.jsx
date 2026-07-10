import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Play, Activity } from 'lucide-react';
import './PracticeScreen.css';

export default function PracticeScreen() {
  return (
    <div className="practice-container fade-in">
      <div className="practice-header">
        <h2 className="home-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={28} color="var(--practice-orange)" /> Area Latihan
        </h2>
        <p className="home-welcome-subtitle">Uji kemampuan pertolongan pertama Anda lewat kuis dan video peraga.</p>
      </div>

      <div className="practice-card-row">
        {/* Quiz Option */}
        <Link to="/quiz" className="practice-choice-card">
          <div className="practice-badge-icon">
            <HelpCircle size={36} />
          </div>
          <h3 className="practice-card-title">Kuis Interaktif</h3>
          <p className="practice-card-desc">
            Asah pengetahuanmu melalui kuis reguler ber-timer atau evaluasi akhir pemahaman materi PMR.
          </p>
        </Link>

        {/* Video Option */}
        <Link to="/video" className="practice-choice-card video-theme">
          <div className="practice-badge-icon">
            <Play size={36} fill="currentColor" />
          </div>
          <h3 className="practice-card-title">Video Peraga</h3>
          <p className="practice-card-desc">
            Tonton demonstrasi teknik pembidaian, resusitasi, evakuasi, dan penanganan luka yang diperagakan relawan.
          </p>
        </Link>
      </div>
    </div>
  );
}
