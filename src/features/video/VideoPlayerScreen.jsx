import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './VideoPlayerScreen.css';

export default function VideoPlayerScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const found = localStorageService.getPracticeVideos().find(v => v.id === id);
    if (!found) {
      navigate('/video');
      return;
    }
    setVideo(found);
  }, [id, navigate]);

  if (!video) {
    return <div style={{ padding: '40px', textAlignment: 'center', fontWeight: 600 }}>Loading video...</div>;
  }

  // Helper to convert GDrive view URL to embeddable preview URL
  const getEmbedUrl = (url) => {
    if (url.includes('drive.google.com')) {
      return url.replace('/view?usp=drive_link', '/preview').replace('/view', '/preview');
    }
    return url;
  };

  const embedUrl = getEmbedUrl(video.videoUrl);

  return (
    <div className="video-player-container fade-in">
      {/* Header */}
      <div className="detail-header">
        <Link to="/video" className="back-link">
          <ArrowLeft size={18} /> Kembali ke Video Peraga
        </Link>
      </div>

      {/* Video IFrame Player */}
      <div className="player-wrapper">
        <iframe 
          src={embedUrl} 
          title={video.title} 
          className="player-iframe"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* Details Card */}
      <div className="video-player-details">
        <h3 className="player-title">{video.title}</h3>
        <p className="player-desc">{video.description}</p>
        
        <div className="player-actions">
          <a 
            href={video.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-btn primary"
            style={{ gap: '6px', fontSize: '0.85rem' }}
          >
            <ExternalLink size={16} /> Buka di GDrive
          </a>
          <a 
            href={video.folderUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-btn"
            style={{ gap: '6px', fontSize: '0.85rem' }}
          >
            <Download size={16} /> Download Video
          </a>
        </div>
      </div>
    </div>
  );
}
