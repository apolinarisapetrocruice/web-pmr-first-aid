import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './core/layout/Layout';
import HomeScreen from './features/home/HomeScreen';
import LearningListScreen from './features/learning/LearningListScreen';
import LearningDetailScreen from './features/learning/LearningDetailScreen';
import EmergencyListScreen from './features/emergency/EmergencyListScreen';
import PracticeScreen from './features/practice/PracticeScreen';
import QuizListScreen from './features/quiz/QuizListScreen';
import QuizPlayScreen from './features/quiz/QuizPlayScreen';
import QuizResultScreen from './features/quiz/QuizResultScreen';
import VideoListScreen from './features/video/VideoListScreen';
import VideoPlayerScreen from './features/video/VideoPlayerScreen';
import MitigationListScreen from './features/mitigation/MitigationListScreen';
import MitigationDetailScreen from './features/mitigation/MitigationDetailScreen';
import ProfileScreen from './features/profile/ProfileScreen';
import SplashScreen from './features/splash/SplashScreen';

// Authentication & Admin Dashboard
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import AdminDashboard from './features/admin/AdminDashboard';
import { localStorageService } from './core/services/localStorageService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    // Initial fetch
    setCurrentUser(localStorageService.getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(localStorageService.getCurrentUser());
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <RegisterScreen
          onRegisterSuccess={() => setAuthScreen('login')}
          onGoToLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginScreen
        onLoginSuccess={(user) => setCurrentUser(user)}
        onGoToRegister={() => setAuthScreen('register')}
      />
    );
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard onLogout={() => setCurrentUser(null)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeScreen />} />

          {/* Learning Routes */}
          <Route path="learning" element={<LearningListScreen />} />
          <Route path="learning/:id" element={<LearningDetailScreen />} />

          {/* Practice Choice */}
          <Route path="practice" element={<PracticeScreen />} />

          {/* Quiz Routes */}
          <Route path="quiz" element={<QuizListScreen />} />
          <Route path="quiz/play" element={<QuizPlayScreen />} />
          <Route path="quiz/result" element={<QuizResultScreen />} />

          {/* Video Routes */}
          <Route path="video" element={<VideoListScreen />} />
          <Route path="video/:id" element={<VideoPlayerScreen />} />

          {/* Mitigation Routes */}
          <Route path="mitigation" element={<MitigationListScreen />} />
          <Route path="mitigation/:id" element={<MitigationDetailScreen />} />

          {/* Contact Routes */}
          <Route path="emergency" element={<EmergencyListScreen />} />

          {/* Profile Routes */}
          <Route path="profile" element={<ProfileScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
