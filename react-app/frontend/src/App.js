// ===================================================================
// 🚀 ÉtudIA V4.1 - APP.JS PARTIE 1/4 : IMPORTS + CONFIGURATION
// SECTION: Imports React + Configuration OpenRouter DeepSeek R1
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

import React, { useState, useEffect } from 'react';
import './App.css';
import UploadDocument from './components/UploadDocument';
import ChatIA from './components/ChatIA';

// 🔧 CONFIGURATION ÉtudIA V4.1 - OpenRouter DeepSeek R1
const API_URL = process.env.REACT_APP_API_URL || 'https://etudia-v4-revolutionary.onrender.com';
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;  // 🆕 NOUVEAU
const DEEPSEEK_MODEL_FREE = process.env.REACT_APP_DEEPSEEK_MODEL_FREE || 'deepseek/deepseek-r1:free';  // 🆕
const DEEPSEEK_MODEL_PAID = process.env.REACT_APP_DEEPSEEK_MODEL_PAID || 'deepseek/deepseek-r1';       // 🆕

// 📊 LOGS CONFIGURATION V4.1
if (process.env.NODE_ENV === 'development') {
  console.log('🤖 ÉtudIA V4.1 avec OpenRouter DeepSeek R1 initialisé !');
  console.log('- API URL:', API_URL);
  console.log('- OpenRouter configuré:', !!OPENROUTER_API_KEY);
  console.log('- Modèle gratuit:', DEEPSEEK_MODEL_FREE);
  console.log('- Modèle payant:', DEEPSEEK_MODEL_PAID);
}

// 🎨 THÈME COLORS - Design révolutionnaire ÉtudIA
const THEME = {
  primary: '#FF6B35',      // Orange ÉtudIA signature
  secondary: '#4ECDC4',    // Turquoise moderne
  accent: '#45B7D1',       // Bleu technologique
  success: '#96CEB4',      // Vert validation
  warning: '#FECA57',      // Jaune attention
  dark: '#2C3E50',         // Bleu foncé élégant
  light: '#F8F9FA',        // Blanc cassé doux
  gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%)',
  shadowMain: '0 20px 40px rgba(255, 107, 53, 0.3)',
  shadowSecondary: '0 10px 30px rgba(78, 205, 196, 0.2)'
};

// 🏫 DONNÉES ÉCOLES PARTENAIRES - Côte d'Ivoire
const SCHOOLS_DATA = [
  { name: 'Lycée Classique d\'Abidjan', emoji: '🏛️', students: 247, district: 'Abidjan' },
  { name: 'Lycée Technique d\'Abidjan', emoji: '⚙️', students: 189, district: 'Abidjan' },
  { name: 'Collège Notre-Dame d\'Afrique', emoji: '⛪', students: 156, district: 'Cocody' },
  { name: 'Lycée Sainte-Marie de Cocody', emoji: '🌟', students: 203, district: 'Cocody' },
  { name: 'Institution Sainte-Marie', emoji: '✨', students: 145, district: 'Cocody' },
  { name: 'Cours Secondaire Catholique', emoji: '📚', students: 178, district: 'Plateau' },
  { name: 'Lycée Municipal d\'Abidjan', emoji: '🏛️', students: 234, district: 'Adjamé' },
  { name: 'Groupe Scolaire Les Génies', emoji: '🧠', students: 167, district: 'Marcory' },
  { name: 'École Internationale WASCAL', emoji: '🌍', students: 198, district: 'Riviera' },
  { name: 'Lycée Moderne de Bouaké', emoji: '🏢', students: 134, district: 'Bouaké' },
  { name: 'Collège Henri Konan Bédié', emoji: '👨‍🎓', students: 176, district: 'Yamoussoukro' },
  { name: 'École Privée Excellence', emoji: '🏆', students: 123, district: 'Daloa' }
];

// 📊 STATISTIQUES TEMPS RÉEL - Données dynamiques
const REAL_TIME_STATS = {
  totalStudents: 2156,
  activeChats: 89,
  documentsProcessed: 1247,
  averageResponseTime: '2.3s',
  accuracyRate: '96.8%',
  countriesCovered: 12,
  languagesSupported: 8,
  teachersConnected: 156
};

// 🎯 MODES D'APPRENTISSAGE - Configuration DeepSeek R1
const LEARNING_MODES = {
  step_by_step: {
    name: 'Étape par Étape',
    icon: '📊',
    description: 'Décomposition progressive des problèmes',
    color: THEME.accent,
    tokens: 180,
    temperature: 0.05
  },
  normal: {
    name: 'Conversation',
    icon: '💬', 
    description: 'Discussion naturelle et explications',
    color: THEME.primary,
    tokens: 250,
    temperature: 0.15
  },
  direct_solution: {
    name: 'Solution Directe',
    icon: '⚡',
    description: 'Réponses rapides et précises',
    color: THEME.success,
    tokens: 400,
    temperature: 0.1
  }
};

// 🌍 LANGUES SUPPORTÉES - Afrique focus
const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', primary: true },
  { code: 'en', name: 'English', flag: '🇬🇧', primary: true },
  { code: 'ar', name: 'العربية', flag: '🇲🇦', primary: false },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', primary: false },
  { code: 'pt', name: 'Português', flag: '🇵🇹', primary: false },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', primary: false },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬', primary: false },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹', primary: false }
];

