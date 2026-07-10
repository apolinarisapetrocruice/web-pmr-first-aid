import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Timer, AlertTriangle, ArrowRight, XCircle, CheckCircle } from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './QuizPlayScreen.css';

export default function QuizPlayScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const partParam = searchParams.get('part');
  const modeParam = searchParams.get('mode');
  const evalParam = searchParams.get('eval');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Configuration
  const [config, setConfig] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Helper to shuffle array
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper to shuffle options and track correct index
  const shuffleQuestionOptions = (question) => {
    const correctAnswerText = question.options[question.correctAnswerIndex];
    const shuffledOptions = shuffleArray(question.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

    return {
      ...question,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex,
    };
  };

  // Initialize Quiz
  useEffect(() => {
    let quizLabel = '';
    let duration = 0;
    let isEvaluation = false;
    let rawQuestions = [];

    const allQuestions = localStorageService.getQuizQuestions();

    if (partParam) {
      const partNum = parseInt(partParam);
      quizLabel = `Bagian ${partNum}`;
      isEvaluation = false;
      rawQuestions = allQuestions.filter(q => q.part === partNum);
      
      switch (modeParam) {
        case 'belajar': duration = 7 * 60; break;
        case 'terampil': duration = 5 * 60; break;
        case 'tanggap': duration = 3 * 60; break;
        default: duration = 7 * 60;
      }
    } else if (evalParam) {
      isEvaluation = true;
      duration = 11 * 60;
      const isA = evalParam.toLowerCase() === 'a';
      quizLabel = `Evaluasi Akhir - Bagian ${isA ? 'A' : 'B'}`;
      rawQuestions = isA 
        ? allQuestions.filter(q => q.number >= 1 && q.number <= 25)
        : allQuestions.filter(q => q.number >= 26 && q.number <= 50);
    } else {
      // Fallback
      navigate('/quiz');
      return;
    }

    // Shuffle questions
    const shuffledRaw = shuffleArray(rawQuestions);
    
    // Process and shuffle options
    const processed = shuffledRaw.map((q, idx) => {
      const cleanText = q.question.replace(/^\d+\.\s*/, '');
      const shuffledOptionsQ = shuffleQuestionOptions(q);
      return {
        ...shuffledOptionsQ,
        question: `${idx + 1}. ${cleanText}`,
        number: idx + 1
      };
    });

    setQuestions(processed);
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    
    setConfig({
      quizLabel,
      durationSeconds: duration,
      isEvaluation,
      evaluationId: evalParam,
      mode: modeParam,
      part: partParam ? parseInt(partParam) : null
    });

    setInitialized(true);
  }, [partParam, modeParam, evalParam, navigate]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!initialized || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [initialized, timeLeft]);

  const handleTimeout = () => {
    alert('Waktu Anda telah habis!');
    finishQuiz(true);
  };

  const handleAnswerClick = (optionIdx) => {
    if (showExplanation) return;

    setSelectedIndex(optionIdx);
    const correctIdx = questions[currentIndex].correctAnswerIndex;
    const isCorrect = optionIdx === correctIdx;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setUserAnswers(prev => [...prev, optionIdx]);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedIndex(null);
      setShowExplanation(false);
    } else {
      finishQuiz(false);
    }
  };

  const finishQuiz = (isTimeOver = false) => {
    clearInterval(timerRef.current);
    
    // Compute elapsed time
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // If time is up, fill remaining with -1 (incorrect)
    let finalAnswers = [...userAnswers];
    if (isTimeOver) {
      while (finalAnswers.length < questions.length) {
        finalAnswers.push(-1);
      }
    }

    // Predikat & emoji helper
    const percentage = (score / questions.length) * 100;
    let predikat = 'Kurang';
    let emoji = '😢';
    
    if (percentage === 100) {
      predikat = 'Istimewa';
      emoji = '🏆';
    } else if (percentage >= 80) {
      predikat = 'Sangat Baik';
      emoji = '🌟';
    } else if (percentage >= 60) {
      predikat = 'Baik';
      emoji = '👍';
    } else if (percentage >= 50) {
      predikat = 'Cukup';
      emoji = '😐';
    }

    const resultItem = {
      quizLabel: config.quizLabel,
      mode: config.isEvaluation ? 'Tanggap' : (config.mode.charAt(0).toUpperCase() + config.mode.slice(1)),
      part: config.part,
      score: score,
      total: questions.length,
      isEvaluation: config.isEvaluation,
      predikat: predikat,
      emoji: emoji,
      timeTakenSeconds: elapsedSeconds,
    };

    // Save to local storage
    localStorageService.saveQuizResult(resultItem);

    // Dispatch event to update Layout instantly
    window.dispatchEvent(new Event('profile-updated'));

    // Route to result screen
    navigate('/quiz/result', { 
      state: { 
        score,
        total: questions.length,
        answers: finalAnswers,
        questions,
        config,
        timeTakenSeconds: elapsedSeconds,
        resultMeta: resultItem
      } 
    });
  };

  if (!initialized || questions.length === 0) {
    return <div style={{ padding: '40px', textAlignment: 'center', fontWeight: 600 }}>Loading Kuis...</div>;
  }

  const currentQuestion = questions[currentIndex];
  const isUrgent = timeLeft < 30;

  // Format Time M:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="quiz-play-container fade-in">
      {/* HEADER SECTION */}
      <div className="quiz-play-header">
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900 }}>
            {config.isEvaluation ? 'Evaluasi Belajar' : `Kuis Bagian ${config.part}`}
          </h3>
          {!config.isEvaluation && (
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--practice-orange)' }}>
              Mode: {config.mode.toUpperCase()}
            </p>
          )}
        </div>

        {/* Timer Widget */}
        <div className={`quiz-timer-box ${isUrgent ? 'urgent' : 'normal'}`}>
          <Timer size={18} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="material-progress-section" style={{ border: 'none', padding: 0 }}>
        <div className="progress-info">
          <span>Nomor Pertanyaan</span>
          <span>{currentIndex + 1} dari {questions.length}</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              backgroundColor: 'var(--practice-orange)'
            }}
          />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="quiz-question-card">
        <span className="question-meta">Pertanyaan {currentIndex + 1}</span>
        <p className="question-text">{currentQuestion.question}</p>

        {/* Options */}
        <div className="options-list">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            
            let btnClass = '';
            if (showExplanation) {
              if (isCorrect) {
                btnClass = 'correct';
              } else if (isSelected) {
                btnClass = 'incorrect';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                className={`option-button ${btnClass}`}
                onClick={() => handleAnswerClick(idx)}
                disabled={showExplanation}
              >
                <div className="option-letter">{letter}</div>
                <div style={{ flex: 1 }}>{option}</div>
                {showExplanation && isCorrect && <CheckCircle size={18} />}
                {showExplanation && isSelected && !isCorrect && <XCircle size={18} />}
              </button>
            );
          })}
        </div>

        {/* EXPLANATION */}
        {showExplanation && (
          <div className="explanation-card">
            <span className="explanation-title">
              <AlertTriangle size={16} /> Penjelasan Jawaban
            </span>
            <p className="explanation-text">{currentQuestion.explanation}</p>
            
            <button 
              type="button" 
              className="nav-btn primary" 
              style={{ width: 'fit-content', alignSelf: 'flex-end', gap: '6px' }}
              onClick={handleNext}
            >
              {currentIndex === questions.length - 1 ? 'Selesaikan Kuis' : 'Pertanyaan Berikutnya'} 
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
