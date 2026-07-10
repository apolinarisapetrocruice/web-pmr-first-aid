import React, { useState } from 'react';
import { ShieldAlert, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './LoginScreen.css'; // Reuse common layout styles

export default function RegisterScreen({ onRegisterSuccess, onGoToLogin }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !username.trim() || !password || !confirmPassword) {
      setError('Semua bidang (field) wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 4) {
      setError('Password minimal 4 karakter.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      try {
        const res = await localStorageService.registerUser(name, username, password);
        setIsLoading(false);

        if (res.success) {
          setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke halaman login...');
          setTimeout(() => {
            onRegisterSuccess();
          }, 1500);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setIsLoading(false);
        setError('Gagal menghubungkan ke database.');
      }
    }, 600);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper fade-in">
        <div className="auth-brand-header">
          <div className="brand-logo-circle">
            <img
              src="/assets/images/logo.png"
              alt="Logo PMI"
              className="brand-logo"
            />
          </div>
          <p className="brand-title">PMR FIRST AID</p>
          <p className="brand-subtitle">Palang Merah Remaja Indonesia</p>
        </div>

        <div className="auth-form-container">
          <h2 className="auth-title">Daftar Akun Baru</h2>
          <p className="auth-desc">Lengkapi formulir di bawah ini untuk membuat akun Siswa.</p>

          {error && (
            <div className="auth-error-banner slide-up">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-error-banner slide-up" style={{ backgroundColor: '#E8F5E9', borderLeftColor: '#2E7D32', color: '#2E7D32' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="auth-input-group">
              <label className="auth-input-label">Nama Lengkap</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  className="auth-input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="auth-input-group">
              <label className="auth-input-label">Username</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  className="auth-input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label className="auth-input-label">Kata Sandi (Password)</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Buat password baru"
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

            {/* Confirm Password */}
            <div className="auth-input-group">
              <label className="auth-input-label">Konfirmasi Kata Sandi</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang password"
                  className="auth-input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <span>Sudah memiliki akun?</span>
          <button onClick={onGoToLogin} className="auth-toggle-link" disabled={isLoading}>
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
