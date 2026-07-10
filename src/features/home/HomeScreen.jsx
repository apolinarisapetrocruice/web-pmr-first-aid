import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Phone,
  Activity,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './HomeScreen.css';

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setProfile(localStorageService.getUserProfile());
  }, []);

  const userName = profile?.name || 'Relawan PMR';

  const menus = [
    {
      title: 'Belajar',
      desc: 'Materi Pertolongan Pertama lengkap dengan ilustrasi.',
      path: '/learning',
      icon: BookOpen,
      iconColor: 'var(--learning-blue)',
      bgColor: 'var(--learning-soft-blue)',
    },
    {
      title: 'Latihan',
      desc: 'Kuis interaktif & video simulasi penanganan.',
      path: '/practice',
      icon: Activity,
      iconColor: 'var(--practice-orange)',
      bgColor: 'var(--practice-soft-orange)',
    },
    {
      title: 'Mitigasi Bencana',
      desc: 'Panduan siaga pra, saat, dan pasca bencana.',
      path: '/mitigation',
      icon: ShieldAlert,
      iconColor: 'var(--mitigation-green)',
      bgColor: 'var(--mitigation-soft-green)',
    },
    {
      title: 'Bantuan Darurat',
      desc: 'Daftar nomor darurat & manajemen kontak.',
      path: '/emergency',
      icon: Phone,
      iconColor: 'var(--emergency-red)',
      bgColor: 'var(--emergency-soft-red)',
    },
  ];

  return (
    <div className="home-container fade-in">
      {/* Welcome Section */}
      <div className="home-welcome-section">
        <h2 className="home-welcome-title">Halo, {userName}!</h2>
        <p className="home-welcome-subtitle">Apa yang ingin kamu pelajari hari ini?</p>
      </div>

      {/* Banner */}
      <div className="home-banner-card">
        <div className="home-banner-text">
          <h3 className="home-banner-title">PMR FIRST AID</h3>
          <p className="home-banner-desc">
            Aplikasi Belajar Pertolongan Pertama untuk Palang Merah Remaja Indonesia. Kembangkan keahlian menyelamatkan jiwa!
          </p>
        </div>
        <img
          src="/assets/images/materi/home_banner.jpg"
          alt="PMR Banner"
          className="home-banner-image"
          onError={(e) => {
            // Fallback in case of image load failure
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Menu Grid */}
      <div className="home-menu-grid">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link key={menu.path} to={menu.path} className="menu-card">
              <div
                className="menu-icon-container"
                style={{ backgroundColor: menu.bgColor, color: menu.iconColor }}
              >
                <Icon size={28} />
              </div>
              <div className="menu-info" style={{ flexGrow: 1 }}>
                <h4 className="menu-title">{menu.title}</h4>
                <p className="menu-desc">{menu.desc}</p>
              </div>
              <ArrowRight size={20} color="var(--text-gray)" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
