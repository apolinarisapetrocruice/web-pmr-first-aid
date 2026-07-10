import React from 'react';
import { Link } from 'react-router-dom';
import { Play, FolderOpen, Tv } from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './VideoListScreen.css';

export default function VideoListScreen() {
  const [videos, setVideos] = React.useState([]);
  
  React.useEffect(() => {
    setVideos(localStorageService.getPracticeVideos());
  }, []);

  const driveFolderUrl = "https://drive.google.com/drive/folders/1DR_mkzA1dxQ05r4N-5NJ7Ya5Ps9Sx7Ot?usp=sharing";

  return (
    <div className="video-list-container fade-in">
      {/* Title & Drive folder link */}
      <div className="emergency-header-row">
        <div>
          <h2 className="home-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tv size={28} color="var(--learning-blue)" /> Video Peraga
          </h2>
          <p className="home-welcome-subtitle">Tonton peragaan langsung penanganan medis dasar oleh relawan.</p>
        </div>
        
        <a 
          href={driveFolderUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-btn"
          style={{ gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
        >
          <FolderOpen size={16} /> Buka GDrive Video
        </a>
      </div>

      {/* Video Cards Grid */}
      <div className="video-grid">
        {videos.map((video) => (
          <Link key={video.id} to={`/video/${video.id}`} className="video-card">
            <div className="video-thumbnail-wrapper">
              <div className="video-thumbnail-placeholder">
                <Tv size={44} strokeWidth={1} style={{ opacity: 0.25 }} />
              </div>
              <div className="video-play-overlay">
                <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
              </div>
              <span className="video-duration-badge">{video.durationText}</span>
            </div>
            <div className="video-card-body">
              <h3 className="video-card-title">{video.title}</h3>
              <p className="video-card-desc">{video.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
