import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import './SplashScreen.css';

export default function SplashScreen({ onFinish }) {
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    // Start fade out animation after 2.2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeExit(true);
    }, 2200);

    // Call onFinish callback after 2.5 seconds (allowing 300ms fade animation to finish)
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${fadeExit ? 'fade-exit' : ''}`}>
      <div className="splash-content">
        {/* Animated Brand Logo Container */}
        <div className="splash-logo-container">
          <div className="splash-logo-glow"></div>
          <div className="splash-logo-box">
            <img
              src="/assets/images/logo.png"
              alt="Logo PMI"
              className="brand-logo"
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="splash-title">PMR FIRST AID</h1>
        <p className="splash-subtitle">Aplikasi Belajar Pertolongan Pertama</p>
        <p className="splash-brand-pmr">Palang Merah Remaja Indonesia</p>

        {/* Loading Indicator */}
        <div className="splash-loader-bar">
          <div className="splash-loader-progress"></div>
        </div>
      </div>
    </div>
  );
}
