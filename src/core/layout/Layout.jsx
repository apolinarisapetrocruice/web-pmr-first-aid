import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Activity,
  Phone,
  User,
  ShieldAlert,
  Award,
  Zap,
  LogOut
} from 'lucide-react';
import { localStorageService } from '../services/localStorageService';

export default function Layout() {
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Load and subscribe to profile changes
  const updateProfile = () => {
    setProfile(localStorageService.getUserProfile());
  };

  useEffect(() => {
    updateProfile();
    // Listening to localStorage changes
    window.addEventListener('storage', updateProfile);
    window.addEventListener('profile-updated', updateProfile);

    return () => {
      window.removeEventListener('storage', updateProfile);
      window.removeEventListener('profile-updated', updateProfile);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Beranda';
    if (path.startsWith('/learning')) return 'Materi Belajar';
    if (path.startsWith('/emergency')) return 'Hubungi Ambulans';
    if (path.startsWith('/practice')) return 'Area Latihan';
    if (path.startsWith('/quiz')) return 'Kuis Pilihan';
    if (path.startsWith('/video')) return 'Video Peraga';
    if (path.startsWith('/mitigation')) return 'Mitigasi Bencana';
    if (path.startsWith('/profile')) return 'Profil Relawan';
    return 'PMR First Aid';
  };

  const currentXp = profile?.xp || 0;
  const currentName = profile?.name || 'Relawan PMR';
  const currentRole = profile?.role || 'PMR Madya';

  const menuItems = [
    { name: 'Beranda', path: '/', icon: Home },
    { name: 'Belajar', path: '/learning', icon: BookOpen },
    { name: 'Latihan', path: '/practice', icon: Activity },
    { name: 'Mitigasi', path: '/mitigation', icon: ShieldAlert },
    { name: 'Kontak Darurat', path: '/emergency', icon: Phone },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <div className="app-container">
      {/* Logout Popup Modal */}
      {showLogoutPopup && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-card">
            <div className="custom-popup-icon-container warning">
              <LogOut size={32} />
            </div>
            <h3 className="custom-popup-title">Hati-hati di jalan</h3>
            <p className="custom-popup-message">
              Anda akan keluar dari sistem PMR First Aid. Sampai jumpa kembali!
            </p>
            <button
              className="custom-popup-btn"
              onClick={() => {
                setShowLogoutPopup(false);
                localStorageService.logoutUser();
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <img
              src="/assets/images/logo.png"
              alt="Logo PMI"
              className="brand-logo"
            />
          </div>
          <div>
            <h1 className="logo-title">PMR FIRST AID</h1>
            <p className="logo-subtitle">Palang Merah Remaja</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="user-avatar-circle" style={{ flexShrink: 0 }}>
            {currentName.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4 className="user-footer-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{currentName}</h4>
            <p className="user-footer-xp" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0 0' }}>
              <Zap size={12} fill="var(--primary-red)" /> {currentXp} XP
            </p>
          </div>
          <button
            onClick={() => {
              setShowLogoutPopup(true);
            }}
            title="Keluar"
            style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '8px', flexShrink: 0 }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-red)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MOBILE TOP HEADER */}
      <header className="mobile-header">
        <div className="logo-box" style={{ width: '36px', height: '36px' }}>
          <ShieldAlert size={18} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{getPageTitle()}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--soft-red)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
          <Zap size={14} fill="var(--primary-red)" color="var(--primary-red)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-red)' }}>{currentXp} XP</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="main-layout">
        <div className="content-body slide-up">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Render only 5 icons on mobile bottom bar to maintain spacing
          if (item.name === 'Mitigasi') return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name === 'Kontak Darurat' ? 'Kontak' : item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