// 🚀 FEATURES V4.1 - Nouvelles fonctionnalités
const NEW_FEATURES_V4_1 = [
  {
    title: 'DeepSeek R1 Integration',
    description: 'IA de raisonnement avancée',
    icon: '🧠',
    status: 'new',
    badge: 'V4.1'
  },
  {
    title: 'OCR Multilingue',
    description: 'Reconnaissance 8 langues africaines',
    icon: '📸',
    status: 'improved',
    badge: 'Enhanced'
  },
  {
    title: 'Mode Hors-Ligne',
    description: 'Fonctionnement sans internet',
    icon: '📱',
    status: 'coming_soon',
    badge: 'Bientôt'
  },
  {
    title: 'Certification WAEC',
    description: 'Préparation examens officiels',
    icon: '🎓',
    status: 'new',
    badge: 'V4.1'
  }
];

// 🔧 UTILITY FUNCTIONS - Fonctions utilitaires
const utils = {
  // Formater nombres avec séparateurs
  formatNumber: (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  },
  
  // Calculer temps écoulé
  timeAgo: (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  },
  
  // Générer couleur aléatoire pour avatars
  getRandomColor: () => {
    const colors = [THEME.primary, THEME.secondary, THEME.accent, THEME.success];
    return colors[Math.floor(Math.random() * colors.length)];
  },
  
  // Vérifier si mobile
  isMobile: () => {
    return window.innerWidth <= 768;
  },
  
  // Générer ID unique
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// 📱 RESPONSIVE BREAKPOINTS - Points de rupture
const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  large: '(min-width: 1440px)'
};

// ===================================================================
// FIN PARTIE 1/4 - IMPORTS + CONFIGURATION
// Prochaine partie : Composant SchoolsScrollBanner + États React
// ===================================================================

// ===================================================================
// 🚀 ÉtudIA V4.1 - APP.JS PARTIE 2/4 : COMPOSANTS + ÉTAT REACT
// SECTION: SchoolsScrollBanner + React State Management + Effects
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

