import React, { useState } from 'react';
import { ShieldAlert, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './LoginScreen.css';

export default function LoginScreen({ onLoginSuccess, onGoToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Custom Welcome Popup State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Username/Email dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Small delay to simulate verification and show feedback
    setTimeout(() => {
      const res = localStorageService.loginUser(username, password);
      setIsLoading(false);
      if (res.success) {
        setLoggedInUser(res.user);
        setShowWelcomePopup(true);
      } else {
        setError(res.message);
      }
    }, 600);
  };

  return (
    <div className="auth-page-container">
      {/* Welcome Popup Modal */}
      {showWelcomePopup && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-card">
            <div className="custom-popup-icon-container success">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="custom-popup-title">Selamat Datang</h3>
            <p className="custom-popup-message">
              Halo, <strong>{loggedInUser?.name}</strong>! Anda berhasil masuk ke sistem PMR First Aid.
            </p>
            <button
              className="custom-popup-btn"
              onClick={() => {
                setShowWelcomePopup(false);
                localStorageService.setSessionUser(loggedInUser);
                onLoginSuccess(loggedInUser);
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}

      <div className="auth-card-wrapper fade-in">
        <div className="auth-brand-header">
          <div className="brand-logo-circle">
            <img
              src="/assets/images/logo.png"
              alt="Logo PMI"
              className="brand-logo"
            />
          </div>
          <h1 className="brand-title">PMR FIRST AID</h1>
          <p className="brand-subtitle">Palang Merah Remaja Indonesia</p>
        </div>

        <div className="auth-form-container">
          <h2 className="auth-title">Masuk ke Akun Anda</h2>
          <p className="auth-desc">Silakan masukkan username/email dan kata sandi Anda.</p>

          {error && (
            <div className="auth-error-banner slide-up">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-input-label">Username atau Email</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Masukkan username atau email"
                  className="auth-input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Kata Sandi (Password)</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className="auth-input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <span>Belum memiliki akun?</span>
          <button onClick={onGoToRegister} className="auth-toggle-link" disabled={isLoading}>
            Daftar Akun Baru
          </button>
        </div>
      </div>
    </div>
  );
}