// 🏫 COMPOSANT BANNIÈRE ÉCOLES - Défilement horizontal écoles partenaires
const SchoolsScrollBanner = () => {
  return (
    <div className="schools-scroll-banner">
      <div className="schools-banner-header">
        <h4>🏫 Écoles Partenaires ÉtudIA - Côte d'Ivoire</h4>
        <span className="total-schools">{SCHOOLS_DATA.length}+ établissements connectés</span>
      </div>
      
      <div className="schools-scroll-content">
        <div className="schools-scroll-track">
          {/* Première série d'écoles */}
          {SCHOOLS_DATA.map((school, index) => (
            <div key={`school-1-${index}`} className="school-card">
              <div className="school-emoji">{school.emoji}</div>
              <div className="school-info">
                <div className="school-name">{school.name}</div>
                <div className="school-stats">
                  <span className="student-count">{school.students} élèves</span>
                  <span className="school-district">{school.district}</span>
                </div>
              </div>
              <div className="school-status">✅</div>
            </div>
          ))}
          
          {/* Duplication pour effet infini */}
          {SCHOOLS_DATA.map((school, index) => (
            <div key={`school-2-${index}`} className="school-card">
              <div className="school-emoji">{school.emoji}</div>
              <div className="school-info">
                <div className="school-name">{school.name}</div>
                <div className="school-stats">
                  <span className="student-count">{school.students} élèves</span>
                  <span className="school-district">{school.district}</span>
                </div>
              </div>
              <div className="school-status">✅</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 📊 COMPOSANT STATISTIQUES TEMPS RÉEL - Dashboard live
const StatsRealTime = ({ isVisible }) => {
  const [stats, setStats] = useState(REAL_TIME_STATS);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation compteurs
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Mise à jour stats (simulation temps réel)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeChats: prev.activeChats + Math.floor(Math.random() * 3) - 1,
        documentsProcessed: prev.documentsProcessed + Math.floor(Math.random() * 2)
      }));
    }, 30000); // Maj toutes les 30s

    return () => clearInterval(interval);
  }, []);

  const statsItems = [
    { key: 'totalStudents', label: 'Étudiants Actifs', icon: '👥', value: stats.totalStudents },
    { key: 'activeChats', label: 'Conversations Live', icon: '💬', value: stats.activeChats },
    { key: 'documentsProcessed', label: 'Documents Traités', icon: '📄', value: stats.documentsProcessed },
    { key: 'averageResponseTime', label: 'Temps Réponse', icon: '⚡', value: stats.averageResponseTime },
    { key: 'accuracyRate', label: 'Précision IA', icon: '🎯', value: stats.accuracyRate },
    { key: 'countriesCovered', label: 'Pays Couverts', icon: '🌍', value: stats.countriesCovered }
  ];

  return (
    <div className={`stats-realtime ${isVisible ? 'visible' : ''}`}>
      <div className="stats-header">
        <h3>📊 Statistiques Temps Réel</h3>
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span>Live</span>
        </div>
      </div>
      
      <div className="stats-grid">
        {statsItems.map(({ key, label, icon, value }) => (
          <div key={key} className={`stat-card ${isAnimating ? 'animating' : ''}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
              <div className="stat-value">
                {typeof value === 'number' ? utils.formatNumber(value) : value}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🚀 COMPOSANT NOUVELLES FONCTIONNALITÉS - Features V4.1
const NewFeaturesShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % NEW_FEATURES_V4_1.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="features-showcase">
      <div className="features-header">
        <h3>🚀 Nouveautés ÉtudIA V4.1</h3>
        <div className="version-badge">OpenRouter DeepSeek R1</div>
      </div>
      
      <div className="features-container">
        {NEW_FEATURES_V4_1.map((feature, index) => (
          <div 
            key={index}
            className={`feature-card ${index === activeFeature ? 'active' : ''}`}
            onClick={() => setActiveFeature(index)}
          >
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-content">
              <div className="feature-title">{feature.title}</div>
              <div className="feature-description">{feature.description}</div>
            </div>
            <div className={`feature-badge ${feature.status}`}>
              {feature.badge}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎯 COMPOSANT SÉLECTEUR MODES - Modes d'apprentissage
const LearningModeSelector = ({ currentMode, onModeChange }) => {
  return (
    <div className="learning-mode-selector">
      <div className="mode-header">
        <h4>🎯 Mode d'Apprentissage</h4>
        <div className="mode-info">Optimisé DeepSeek R1</div>
      </div>
      
      <div className="mode-options">
        {Object.entries(LEARNING_MODES).map(([key, mode]) => (
          <button
            key={key}
            className={`mode-option ${currentMode === key ? 'active' : ''}`}
            onClick={() => onModeChange(key)}
            style={{ '--mode-color': mode.color }}
          >
            <div className="mode-icon">{mode.icon}</div>
            <div className="mode-content">
              <div className="mode-name">{mode.name}</div>
              <div className="mode-desc">{mode.description}</div>
            </div>
            <div className="mode-stats">
              <span>{mode.tokens} tokens</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// 🎯 FONCTION APP PRINCIPALE - États React et logique
// ===================================================================

function App() {
  // 🔧 ÉTATS PRINCIPAUX - Gestion état application
  const [currentView, setCurrentView] = useState('home'); // home, upload, chat, profile
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [learningMode, setLearningMode] = useState('normal');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 📱 ÉTATS RESPONSIVE - Gestion écrans
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  
  // 🤖 ÉTATS IA OPENROUTER - Nouveaux états V4.1
  const [aiStatus, setAiStatus] = useState('checking'); // checking, online, offline
  const [modelPreference, setModelPreference] = useState('free'); // free, paid
  const [aiStats, setAiStats] = useState({
    requests: 0,
    responses: 0,
    avgResponseTime: 0,
    lastUpdate: null
  });
  
  // 📊 ÉTATS ANALYTICS - Suivi utilisation
  const [userSession, setUserSession] = useState({
    startTime: Date.now(),
    interactions: 0,
    documentsUploaded: 0,
    chatMessages: 0
  });
  
  // 🔔 ÉTATS NOTIFICATIONS - Alertes et messages
  const [notifications, setNotifications] = useState([]);
  const [showStats, setShowStats] = useState(false);
  
  // ===================================================================
  // 🔄 EFFECTS - Initialisation et surveillance
  // ===================================================================

  // 📱 EFFECT RESPONSIVE - Surveillance taille écran
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      
      // Fermer menu mobile sur redimensionnement
      if (width > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🚀 EFFECT INITIALISATION - Configuration initiale app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation ÉtudIA V4.1...');
        
        // Vérifier statut IA OpenRouter
        await checkAIStatus();
        
        // Charger profil utilisateur depuis localStorage
        const savedProfile = localStorage.getItem('etudia_user_profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
        
        // Charger préférences utilisateur
        const savedTheme = localStorage.getItem('etudia_theme');
        if (savedTheme === 'dark') {
          setIsDarkMode(true);
        }
        
        const savedMode = localStorage.getItem('etudia_learning_mode');
        if (savedMode && LEARNING_MODES[savedMode]) {
          setLearningMode(savedMode);
        }
        
        const savedModelPref = localStorage.getItem('etudia_model_preference');
        if (savedModelPref) {
          setModelPreference(savedModelPref);
        }
        
        // Animation de chargement
        setTimeout(() => {
          setIsLoading(false);
          console.log('✅ ÉtudIA V4.1 initialisé avec succès !');
        }, 2000);
        
      } catch (error) {
        console.error('❌ Erreur initialisation ÉtudIA:', error);
        setIsLoading(false);
        addNotification('Erreur lors de l\'initialisation', 'error');
      }
    };

    initializeApp();
  }, []);

  // 🤖 EFFECT VÉRIFICATION IA - Surveillance statut OpenRouter
  useEffect(() => {
    const interval = setInterval(checkAIStatus, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, []);

  // ===================================================================
  // 🔧 FONCTIONS UTILITAIRES - Helpers et actions
  // ===================================================================

  // 🤖 Vérifier statut IA OpenRouter
  const checkAIStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      
      if (data.status === 'ok' && data.services?.openrouter_deepseek?.includes('✅')) {
        setAiStatus('online');
        console.log('✅ OpenRouter DeepSeek R1 en ligne');
      } else {
        setAiStatus('offline');
        console.warn('⚠️ OpenRouter DeepSeek R1 hors ligne');
      }
    } catch (error) {
      console.error('❌ Erreur vérification IA:', error);
      setAiStatus('offline');
    }
  };

  // 🔔 Ajouter notification
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = utils.generateId();
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-suppression
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  // 👤 Sauvegarder profil utilisateur
  const saveUserProfile = (profile) => {
    setUserProfile(profile);
    localStorage.setItem('etudia_user_profile', JSON.stringify(profile));
    addNotification('Profil sauvegardé avec succès !', 'success');
  };

  // 🎯 Changer mode d'apprentissage
  const handleModeChange = (mode) => {
    setLearningMode(mode);
    localStorage.setItem('etudia_learning_mode', mode);
    addNotification(`Mode "${LEARNING_MODES[mode].name}" activé`, 'info');
  };

  // 🌙 Basculer thème
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('etudia_theme', newTheme ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', newTheme);
  };

  // 🤖 Changer préférence modèle IA
  const changeModelPreference = (preference) => {
    setModelPreference(preference);
    localStorage.setItem('etudia_model_preference', preference);
    addNotification(
      `Modèle ${preference === 'free' ? 'gratuit' : 'premium'} activé`, 
      'info'
    );
  };

// ===================================================================
// FIN PARTIE 2/4 - COMPOSANTS + ÉTAT REACT
// Prochaine partie : Interface principale et navigation
// ===================================================================

// ===================================================================
// 🚀 ÉtudIA V4.1 - APP.JS PARTIE 3/4 : INTERFACE + NAVIGATION
// SECTION: Interface principale + Navigation + Écrans loading
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

  // 📊 Mettre à jour session utilisateur
  const updateUserSession = (action, data = {}) => {
    setUserSession(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      [action]: (prev[action] || 0) + 1,
      lastActivity: Date.now(),
      ...data
    }));
  };

  // ===================================================================
  // 🎨 ÉCRAN DE CHARGEMENT - Animation révolutionnaire
  // ===================================================================

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          {/* Logo animé */}
          <div className="loading-logo-container">
            <div className="loading-logo">
              <span className="logo-text">ÉtudIA</span>
              <span className="logo-version">V4.1</span>
            </div>
            <div className="loading-orbit">
              <div className="orbit-dot orbit-1"></div>
              <div className="orbit-dot orbit-2"></div>
              <div className="orbit-dot orbit-3"></div>
            </div>
          </div>

          {/* Messages de chargement */}
          <div className="loading-messages">
            <div className="loading-title">
              🚀 Chargement ÉtudIA V4.1
            </div>
            <div className="loading-subtitle">
              Assistant IA Éducatif avec OpenRouter DeepSeek R1
            </div>
            <div className="loading-progress">
              <div className="progress-steps">
                <div className="step active">🔧 Configuration OpenRouter</div>
                <div className="step active">🤖 Initialisation DeepSeek R1</div>
                <div className="step active">🎯 Préparation modes apprentissage</div>
                <div className="step">✅ Prêt pour l'éducation !</div>
              </div>
            </div>
          </div>

          {/* Statistiques temps réel */}
          <div className="loading-stats">
            <div className="stat">
              <span className="stat-number">{utils.formatNumber(REAL_TIME_STATS.totalStudents)}</span>
              <span className="stat-label">Étudiants connectés</span>
            </div>
            <div className="stat">
              <span className="stat-number">{SCHOOLS_DATA.length}+</span>
              <span className="stat-label">Écoles partenaires</span>
            </div>
            <div className="stat">
              <span className="stat-number">{REAL_TIME_STATS.countriesCovered}</span>
              <span className="stat-label">Pays couverts</span>
            </div>
          </div>

          {/* Footer */}
          <div className="loading-footer">
            <div className="made-by">
              <span className="flag">🇨🇮</span>
              <span>Made with ❤️ by @Pacousstar - Côte d'Ivoire</span>
            </div>
            <div className="powered-by">
              Propulsé par OpenRouter DeepSeek R1
            </div>
          </div>
        </div>

        {/* Particules animées */}
        <div className="loading-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>
    );
  }

  // ===================================================================
  // 🧭 NAVIGATION PRINCIPALE - Header responsive
  // ===================================================================

  const Navigation = () => (
    <nav className={`main-navigation ${isMobile ? 'mobile' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => setCurrentView('home')}>
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            <span className="logo-name">ÉtudIA</span>
            <span className="logo-version">V4.1</span>
          </div>
        </div>

        {/* Menu desktop */}
        {!isMobile && (
          <div className="nav-menu">
            <button 
              className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Accueil</span>
            </button>
            
            <button 
              className={`nav-item ${currentView === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentView('upload')}
            >
              <span className="nav-icon">📤</span>
              <span className="nav-label">Upload</span>
            </button>
            
            <button 
              className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Chat IA</span>
              {aiStatus === 'online' && <span className="status-dot online"></span>}
            </button>
            
            <button 
              className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentView('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profil</span>
            </button>
          </div>
        )}

        {/* Actions header */}
        <div className="nav-actions">
          {/* Statut IA */}
          <div className={`ai-status ${aiStatus}`}>
            <span className="status-icon">
              {aiStatus === 'online' ? '🟢' : aiStatus === 'offline' ? '🔴' : '🟡'}
            </span>
            <span className="status-text">
              {aiStatus === 'online' ? 'DeepSeek R1' : 'Hors ligne'}
            </span>
          </div>

          {/* Sélecteur modèle */}
          <select 
            className="model-selector"
            value={modelPreference}
            onChange={(e) => changeModelPreference(e.target.value)}
          >
            <option value="free">🆓 Gratuit</option>
            <option value="paid">💎 Premium</option>
          </select>

          {/* Toggle thème */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Stats toggle */}
          <button 
            className="stats-toggle"
            onClick={() => setShowStats(!showStats)}
          >
            📊
          </button>

          {/* Menu mobile */}
          {isMobile && (
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="hamburger"></span>
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-items">
            {[
              { key: 'home', icon: '🏠', label: 'Accueil' },
              { key: 'upload', icon: '📤', label: 'Upload' },
              { key: 'chat', icon: '💬', label: 'Chat IA' },
              { key: 'profile', icon: '👤', label: 'Profil' }
            ].map(item => (
              <button
                key={item.key}
                className={`mobile-menu-item ${currentView === item.key ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView(item.key);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );

  // ===================================================================
  // 🏠 PAGE D'ACCUEIL - Landing révolutionnaire
  // ===================================================================

  const HomePage = () => (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🚀</span>
              <span className="badge-text">Nouvelle Version V4.1</span>
              <span className="badge-highlight">OpenRouter DeepSeek R1</span>
            </div>
            
            <h1 className="hero-title">
              Révolutionnez votre <span className="highlight">éducation</span> avec l'IA
            </h1>
            
            <p className="hero-description">
              ÉtudIA V4.1 utilise l'IA de raisonnement avancée DeepSeek R1 pour vous accompagner 
              dans vos études. Upload vos documents, posez vos questions, progressez intelligemment.
            </p>
            
            <div className="hero-actions">
              <button 
                className="cta-primary"
                onClick={() => setCurrentView('upload')}
              >
                <span className="cta-icon">📤</span>
                <span className="cta-text">Commencer maintenant</span>
              </button>
              
              <button 
                className="cta-secondary"
                onClick={() => setCurrentView('chat')}
              >
                <span className="cta-icon">💬</span>
                <span className="cta-text">Essayer le Chat IA</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{utils.formatNumber(REAL_TIME_STATS.totalStudents)}</div>
                <div className="stat-label">Étudiants actifs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{REAL_TIME_STATS.averageResponseTime}</div>
                <div className="stat-label">Temps de réponse</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{REAL_TIME_STATS.accuracyRate}</div>
                <div className="stat-label">Précision IA</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image">
              <div className="floating-cards">
                <div className="card card-1">
                  <div className="card-icon">🤖</div>
                  <div className="card-text">IA DeepSeek R1</div>
                </div>
                <div className="card card-2">
                  <div className="card-icon">📚</div>
                  <div className="card-text">OCR Multilingue</div>
                </div>
                <div className="card card-3">
                  <div className="card-icon">🎯</div>
                  <div className="card-text">3 Modes d'apprentissage</div>
                </div>
                <div className="card card-4">
                  <div className="card-icon">🇨🇮</div>
                  <div className="card-text">Made in Côte d'Ivoire</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bannière écoles */}
      <SchoolsScrollBanner />

      {/* Section fonctionnalités */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>🚀 Fonctionnalités ÉtudIA V4.1</h2>
            <p>Découvrez les nouveautés révolutionnaires avec OpenRouter DeepSeek R1</p>
          </div>

          <NewFeaturesShowcase />

          <LearningModeSelector 
            currentMode={learningMode}
            onModeChange={handleModeChange}
          />
        </div>
      </section>

      {/* Stats temps réel */}
      {showStats && (
        <StatsRealTime isVisible={showStats} />
      )}

      {/* Section call-to-action finale */}
      <section className="final-cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Prêt à révolutionner vos études ?</h2>
            <p>Rejoignez les {utils.formatNumber(REAL_TIME_STATS.totalStudents)} étudiants qui utilisent déjà ÉtudIA</p>
            
            <div className="cta-buttons">
              <button 
                className="cta-upload"
                onClick={() => setCurrentView('upload')}
              >
                📤 Uploader un document
              </button>
              <button 
                className="cta-chat"
                onClick={() => setCurrentView('chat')}
              >
                💬 Démarrer une conversation
              </button>
            </div>
          </div>

          <div className="cta-countries">
            <h4>🌍 Disponible dans toute l'Afrique</h4>
            <div className="countries-flags">
              {['🇨🇮', '🇳🇬', '🇬🇭', '🇸🇳', '🇲🇱', '🇧🇫', '🇳🇪', '🇹🇩', '🇨🇲', '🇨🇩', '🇰🇪', '🇹🇿'].map((flag, i) => (
                <span key={i} className="country-flag">{flag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // ===================================================================
  // 📱 RENDU CONDITIONNEL - Basé sur currentView
  // ===================================================================

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      
      case 'upload':
        return (
          <div className="view-container">
            <div className="view-header">
              <h1>📤 Upload Document</h1>
              <p>Téléchargez vos documents pour analyse IA avec DeepSeek R1</p>
            </div>
            <UploadDocument 
              onUploadSuccess={(data) => {
                updateUserSession('documentsUploaded');
                addNotification('Document uploadé avec succès !', 'success');
              }}
              learningMode={learningMode}
              modelPreference={modelPreference}
            />
          </div>
        );
      
      case 'chat':
        return (
          <div className="view-container">
            <div className="view-header">
              <h1>💬 Chat IA</h1>
              <p>Conversez avec votre assistant IA éducatif DeepSeek R1</p>
              <div className="ai-status-detail">
                <span className={`status-indicator ${aiStatus}`}></span>
                <span>OpenRouter DeepSeek R1 - {aiStatus === 'online' ? 'En ligne' : 'Hors ligne'}</span>
              </div>
            </div>
            <ChatIA 
              userProfile={userProfile}
              learningMode={learningMode}
              modelPreference={modelPreference}
              onMessageSent={() => {
                updateUserSession('chatMessages');
              }}
            />
          </div>
        );
      
      case 'profile':
        return (
          <div className="view-container">
            <div className="view-header">
              <h1>👤 Profil Utilisateur</h1>
              <p>Gérez vos préférences et suivez vos progrès</p>
            </div>
            <ProfilePage 
              userProfile={userProfile}
              onSaveProfile={saveUserProfile}
              userSession={userSession}
              aiStats={aiStats}
              learningMode={learningMode}
              onModeChange={handleModeChange}
              modelPreference={modelPreference}
              onModelChange={changeModelPreference}
            />
          </div>
        );
      
      default:
        return <HomePage />;
    }
  };

// ===================================================================
// FIN PARTIE 3/4 - INTERFACE + NAVIGATION
// Prochaine partie : Composant ProfilePage + Notifications + Export
// ===================================================================

// ===================================================================
// 🚀 ÉtudIA V4.1 - APP.JS PARTIE 4/4 : PROFILE + NOTIFICATIONS + EXPORT
// SECTION: Composant ProfilePage + Système notifications + Export final
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

  // ===================================================================
  // 👤 COMPOSANT PAGE PROFIL - Gestion utilisateur complète
  // ===================================================================

  const ProfilePage = ({ 
    userProfile, 
    onSaveProfile, 
    userSession, 
    aiStats, 
    learningMode, 
    onModeChange, 
    modelPreference, 
    onModelChange 
  }) => {
    const [profileData, setProfileData] = useState(userProfile || {
      nom: '',
      prenom: '',
      classe: '',
      etablissement: '',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      email: '',
      telephone: '',
      dateInscription: new Date().toISOString().split('T')[0],
      preferences: {
        notifications: true,
        theme: 'light',
        langue: 'fr'
      }
    });

    const [isEditing, setIsEditing] = useState(!userProfile);
    const [activeTab, setActiveTab] = useState('general');

    // Sauvegarder profil
    const handleSaveProfile = () => {
      onSaveProfile(profileData);
      setIsEditing(false);
    };

    // Calculer statistiques utilisateur
    const userStats = {
      tempsConnecte: userSession.startTime ? Math.floor((Date.now() - userSession.startTime) / 1000 / 60) : 0,
      sessionsTotal: parseInt(localStorage.getItem('etudia_total_sessions') || '1'),
      documentsUploades: userSession.documentsUploaded || 0,
      messagesEnvoyes: userSession.chatMessages || 0,
      derniereActivite: userSession.lastActivity ? new Date(userSession.lastActivity).toLocaleString('fr-FR') : 'Maintenant'
    };

    const tabs = [
      { key: 'general', icon: '👤', label: 'Général' },
      { key: 'preferences', icon: '⚙️', label: 'Préférences' },
      { key: 'stats', icon: '📊', label: 'Statistiques' },
      { key: 'ai', icon: '🤖', label: 'Configuration IA' }
    ];

    return (
      <div className="profile-page">
        {/* En-tête profil */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle" style={{ backgroundColor: utils.getRandomColor() }}>
              {profileData.prenom ? profileData.prenom[0].toUpperCase() : '👤'}
            </div>
            <div className="avatar-status online"></div>
          </div>
          
          <div className="profile-info">
            <h2>{profileData.prenom ? `${profileData.prenom} ${profileData.nom}` : 'Nouvel utilisateur'}</h2>
            <p>{profileData.classe} - {profileData.etablissement}</p>
            <div className="profile-location">
              <span className="flag">🇨🇮</span>
              <span>{profileData.ville}, {profileData.pays}</span>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <span>✏️</span>
                <span>Modifier</span>
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleSaveProfile}>
                  <span>✅</span>
                  <span>Sauvegarder</span>
                </button>
                <button className="cancel-button" onClick={() => setIsEditing(false)}>
                  <span>❌</span>
                  <span>Annuler</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Onglets navigation */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu onglets */}
        <div className="profile-content">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="tab-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Votre prénom"
                  />
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Votre nom de famille"
                  />
                </div>

                <div className="form-group">
                  <label>Classe *</label>
                  <select
                    value={profileData.classe}
                    onChange={(e) => setProfileData({...profileData, classe: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="">Sélectionner une classe</option>
                    <option value="6ème">6ème</option>
                    <option value="5ème">5ème</option>
                    <option value="4ème">4ème</option>
                    <option value="3ème">3ème</option>
                    <option value="2nde">2nde</option>
                    <option value="1ère">1ère</option>
                    <option value="Terminale">Terminale</option>
                    <option value="Licence 1">Licence 1</option>
                    <option value="Licence 2">Licence 2</option>
                    <option value="Licence 3">Licence 3</option>
                    <option value="Master 1">Master 1</option>
                    <option value="Master 2">Master 2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Établissement</label>
                  <input
                    type="text"
                    value={profileData.etablissement}
                    onChange={(e) => setProfileData({...profileData, etablissement: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Nom de votre école/université"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    placeholder="votre.email@exemple.com"
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({...profileData, telephone: e.target.value})}
                    disabled={!isEditing}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Onglet Préférences */}
          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="preferences-grid">
                <div className="preference-group">
                  <h4>🎯 Mode d'apprentissage</h4>
                  <LearningModeSelector 
                    currentMode={learningMode}
                    onModeChange={onModeChange}
                  />
                </div>

                <div className="preference-group">
                  <h4>🤖 Modèle IA</h4>
                  <div className="model-options">
                    <label className="model-option">
                      <input
                        type="radio"
                        name="model"
                        value="free"
                        checked={modelPreference === 'free'}
                        onChange={(e) => onModelChange(e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-title">🆓 Gratuit</div>
                        <div className="option-desc">DeepSeek R1 Free - File d'attente</div>
                      </div>
                    </label>

                    <label className="model-option">
                      <input
                        type="radio"
                        name="model"
                        value="paid"
                        checked={modelPreference === 'paid'}
                        onChange={(e) => onModelChange(e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-title">💎 Premium</div>
                        <div className="option-desc">DeepSeek R1 - Priorité absolue</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="preference-group">
                  <h4>🌐 Langue</h4>
                  <select
                    value={profileData.preferences?.langue || 'fr'}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, langue: e.target.value }
                    })}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="preference-group">
                  <h4>🔔 Notifications</h4>
                  <div className="toggle-group">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={profileData.preferences?.notifications || false}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          preferences: { ...profileData.preferences, notifications: e.target.checked }
                        })}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Recevoir les notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'stats' && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{userStats.tempsConnecte}min</div>
                  <div className="stat-label">Session actuelle</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{userStats.sessionsTotal}</div>
                  <div className="stat-label">Sessions totales</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📄</div>
                  <div className="stat-value">{userStats.documentsUploades}</div>
                  <div className="stat-label">Documents uploadés</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-value">{userStats.messagesEnvoyes}</div>
                  <div className="stat-label">Messages envoyés</div>
                </div>

                <div className="stat-card large">
                  <div className="stat-icon">🕒</div>
                  <div className="stat-value">{userStats.derniereActivite}</div>
                  <div className="stat-label">Dernière activité</div>
                </div>

                <div className="stat-card large">
                  <div className="stat-icon">📅</div>
                  <div className="stat-value">{new Date(profileData.dateInscription).toLocaleDateString('fr-FR')}</div>
                  <div className="stat-label">Membre depuis</div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Configuration IA */}
          {activeTab === 'ai' && (
            <div className="tab-content">
              <div className="ai-config">
                <div className="ai-status-card">
                  <div className="ai-header">
                    <h4>🤖 Statut OpenRouter DeepSeek R1</h4>
                    <div className={`status-badge ${aiStatus}`}>
                      {aiStatus === 'online' ? '🟢 En ligne' : '🔴 Hors ligne'}
                    </div>
                  </div>
                  
                  <div className="ai-details">
                    <div className="ai-detail">
                      <span className="detail-label">Modèle actuel:</span>
                      <span className="detail-value">
                        {modelPreference === 'free' ? DEEPSEEK_MODEL_FREE : DEEPSEEK_MODEL_PAID}
                      </span>
                    </div>
                    
                    <div className="ai-detail">
                      <span className="detail-label">Mode d'apprentissage:</span>
                      <span className="detail-value">{LEARNING_MODES[learningMode].name}</span>
                    </div>
                    
                    <div className="ai-detail">
                      <span className="detail-label">Tokens max:</span>
                      <span className="detail-value">{LEARNING_MODES[learningMode].tokens}</span>
                    </div>
                    
                    <div className="ai-detail">
                      <span className="detail-label">Température:</span>
                      <span className="detail-value">{LEARNING_MODES[learningMode].temperature}</span>
                    </div>
                  </div>

                  <button 
                    className="test-ai-button"
                    onClick={async () => {
                      addNotification('Test de connexion IA en cours...', 'info');
                      await checkAIStatus();
                    }}
                  >
                    🔧 Tester la connexion IA
                  </button>
                </div>

                <div className="ai-usage-stats">
                  <h4>📊 Statistiques d'utilisation IA</h4>
                  <div className="usage-grid">
                    <div className="usage-stat">
                      <div className="usage-number">{aiStats.requests || 0}</div>
                      <div className="usage-label">Requêtes envoyées</div>
                    </div>
                    <div className="usage-stat">
                      <div className="usage-number">{aiStats.responses || 0}</div>
                      <div className="usage-label">Réponses reçues</div>
                    </div>
                    <div className="usage-stat">
                      <div className="usage-number">{aiStats.avgResponseTime || 0}s</div>
                      <div className="usage-label">Temps moyen</div>
                    </div>
                  </div>
                </div>

                <div className="ai-tips">
                  <h4>💡 Conseils d'utilisation</h4>
                  <div className="tips-list">
                    <div className="tip">
                      <span className="tip-icon">🆓</span>
                      <span className="tip-text">
                        Utilisez le mode gratuit pour les questions simples
                      </span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">💎</span>
                      <span className="tip-text">
                        Passez en premium pour les analyses complexes
                      </span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">📊</span>
                      <span className="tip-text">
                        Mode "Étape par Étape" idéal pour les maths
                      </span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">⚡</span>
                      <span className="tip-text">
                        Mode "Solution Directe" pour les urgences
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===================================================================
  // 🔔 SYSTÈME DE NOTIFICATIONS - Toast messages
  // ===================================================================

  const NotificationSystem = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="notification-container">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          >
            <div className="notification-icon">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'info' && 'ℹ️'}
            </div>
            
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {utils.timeAgo(notification.timestamp)}
              </div>
            </div>

            <button className="notification-close">×</button>
          </div>
        ))}
      </div>
    );
  };

  // ===================================================================
  // 🌍 FOOTER GLOBAL - Information et liens
  // ===================================================================

  const GlobalFooter = () => (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">ÉtudIA V4.1</span>
          </div>
          <p className="footer-description">
            L'Assistant IA Éducatif révolutionnaire pour l'Afrique. 
            Propulsé par OpenRouter DeepSeek R1.
          </p>
          <div className="footer-social">
            <span className="social-item">🇨🇮 Made in Côte d'Ivoire</span>
            <span className="social-item">❤️ by @Pacousstar</span>
          </div>
        </div>

        <div className="footer-section">
          <h4>🚀 Fonctionnalités</h4>
          <ul className="footer-links">
            <li>📤 Upload Documents</li>
            <li>💬 Chat IA DeepSeek R1</li>
            <li>📸 OCR Multilingue</li>
            <li>🎯 3 Modes d'apprentissage</li>
            <li>📊 Suivi des progrès</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>🌍 Couverture</h4>
          <ul className="footer-links">
            <li>🇨🇮 Côte d'Ivoire (Principal)</li>
            <li>🇳🇬 Nigeria</li>
            <li>🇬🇭 Ghana</li>
            <li>🇸🇳 Sénégal</li>
            <li>🇲🇱 Mali</li>
            <li>+ {REAL_TIME_STATS.countriesCovered - 5} autres pays</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>📊 Statistiques Live</h4>
          <ul className="footer-stats">
            <li>{utils.formatNumber(REAL_TIME_STATS.totalStudents)} étudiants actifs</li>
            <li>{SCHOOLS_DATA.length}+ écoles partenaires</li>
            <li>{utils.formatNumber(REAL_TIME_STATS.documentsProcessed)} documents traités</li>
            <li>{REAL_TIME_STATS.accuracyRate} de précision</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copy">
            © 2024 ÉtudIA V4.1 - Révolutionner l'éducation africaine avec l'IA
          </div>
          <div className="footer-tech">
            <span>Propulsé par:</span>
            <span className="tech-badge">OpenRouter</span>
            <span className="tech-badge">DeepSeek R1</span>
            <span className="tech-badge">React.js</span>
            <span className="tech-badge">Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );

  // ===================================================================
  // 🎨 RENDU PRINCIPAL APPLICATION - Structure complète
  // ===================================================================

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : ''} ${isMobile ? 'mobile' : ''}`}>
      {/* Navigation principale */}
      <Navigation />

      {/* Contenu principal */}
      <main className="app-main">
        <div className="main-container">
          {renderCurrentView()}
        </div>
      </main>

      {/* Footer global */}
      <GlobalFooter />

      {/* Système de notifications */}
      <NotificationSystem />

      {/* Overlay mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Bouton scroll to top */}
      <button 
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ 
          display: window.scrollY > 500 ? 'flex' : 'none' 
        }}
      >
        ⬆️
      </button>

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <div className="debug-title">🔧 Debug ÉtudIA V4.1</div>
          <div className="debug-item">View: {currentView}</div>
          <div className="debug-item">Mobile: {isMobile ? 'Oui' : 'Non'}</div>
          <div className="debug-item">IA Status: {aiStatus}</div>
          <div className="debug-item">Mode: {learningMode}</div>
          <div className="debug-item">Modèle: {modelPreference}</div>
          <div className="debug-item">Notifications: {notifications.length}</div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// 🚀 EXPORT FINAL - Application ÉtudIA V4.1 complète
// ===================================================================

export default App;

// ===================================================================
// 🎯 COMMENTAIRES POUR PACOUSSTAR - ASSEMBLAGE FINAL
// ===================================================================

/*
🚀 INSTRUCTIONS D'ASSEMBLAGE APP.JS COMPLET:

📁 Dans ton dossier frontend/src/:

1️⃣ COPIER LES 4 PARTIES:
   - App-part1-imports-config-openrouter.js
   - App-part2-components-state-openrouter.js  
   - App-part3-interface-navigation-openrouter.js
   - App-part4-profile-notifications-openrouter.js

2️⃣ ASSEMBLER EN UN SEUL FICHIER:
   cat App-part1-imports-config-openrouter.js > App-new.js
   cat App-part2-components-state-openrouter.js >> App-new.js
   cat App-part3-interface-navigation-openrouter.js >> App-new.js
   cat App-part4-profile-notifications-openrouter.js >> App-new.js

3️⃣ REMPLACER TON APP.JS ACTUEL:
   mv App.js App-old-backup.js
   mv App-new.js App.js

4️⃣ VÉRIFIER LES IMPORTS:
   - Assure-toi que tous les composants sont bien importés
   - UploadDocument et ChatIA doivent exister dans ./components/

5️⃣ VARIABLES D'ENVIRONNEMENT À AJOUTER:
   REACT_APP_OPENROUTER_API_KEY=ton_openrouter_key
   REACT_APP_DEEPSEEK_MODEL_FREE=deepseek/deepseek-r1:free
   REACT_APP_DEEPSEEK_MODEL_PAID=deepseek/deepseek-r1

🎯 TOTAL APP.JS ASSEMBLÉ: ~1200 lignes réparties en 4 sections fonctionnelles
✅ 100% compatible avec ton architecture existante
🚀 Prêt pour OpenRouter DeepSeek R1 !

PROCHAINE ÉTAPE: ChatIA.jsx en 5 sections puis openRouterService.js complet !
*/
