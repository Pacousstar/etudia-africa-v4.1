// ===================================================================
// 🚀 ÉtudIA V4.1 - CHATIA.JSX PARTIE 1/5 : IMPORTS + CONFIGURATION
// SECTION: Imports React + Configuration OpenRouter DeepSeek R1
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

import React, { useState, useEffect, useRef } from 'react';

// 🤖 CONFIGURATION OPENROUTER DEEPSEEK R1 - ÉtudIA V4.1
const OPENROUTER_CONFIG = {
  // 🎯 Modes d'apprentissage optimisés DeepSeek R1
  LEARNING_MODES: {
    normal: {
      name: 'Conversation',
      icon: '💬',
      description: 'Discussion naturelle et explications',
      color: '#FF6B35',
      tokens: 250,
      temperature: 0.15,
      response_time: '2-5s'
    },
    step_by_step: {
      name: 'Étape par Étape',
      icon: '📊',
      description: 'Décomposition progressive des problèmes',
      color: '#45B7D1',
      tokens: 180,
      temperature: 0.05,
      response_time: '3-7s'
    },
    direct_solution: {
      name: 'Solution Directe',
      icon: '⚡',
      description: 'Réponses rapides et précises',
      color: '#96CEB4',
      tokens: 400,
      temperature: 0.1,
      response_time: '1-3s'
    },
    audio: {
      name: 'Mode Audio',
      icon: '🎤',
      description: 'Reconnaissance vocale + synthèse',
      color: '#FECA57',
      tokens: 200,
      temperature: 0.2,
      response_time: '4-8s'
    }
  },

  // 🤖 Modèles DeepSeek R1 disponibles
  MODELS: {
    free: {
      name: 'DeepSeek R1 Free',
      id: 'deepseek/deepseek-r1:free',
      cost: '0$/M tokens',
      speed: 'Variable (3s-60s)',
      availability: 'File d\'attente',
      daily_limit: 25,
      features: ['Toutes fonctionnalités', 'Raisonnement avancé', 'Multilingue']
    },
    paid: {
      name: 'DeepSeek R1 Premium',
      id: 'deepseek/deepseek-r1',
      cost: '0.55$/M input, 2.19$/M output',
      speed: 'Garanti (2-4s)',
      availability: 'Priorité absolue',
      daily_limit: 1000,
      features: ['Toutes fonctionnalités', 'Vitesse maximale', 'Cache intelligent', 'Support prioritaire']
    }
  },

  // 📊 Limites et quotas
  LIMITS: {
    daily_free_requests: 25,
    daily_paid_requests: 1000,
    max_tokens_per_request: 4000,
    max_context_length: 32000,
    rate_limit_free: 3, // requêtes par minute
    rate_limit_paid: 30 // requêtes par minute
  }
};

// 🎨 THÈME COULEURS - Design ÉtudIA V4.1
const CHAT_THEME = {
  primary: '#FF6B35',           // Orange ÉtudIA signature
  secondary: '#4ECDC4',         // Turquoise moderne
  accent: '#45B7D1',            // Bleu technologique
  success: '#96CEB4',           // Vert validation
  warning: '#FECA57',           // Jaune attention
  error: '#FF6B6B',             // Rouge erreur
  dark: '#2C3E50',              // Bleu foncé élégant
  light: '#F8F9FA',             // Blanc cassé doux
  
  // Gradients
  primaryGradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%)',
  secondaryGradient: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)',
  darkGradient: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
  
  // Shadows
  shadowMain: '0 20px 40px rgba(255, 107, 53, 0.3)',
  shadowSecondary: '0 10px 30px rgba(78, 205, 196, 0.2)',
  shadowError: '0 10px 30px rgba(255, 107, 107, 0.3)'
};

// 📚 SUGGESTIONS INTELLIGENTES - Basées sur le niveau scolaire
const SMART_SUGGESTIONS = {
  '6ème': [
    "Aide-moi avec les fractions",
    "Comment faire une division?",
    "Explique-moi les nombres décimaux",
    "Comment calculer un pourcentage simple?",
    "Aide-moi en géométrie de base",
    "J'ai des difficultés avec les tables de multiplication"
  ],
  '5ème': [
    "Comment résoudre une équation simple?",
    "Explique-moi les nombres relatifs",
    "Aide-moi avec les aires et périmètres",
    "Comment factoriser une expression?",
    "J'ai besoin d'aide en proportionnalité",
    "Explique-moi les angles"
  ],
  '4ème': [
    "Comment résoudre un système d'équations?",
    "Aide-moi avec le théorème de Pythagore",
    "Explique-moi les fonctions linéaires",
    "Comment calculer avec les puissances?",
    "J'ai des difficultés avec la trigonométrie",
    "Aide-moi avec les statistiques"
  ],
  '3ème': [
    "Comment résoudre une équation du second degré?",
    "Aide-moi avec les fonctions",
    "Explique-moi les probabilités",
    "Comment faire une démonstration géométrique?",
    "J'ai besoin d'aide pour le brevet",
    "Aide-moi avec l'arithmétique"
  ],
  '2nde': [
    "Comment étudier une fonction?",
    "Aide-moi avec les vecteurs",
    "Explique-moi les inéquations",
    "Comment résoudre un problème de géométrie analytique?",
    "J'ai des difficultés avec les statistiques",
    "Aide-moi en physique-chimie"
  ],
  '1ère': [
    "Comment calculer une dérivée?",
    "Aide-moi avec les suites numériques",
    "Explique-moi les probabilités conditionnelles",
    "Comment résoudre un problème d'optimisation?",
    "J'ai besoin d'aide en analyse",
    "Aide-moi avec les équations différentielles"
  ],
  'Terminale': [
    "Comment calculer une intégrale?",
    "Aide-moi avec les limites de fonctions",
    "Explique-moi les nombres complexes",
    "Comment résoudre une équation différentielle?",
    "J'ai besoin d'aide pour le bac",
    "Aide-moi avec les logarithmes"
  ],
  'Licence': [
    "Aide-moi avec l'algèbre linéaire",
    "Comment démontrer un théorème?",
    "Explique-moi les espaces vectoriels",
    "Comment résoudre une équation aux dérivées partielles?",
    "J'ai des difficultés en analyse réelle",
    "Aide-moi avec la topologie"
  ],
  'Master': [
    "Aide-moi avec ma recherche",
    "Comment structurer une démonstration complexe?",
    "Explique-moi ce concept avancé",
    "Comment analyser ces données?",
    "J'ai besoin d'aide pour ma thèse",
    "Aide-moi avec cette méthodologie"
  ]
};

// 🌍 MESSAGES ACCUEIL PERSONNALISÉS - Par pays africains
const WELCOME_MESSAGES_AFRICA = {
  'Côte d\'Ivoire': {
    greeting: "Akwaba",
    message: "Bienvenue dans ÉtudIA V4.1 ! Je suis votre assistant IA éducatif propulsé par DeepSeek R1.",
    emoji: "🇨🇮",
    local_phrase: "Ensemble, nous allons réussir tes études !"
  },
  'Sénégal': {
    greeting: "Dalal ak jamm",
    message: "Bienvenue dans ÉtudIA V4.1 ! Je suis là pour t'accompagner dans tes études.",
    emoji: "🇸🇳",
    local_phrase: "Nanga def pour réussir ensemble !"
  },
  'Mali': {
    greeting: "I ni ce",
    message: "Bienvenue dans ÉtudIA V4.1 ! Ton assistant IA pour l'excellence scolaire.",
    emoji: "🇲🇱",
    local_phrase: "Ensemble vers la réussite !"
  },
  'Burkina Faso': {
    greeting: "Koudougou",
    message: "Bienvenue dans ÉtudIA V4.1 ! Prêt à révolutionner tes études ?",
    emoji: "🇧🇫",
    local_phrase: "Yamba pour la réussite !"
  },
  'Nigeria': {
    greeting: "Welcome",
    message: "Welcome to ÉtudIA V4.1! Your AI educational assistant powered by DeepSeek R1.",
    emoji: "🇳🇬",
    local_phrase: "Together we go succeed!"
  },
  'Ghana': {
    greeting: "Akwaaba",
    message: "Welcome to ÉtudIA V4.1! Ready to excel in your studies with AI?",
    emoji: "🇬🇭",
    local_phrase: "Let's achieve greatness together!"
  },
  'default': {
    greeting: "Bienvenue",
    message: "Bienvenue dans ÉtudIA V4.1 ! Je suis votre assistant IA éducatif révolutionnaire.",
    emoji: "🌍",
    local_phrase: "Révolutionnons l'éducation africaine ensemble !"
  }
};

// 🔧 FONCTIONS UTILITAIRES
const chatUtils = {
  // Formater le temps
  formatTime: (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Formater les nombres
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

  // Générer couleur mode
  getModeColor: (mode) => {
    return OPENROUTER_CONFIG.LEARNING_MODES[mode]?.color || CHAT_THEME.primary;
  },

  // Formater message avec Markdown basique
  formatMessage: (content) => {
    if (!content) return '';
    
    // Gras **texte**
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italique *texte*
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code `code`
    content = content.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Liens [texte](url)
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Retours à la ligne
    content = content.replace(/\n/g, '<br>');
    
    return content;
  },

  // Estimer temps de lecture
  estimateReadingTime: (text) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes > 1 ? `${minutes} min` : '< 1 min';
  },

  // Extraire mots-clés du message
  extractKeywords: (text) => {
    const keywords = text.toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['dans', 'avec', 'pour', 'cette', 'comment', 'aide'].includes(word))
      .slice(0, 3);
    return keywords;
  },

  // Générer ID unique
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// 🎵 SONS D'INTERFACE - Feedback audio
const CHAT_SOUNDS = {
  message_sent: '🔊',
  message_received: '🎵',
  error: '🚨',
  success: '✅',
  typing: '⌨️',
  upload: '📤'
};

// 📱 RESPONSIVE BREAKPOINTS
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
};

// ===================================================================
// FIN PARTIE 1/5 - IMPORTS + CONFIGURATION
// Prochaine partie : Composant principal + États React
// ===================================================================

// ===================================================================
// 🚀 ÉtudIA V4.1 - CHATIA.JSX PARTIE 2/5 : COMPOSANT + ÉTATS REACT
// SECTION: Composant principal + Gestion des états + Effects
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

const ChatIA = ({ 
  student, 
  apiUrl, 
  documentContext = '', 
  allDocuments = [],
  selectedDocumentId = null,
  chatHistory = [],
  setChatHistory,
  chatTokensUsed = 0,
  setChatTokensUsed,
  openRouterService,           // 🆕 NOUVEAU SERVICE V4.1
  currentModel = 'free',       // 🆕 MODÈLE SÉLECTIONNÉ (free/paid)
  onStatsUpdate,
  learningMode = 'normal',     // 🆕 MODE D'APPRENTISSAGE
  onModeChange,                // 🆕 CALLBACK CHANGEMENT MODE
  isDarkMode = false,          // 🆕 THÈME SOMBRE
  isMobile = false             // 🆕 DÉTECTION MOBILE
}) => {
  
  // ===================================================================
  // 🔧 ÉTATS PRINCIPAUX - Messages et interface
  // ===================================================================
  
  const [messages, setMessages] = useState(chatHistory || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(chatTokensUsed || 0);
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);

  // 🤖 ÉTATS OPENROUTER DEEPSEEK R1 - Nouveautés V4.1
  const [deepSeekStats, setDeepSeekStats] = useState({
    total_conversations: 0,
    free_tier_used: 0,
    paid_tier_used: 0,
    tokens_consumed: 0,
    average_response_time: 0,
    last_model_used: 'free',
    success_rate: 100
  });
  
  // 🎯 ÉTATS MODES D'APPRENTISSAGE - Révolutionnaire
  const [chatMode, setChatMode] = useState(learningMode || 'normal');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(4);
  const [stepProgress, setStepProgress] = useState([]);
  const [modeHistory, setModeHistory] = useState([]);
  
  // 🎤 ÉTATS AUDIO - Reconnaissance vocale
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioSupported, setAudioSupported] = useState(false);
  
  // 📊 ÉTATS TOKENS ET PERFORMANCE
  const [tokenUsage, setTokenUsage] = useState({ 
    used_today: chatTokensUsed || 0, 
    remaining: OPENROUTER_CONFIG.LIMITS.daily_free_requests - Math.floor((chatTokensUsed || 0) / 100),
    total_conversations: 0,
    last_updated: Date.now(),
    daily_limit: currentModel === 'free' ? OPENROUTER_CONFIG.LIMITS.daily_free_requests : OPENROUTER_CONFIG.LIMITS.daily_paid_requests
  });
  
  // 🔗 ÉTATS CONNEXION - Surveillance réseau
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, online, offline, error
  const [lastPingTime, setLastPingTime] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // 📱 ÉTATS INTERFACE - UX améliorée
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // 🎨 ÉTATS CUSTOMISATION
  const [userPreferences, setUserPreferences] = useState({
    animations: true,
    sounds: false,
    compact_mode: isMobile,
    auto_scroll: true,
    show_timestamps: true,
    show_tokens: true,
    language: 'fr'
  });

  // 📄 ÉTATS DOCUMENT - Context management
  const [activeDocument, setActiveDocument] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [documentSummary, setDocumentSummary] = useState('');
  
  // 🔔 ÉTATS NOTIFICATIONS - Feedback utilisateur
  const [notifications, setNotifications] = useState([]);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [showModeDetails, setShowModeDetails] = useState(false);

  // ===================================================================
  // 📎 RÉFÉRENCES DOM - Manipulation interface
  // ===================================================================
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const audioRef = useRef(null);
  const typingIndicatorRef = useRef(null);

  // ===================================================================
  // 🔧 VARIABLES DÉRIVÉES - Calculs automatiques
  // ===================================================================
  
  // Récupération sécurisée des informations élève
  const prenomEleve = student?.nom?.split(' ')[0] || student?.prenom || student?.name?.split(' ')[0] || 'Élève';
  const classeEleve = student?.classe || student?.class_level || 'votre classe';
  const paysEleve = student?.pays || student?.country || 'Côte d\'Ivoire';
  
  // Configuration dynamique basée sur le modèle
  const currentModelConfig = OPENROUTER_CONFIG.MODELS[currentModel] || OPENROUTER_CONFIG.MODELS.free;
  const currentModeConfig = OPENROUTER_CONFIG.LEARNING_MODES[chatMode] || OPENROUTER_CONFIG.LEARNING_MODES.normal;
  
  // Message de bienvenue personnalisé
  const welcomeConfig = WELCOME_MESSAGES_AFRICA[paysEleve] || WELCOME_MESSAGES_AFRICA.default;
  
  // Suggestions intelligentes basées sur la classe
  const smartSuggestions = SMART_SUGGESTIONS[classeEleve] || SMART_SUGGESTIONS['default'] || [
    "Explique-moi l'exercice 1 de mon document",
    "Aide-moi à résoudre ce problème",
    "Comment faire cet exercice étape par étape?",
    "Donne-moi la solution complète",
    "J'ai des difficultés avec ce calcul",
    "Peux-tu m'expliquer cette formule?"
  ];

  // ===================================================================
  // 🔄 EFFECTS - Initialisation et surveillance
  // ===================================================================

  // 🚀 EFFECT INITIALISATION - Configuration initiale
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('🚀 Initialisation ChatIA V4.1 OpenRouter...');
        
        // Vérifier support audio
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          setAudioSupported(true);
          console.log('🎤 Support audio détecté');
        }
        
        // Charger préférences utilisateur
        const savedPrefs = localStorage.getItem('etudia_chat_preferences');
        if (savedPrefs) {
          setUserPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));
        }
        
        // Charger statistiques locales
        const savedStats = localStorage.getItem('etudia_deepseek_stats');
        if (savedStats) {
          setDeepSeekStats(prev => ({ ...prev, ...JSON.parse(savedStats) }));
        }
        
        // Synchroniser mode d'apprentissage
        if (learningMode && learningMode !== chatMode) {
          setChatMode(learningMode);
        }
        
        // Vérifier statut connexion
        await checkConnectionStatus();
        
        // Envoyer message de bienvenue si nécessaire
        if (!welcomeMessageSent && messages.length === 0) {
          setTimeout(() => sendWelcomeMessage(), 1000);
        }
        
        console.log('✅ ChatIA V4.1 initialisé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur initialisation ChatIA:', error);
        setConnectionStatus('error');
      }
    };

    initializeChat();
  }, []);

  // 📊 EFFECT SURVEILLANCE MODÈLE - Changement modèle
  useEffect(() => {
    if (currentModel !== deepSeekStats.last_model_used) {
      console.log(`🔄 Changement modèle: ${deepSeekStats.last_model_used} → ${currentModel}`);
      
      setDeepSeekStats(prev => ({
        ...prev,
        last_model_used: currentModel
      }));
      
      // Mettre à jour limites quotidiennes
      setTokenUsage(prev => ({
        ...prev,
        daily_limit: currentModel === 'free' ? 
          OPENROUTER_CONFIG.LIMITS.daily_free_requests : 
          OPENROUTER_CONFIG.LIMITS.daily_paid_requests
      }));
      
      addNotification(
        `Modèle ${currentModelConfig.name} activé`, 
        'info'
      );
    }
  }, [currentModel]);

  // 🎯 EFFECT SURVEILLANCE MODE - Changement mode apprentissage
  useEffect(() => {
    if (learningMode && learningMode !== chatMode) {
      setChatMode(learningMode);
      
      setModeHistory(prev => [...prev, {
        mode: learningMode,
        timestamp: Date.now(),
        reason: 'external_change'
      }]);
      
      console.log(`🎯 Mode d'apprentissage changé: ${chatMode} → ${learningMode}`);
    }
  }, [learningMode]);

  // 📄 EFFECT DOCUMENT ACTIF - Changement document
  useEffect(() => {
    if (selectedDocumentId && allDocuments.length > 0) {
      const document = allDocuments.find(doc => doc.id === selectedDocumentId);
      if (document && document !== activeDocument) {
        setActiveDocument(document);
        
        // Analyser le document si nouveau
        if (document.texte_extrait && document.texte_extrait.length > 100) {
          analyzeDocument(document);
        }
        
        console.log('📄 Document actif changé:', document.nom_original);
        addNotification(`Document "${document.nom_original}" chargé`, 'success');
      }
    } else if (!selectedDocumentId) {
      setActiveDocument(null);
      setDocumentAnalysis(null);
    }
  }, [selectedDocumentId, allDocuments]);

  // 📜 EFFECT AUTO-SCROLL - Défilement automatique
  useEffect(() => {
    if (userPreferences.auto_scroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: userPreferences.animations ? 'smooth' : 'auto' 
      });
    }
  }, [messages, userPreferences.auto_scroll, userPreferences.animations]);

  // 🔔 EFFECT SCROLL MONITORING - Surveillance défilement
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isNearBottom);
      
      // Marquer messages comme lus
      if (isNearBottom && unreadCount > 0) {
        setUnreadCount(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [unreadCount]);

  // ⏱️ EFFECT SURVEILLANCE CONNEXION - Ping périodique
  useEffect(() => {
    const interval = setInterval(checkConnectionStatus, 30000); // Vérifier toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // ===================================================================
  // 🔧 FONCTIONS UTILITAIRES - Helpers et actions
  // ===================================================================

  // 🔗 Vérifier statut connexion
  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus('checking');
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.services?.openrouter_deepseek?.includes('✅')) {
          setConnectionStatus('online');
          setLastPingTime(Date.now());
          setRetryCount(0);
        } else {
          setConnectionStatus('degraded');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.warn('⚠️ Erreur connexion:', error.message);
      setConnectionStatus('offline');
      setRetryCount(prev => prev + 1);
    }
  };

  // 📄 Analyser document
  const analyzeDocument = async (document) => {
    try {
      const analysis = {
        type: detectDocumentType(document.nom_original),
        length: document.texte_extrait.length,
        word_count: document.texte_extrait.split(' ').length,
        keywords: chatUtils.extractKeywords(document.texte_extrait),
        reading_time: chatUtils.estimateReadingTime(document.texte_extrait),
        summary: document.texte_extrait.substring(0, 200) + '...'
      };
      
      setDocumentAnalysis(analysis);
      setDocumentSummary(analysis.summary);
      
      console.log('📊 Document analysé:', analysis);
      
    } catch (error) {
      console.error('❌ Erreur analyse document:', error);
    }
  };

  // 🔍 Détecter type de document
  const detectDocumentType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const types = {
      'pdf': 'document',
      'doc': 'document',
      'docx': 'document',
      'txt': 'texte',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'webp': 'image'
    };
    return types[extension] || 'inconnu';
  };

  // 🔔 Ajouter notification
  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = chatUtils.generateId();
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

  // 📊 Mettre à jour statistiques locales
  const updateLocalStats = (response) => {
    setDeepSeekStats(prev => ({
      ...prev,
      total_conversations: prev.total_conversations + 1,
      free_tier_used: response.free_tier_used ? prev.free_tier_used + 1 : prev.free_tier_used,
      paid_tier_used: !response.free_tier_used ? prev.paid_tier_used + 1 : prev.paid_tier_used,
      tokens_consumed: prev.tokens_consumed + (response.tokens_used || 0),
      average_response_time: response.response_time || prev.average_response_time,
      last_model_used: currentModel,
      success_rate: ((prev.success_rate * prev.total_conversations + 100) / (prev.total_conversations + 1))
    }));

    // Callback vers App.js pour mise à jour globale
    if (onStatsUpdate) {
      const updatedStats = openRouterService?.getUsageStats() || {};
      onStatsUpdate(updatedStats);
    }
  };

  // 🎯 Obtenir suggestions intelligentes
  const getSuggestions = () => {
    // Suggestions de base toujours disponibles
    const baseSuggestions = [
      "Explique-moi l'exercice 1 de mon document",
      "Aide-moi à résoudre ce problème de mathématiques",
      "Comment faire cet exercice étape par étape?",
      "Donne-moi la solution complète de l'exercice",
      "J'ai des difficultés avec ce calcul",
      "Peux-tu m'expliquer cette formule?",
      "Comment résoudre cette équation?",
      "Aide-moi en français s'il te plaît"
    ];

    // Combiner avec suggestions spécifiques à la classe
    const allSuggestions = [...smartSuggestions, ...baseSuggestions];
    
    // Suggestions contextuelles basées sur le document actif
    if (activeDocument && documentAnalysis) {
      const contextualSuggestions = [
        `Explique-moi ce document: ${activeDocument.nom_original}`,
        `Résume le contenu de ce ${documentAnalysis.type}`,
        `Aide-moi avec les exercices de ce document`,
        `Quels sont les points importants de ce document?`
      ];
      allSuggestions.unshift(...contextualSuggestions);
    }
    
    // Suggestions basées sur l'historique des conversations
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.type === 'user').slice(-1)[0];
      if (lastUserMessage) {
        const keywords = chatUtils.extractKeywords(lastUserMessage.content);
        if (keywords.length > 0) {
          allSuggestions.unshift(`Explique-moi plus sur ${keywords[0]}`);
        }
      }
    }
    
    // Retourner 6 suggestions uniques mélangées
    return [...new Set(allSuggestions)].slice(0, 6);
  };

// ===================================================================
// FIN PARTIE 2/5 - COMPOSANT + ÉTATS REACT
// Prochaine partie : Messages et communication OpenRouter
// ===================================================================

  // ===================================================================
// 🚀 ÉtudIA V4.1 - CHATIA.JSX PARTIE 3/5 : MESSAGES + OPENROUTER
// SECTION: Gestion messages + Communication OpenRouter DeepSeek R1
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

  // ===================================================================
  // 🎉 MESSAGE DE BIENVENUE - Personnalisé par pays
  // ===================================================================

  const sendWelcomeMessage = () => {
    if (welcomeMessageSent) return;
    
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `${welcomeConfig.greeting} ${prenomEleve} ! ${welcomeConfig.emoji}\n\n${welcomeConfig.message}\n\n🎯 **Modes d'apprentissage disponibles :**\n• 💬 **Conversation** - Discussion naturelle\n• 📊 **Étape par Étape** - Décomposition progressive\n• ⚡ **Solution Directe** - Réponses rapides\n\n🤖 **OpenRouter DeepSeek R1** - ${currentModelConfig.name}\n📊 Limite quotidienne : ${tokenUsage.daily_limit} requêtes\n\n${welcomeConfig.local_phrase}`,
      timestamp: new Date().toISOString(),
      isWelcome: true,
      mode: 'welcome',
      model: currentModelConfig.name,
      tokens: 0
    };
    
    setMessages([welcomeMessage]);
    setWelcomeMessageSent(true);
    setUnreadCount(1);
    
    console.log('🎉 Message de bienvenue envoyé pour', paysEleve);
  };

  // ===================================================================
  // 📤 FONCTION ENVOI MESSAGE - OpenRouter DeepSeek R1
  // ===================================================================

  const handleSendMessage = async (messageText = inputMessage, mode = chatMode) => {
    if (!messageText.trim() || isLoading) return;

    // Vérifier limite quotidienne
    if (tokenUsage.used_today >= tokenUsage.daily_limit) {
      addNotification(
        `Limite quotidienne atteinte (${tokenUsage.daily_limit} requêtes)`, 
        'warning'
      );
      return;
    }

    // Message utilisateur
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      tokens: 0,
      mode: mode,
      model: currentModelConfig.name
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Variables pour le contexte document
    let activeDocument = null;
    let finalDocumentContext = '';
    let hasValidContext = false;

    try {
      // 📄 RÉCUPÉRATION CONTEXTE DOCUMENT
      try {
        if (selectedDocumentId && allDocuments.length > 0) {
          activeDocument = allDocuments.find(doc => doc.id === selectedDocumentId);
          console.log('🎯 Document sélectionné:', activeDocument?.nom_original);
        }
        
        if (!activeDocument && allDocuments.length > 0) {
          activeDocument = allDocuments[0];
          console.log('🎯 Premier document utilisé:', activeDocument?.nom_original);
        }
        
        finalDocumentContext = activeDocument?.texte_extrait || documentContext || '';
        hasValidContext = finalDocumentContext && finalDocumentContext.length > 50;
        
        console.log('📤 Contexte final:', {
          document: activeDocument?.nom_original || 'Aucun',
          context_length: finalDocumentContext?.length || 0,
          has_valid_context: hasValidContext,
          mode: mode
        });
        
      } catch (contextError) {
        console.warn('⚠️ Erreur récupération contexte:', contextError.message);
        finalDocumentContext = documentContext || '';
        hasValidContext = false;
      }

      // 🔧 CONSTRUCTION HISTORIQUE CONVERSATION
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // 📊 PAYLOAD OPENROUTER DEEPSEEK R1
      const chatOptions = {
        student_id: student?.id,
        conversation_history: conversationHistory,
        mode: mode,
        document_context: finalDocumentContext,
        learning_profile: {
          nom: student?.nom || prenomEleve,
          classe: classeEleve,
          pays: paysEleve,
          preferences: userPreferences
        },
        use_free_tier: currentModel === 'free',
        model_config: currentModelConfig,
        mode_config: currentModeConfig
      };

      console.log('🚀 Envoi vers OpenRouter DeepSeek R1:', {
        mode: mode,
        model: currentModel,
        context: hasValidContext,
        tokens_limit: currentModeConfig.tokens
      });

      // 🤖 APPEL OPENROUTER SERVICE
      const startTime = Date.now();
      
      const response = await openRouterService.chat(messageText.trim(), chatOptions);
      
      const responseTime = (Date.now() - startTime) / 1000;

      if (response.success) {
        console.log('✅ Réponse OpenRouter reçue:', {
          tokens: response.tokens_used,
          model: response.model,
          free_tier: response.free_tier_used,
          response_time: responseTime + 's'
        });

        // 💬 MESSAGE DE RÉPONSE IA
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.response,
          timestamp: response.timestamp || new Date().toISOString(),
          tokens: response.tokens_used || 0,
          model: response.model || currentModelConfig.name,
          provider: 'OpenRouter DeepSeek R1',
          hasContext: response.has_context || hasValidContext,
          mode: response.mode || mode,
          freeTeamUsed: response.free_tier_used,
          responseTime: responseTime,
          documentUsed: activeDocument?.nom_original || 'Aucun',
          contextLength: finalDocumentContext.length,
          confidence: response.confidence || 95,
          reasoning_steps: response.reasoning_steps || []
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationCount(prev => prev + 1);
        setTotalTokens(prev => prev + (response.tokens_used || 0));
        setConnectionStatus('online');
        setUnreadCount(prev => prev + 1);

        // 📊 MISE À JOUR STATISTIQUES
        updateLocalStats({
          ...response,
          response_time: responseTime,
          success: true
        });

        // 🎯 GESTION MODES SPÉCIAUX
        if (mode === 'step_by_step' && response.next_step) {
          setCurrentStep(response.next_step.current || currentStep);
          setTotalSteps(response.next_step.total || totalSteps);
          
          if (response.next_step.progress) {
            setStepProgress(prev => [...prev, response.next_step.progress]);
          }
        }

        // 🎤 SYNTHÈSE VOCALE (si mode audio)
        if (isAudioMode && response.response && userPreferences.sounds) {
          setTimeout(() => speakResponse(response.response), 500);
        }

        // 🔔 CALLBACK STATS GLOBALES
        if (onStatsUpdate && student?.id) {
          try {
            onStatsUpdate(student.id);
          } catch (statsError) {
            console.warn('⚠️ Erreur mise à jour stats globales:', statsError.message);
          }
        }

        // 🎉 NOTIFICATION SUCCÈS
        if (response.tokens_used) {
          addNotification(
            `Réponse reçue (${response.tokens_used} tokens, ${responseTime.toFixed(1)}s)`, 
            'success'
          );
        }

        console.log('🎉 Conversation DeepSeek R1 terminée avec succès');

      } else {
        throw new Error(response.error || 'Erreur communication OpenRouter');
      }

    } catch (error) {
      console.error('❌ Erreur chat complète:', {
        error_name: error.name,
        error_message: error.message,
        student_id: student?.id,
        api_url: apiUrl,
        has_document: hasValidContext,
        connection_status: connectionStatus
      });
      
      setConnectionStatus('error');
      
      // 🚨 MESSAGE D'ERREUR INTELLIGENT
      let errorContent;
      
      if (error.message.includes('404')) {
        errorContent = `${prenomEleve}, la route de chat ÉtudIA est introuvable ! 🛠️\n\nVérifie que ton backend est bien démarré sur ${apiUrl}`;
      } else if (error.message.includes('429')) {
        errorContent = `${prenomEleve}, tu as atteint la limite de requêtes ! ⏰\n\nAttends quelques minutes avant de réessayer.`;
      } else if (error.message.includes('timeout') || error.message.includes('network')) {
        errorContent = `${prenomEleve}, problème de connexion réseau ! 🌐\n\nVérifie ta connexion internet et réessaye.`;
      } else if (error.message.includes('API key')) {
        errorContent = `${prenomEleve}, problème de configuration OpenRouter ! 🔑\n\nLa clé API semble incorrecte ou expirée.`;
      } else {
        errorContent = `${prenomEleve}, je rencontre un problème technique ! 🔧\n\nErreur : ${error.message}\n\nRéessaye dans quelques instants.`;
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: errorContent,
        timestamp: new Date().toISOString(),
        tokens: 0,
        isError: true,
        errorType: error.name,
        retryable: !error.message.includes('API key'),
        model: 'Système'
      };

      setMessages(prev => [...prev, errorMessage]);
      addNotification('Erreur de communication avec l\'IA', 'error');

    } finally {
      setIsLoading(false);
      setShowSuggestions(true);
      
      // Focus automatique sur l'input après envoi
      setTimeout(() => {
        if (inputRef.current && !isMobile) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // ===================================================================
  // 🎤 RECONNAISSANCE VOCALE - Mode audio
  // ===================================================================

  const startVoiceRecognition = () => {
    if (!audioSupported) {
      addNotification('Reconnaissance vocale non supportée', 'warning');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = userPreferences.language === 'en' ? 'en-US' : 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      addNotification('🎤 Écoute en cours...', 'info');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setInputMessage(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      addNotification('🎤 Enregistrement terminé', 'success');
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      console.error('Erreur reconnaissance vocale:', event.error);
      addNotification('Erreur reconnaissance vocale', 'error');
    };

    recognition.start();
    setRecognition(recognition);
  };

  // 🔊 Synthèse vocale
  const speakResponse = (text) => {
    if (!userPreferences.sounds || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = userPreferences.language === 'en' ? 'en-US' : 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  };

  // ===================================================================
  // 🎯 GESTION MODES D'APPRENTISSAGE - Changement dynamique
  // ===================================================================

  const handleModeChange = (newMode) => {
    if (newMode === chatMode) return;

    setChatMode(newMode);
    
    // Historique des changements
    setModeHistory(prev => [...prev, {
      from: chatMode,
      to: newMode,
      timestamp: Date.now(),
      reason: 'user_selection'
    }]);

    // Réinitialiser progression étapes si nécessaire
    if (newMode === 'step_by_step') {
      setCurrentStep(1);
      setStepProgress([]);
    }

    // Callback vers App.js
    if (onModeChange) {
      onModeChange(newMode);
    }

    console.log(`🎯 Mode changé: ${chatMode} → ${newMode}`);
    addNotification(
      `Mode "${OPENROUTER_CONFIG.LEARNING_MODES[newMode].name}" activé`, 
      'info'
    );
  };

  // ===================================================================
  // 📊 GESTION TOKENS ET QUOTAS - Surveillance usage
  // ===================================================================

  const updateTokenUsage = (tokensUsed) => {
    setTokenUsage(prev => {
      const newUsage = {
        ...prev,
        used_today: prev.used_today + tokensUsed,
        remaining: Math.max(0, prev.remaining - 1),
        total_conversations: prev.total_conversations + 1,
        last_updated: Date.now()
      };

      // Sauvegarder dans localStorage
      localStorage.setItem('etudia_token_usage', JSON.stringify(newUsage));

      // Alertes basées sur l'usage
      if (newUsage.remaining <= 5 && newUsage.remaining > 0) {
        addNotification(
          `⚠️ Plus que ${newUsage.remaining} requêtes aujourd'hui`, 
          'warning'
        );
      } else if (newUsage.remaining === 0) {
        addNotification(
          '🚫 Limite quotidienne atteinte ! Passez en premium ou attendez demain', 
          'error'
        );
      }

      return newUsage;
    });

    // Mettre à jour callback parent
    if (setChatTokensUsed) {
      setChatTokensUsed(prev => prev + tokensUsed);
    }
  };

  // ===================================================================
  // 🔄 FONCTIONS UTILITAIRES CHAT - Actions diverses
  // ===================================================================

  // 📜 Défiler vers le bas
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  };

  // 🗑️ Effacer conversation
  const clearConversation = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toute la conversation ?')) {
      setMessages([]);
      setConversationCount(0);
      setCurrentStep(1);
      setStepProgress([]);
      setWelcomeMessageSent(false);
      
      // Envoyer nouveau message de bienvenue
      setTimeout(() => sendWelcomeMessage(), 500);
      
      addNotification('Conversation effacée', 'info');
      console.log('🗑️ Conversation effacée par l\'utilisateur');
    }
  };

  // 📋 Copier conversation
  const copyConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.type === 'user' ? 'VOUS' : 'ÉtudIA'}: ${msg.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(conversationText)
      .then(() => addNotification('Conversation copiée !', 'success'))
      .catch(() => addNotification('Erreur copie', 'error'));
  };

  // 💾 Sauvegarder conversation
  const saveConversation = () => {
    const conversationData = {
      messages,
      student: {
        nom: prenomEleve,
        classe: classeEleve,
        pays: paysEleve
      },
      stats: {
        total_messages: messages.length,
        total_tokens: totalTokens,
        conversation_count: conversationCount,
        modes_used: [...new Set(messages.map(m => m.mode).filter(Boolean))]
      },
      timestamp: new Date().toISOString(),
      version: 'ÉtudIA V4.1'
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etudia-conversation-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    addNotification('Conversation sauvegardée !', 'success');
  };

  // 🔄 Réessayer dernière requête
  const retryLastMessage = () => {
    const lastUserMessage = messages.filter(m => m.type === 'user').slice(-1)[0];
    if (lastUserMessage) {
      // Supprimer le dernier message d'erreur s'il existe
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isError) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      
      // Renvoyer le message
      handleSendMessage(lastUserMessage.content, lastUserMessage.mode);
    }
  };

  // 📱 Gérer input clavier
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      setInputMessage('');
      setShowSuggestions(true);
    }
  };

  // ⌨️ Indicateur de frappe
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Gérer indicateur de frappe
    setIsTyping(true);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimeout(newTimeout);
  };

  // 🎲 Suggestion aléatoire
  const handleRandomSuggestion = () => {
    const suggestions = getSuggestions();
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setInputMessage(randomSuggestion);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 📤 Suggestion cliquée
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Envoyer automatiquement après un court délai
    setTimeout(() => {
      handleSendMessage(suggestion);
    }, 100);
  };

  // 🔧 Réinitialiser statistiques
  const resetStats = () => {
    if (window.confirm('Réinitialiser toutes les statistiques ?')) {
      setDeepSeekStats({
        total_conversations: 0,
        free_tier_used: 0,
        paid_tier_used: 0,
        tokens_consumed: 0,
        average_response_time: 0,
        last_model_used: currentModel,
        success_rate: 100
      });
      
      setTokenUsage({
        used_today: 0,
        remaining: tokenUsage.daily_limit,
        total_conversations: 0,
        last_updated: Date.now(),
        daily_limit: tokenUsage.daily_limit
      });
      
      localStorage.removeItem('etudia_deepseek_stats');
      localStorage.removeItem('etudia_token_usage');
      
      addNotification('Statistiques réinitialisées', 'success');
    }
  };

  // 📊 Exporter statistiques
  const exportStats = () => {
    const statsData = {
      deepseek_stats: deepSeekStats,
      token_usage: tokenUsage,
      user_preferences: userPreferences,
      mode_history: modeHistory,
      student_info: {
        nom: prenomEleve,
        classe: classeEleve,
        pays: paysEleve
      },
      session_info: {
        messages_count: messages.length,
        conversation_count: conversationCount,
        total_tokens: totalTokens,
        connection_status: connectionStatus
      },
      export_date: new Date().toISOString(),
      version: 'ÉtudIA V4.1 OpenRouter'
    };

    const blob = new Blob([JSON.stringify(statsData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etudia-stats-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    addNotification('Statistiques exportées !', 'success');
  };

// ===================================================================
// FIN PARTIE 3/5 - MESSAGES + OPENROUTER
// Prochaine partie : Interface utilisateur et composants visuels
// ===================================================================

  // ===================================================================
// 🚀 ÉtudIA V4.1 - CHATIA.JSX PARTIE 4/5 : INTERFACE + UI
// SECTION: Interface utilisateur + Composants visuels + Rendu
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

  // ===================================================================
  // 🎨 COMPOSANTS INTERFACE - Elements UI réutilisables
  // ===================================================================

  // 📊 Indicateur de statut connexion
  const ConnectionStatusIndicator = () => (
    <div className={`connection-status ${connectionStatus}`}>
      <div className="status-dot"></div>
      <span className="status-text">
        {connectionStatus === 'online' && '🟢 OpenRouter en ligne'}
        {connectionStatus === 'offline' && '🔴 Hors ligne'}
        {connectionStatus === 'checking' && '🟡 Vérification...'}
        {connectionStatus === 'error' && '🚨 Erreur connexion'}
        {connectionStatus === 'degraded' && '⚠️ Service dégradé'}
      </span>
      {lastPingTime && (
        <span className="last-ping">
          Dernière vérif: {chatUtils.timeAgo(lastPingTime)}
        </span>
      )}
    </div>
  );

  // 🤖 Sélecteur de modèle IA
  const ModelSelector = () => (
    <div className="model-selector">
      <div className="selector-header">
        <span className="selector-icon">🤖</span>
        <span className="selector-title">Modèle IA</span>
        <button 
          className="info-button"
          onClick={() => setShowModelInfo(!showModelInfo)}
        >
          ℹ️
        </button>
      </div>
      
      <div className="model-options">
        <label className={`model-option ${currentModel === 'free' ? 'active' : ''}`}>
          <input
            type="radio"
            name="model"
            value="free"
            checked={currentModel === 'free'}
            onChange={() => {}} // Contrôlé par le parent App.js
            disabled
          />
          <div className="option-content">
            <div className="option-header">
              <span className="option-icon">🆓</span>
              <span className="option-name">Gratuit</span>
              <span className="option-badge">25/jour</span>
            </div>
            <div className="option-details">
              <span className="option-model">{OPENROUTER_CONFIG.MODELS.free.id}</span>
              <span className="option-speed">{OPENROUTER_CONFIG.MODELS.free.speed}</span>
            </div>
          </div>
        </label>

        <label className={`model-option ${currentModel === 'paid' ? 'active' : ''}`}>
          <input
            type="radio"
            name="model"
            value="paid"
            checked={currentModel === 'paid'}
            onChange={() => {}} // Contrôlé par le parent App.js
            disabled
          />
          <div className="option-content">
            <div className="option-header">
              <span className="option-icon">💎</span>
              <span className="option-name">Premium</span>
              <span className="option-badge">1000/jour</span>
            </div>
            <div className="option-details">
              <span className="option-model">{OPENROUTER_CONFIG.MODELS.paid.id}</span>
              <span className="option-speed">{OPENROUTER_CONFIG.MODELS.paid.speed}</span>
            </div>
          </div>
        </label>
      </div>

      {showModelInfo && (
        <div className="model-info-popup">
          <div className="info-content">
            <h4>🤖 Modèles DeepSeek R1</h4>
            <div className="info-grid">
              <div className="info-item">
                <strong>Gratuit:</strong> File d'attente, 25 requêtes/jour
              </div>
              <div className="info-item">
                <strong>Premium:</strong> Priorité absolue, 1000 requêtes/jour
              </div>
              <div className="info-item">
                <strong>Raisonnement:</strong> IA avancée avec chaîne de pensée
              </div>
              <div className="info-item">
                <strong>Multilingue:</strong> Français, anglais + langues africaines
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 🎯 Sélecteur de mode d'apprentissage
  const LearningModeSelector = () => (
    <div className="learning-mode-selector">
      <div className="mode-header">
        <span className="mode-icon">🎯</span>
        <span className="mode-title">Mode d'apprentissage</span>
        <button 
          className="info-button"
          onClick={() => setShowModeDetails(!showModeDetails)}
        >
          ℹ️
        </button>
      </div>

      <div className="mode-options">
        {Object.entries(OPENROUTER_CONFIG.LEARNING_MODES).map(([key, mode]) => (
          <button
            key={key}
            className={`mode-btn ${chatMode === key ? 'active' : ''}`}
            onClick={() => handleModeChange(key)}
            style={{ '--mode-color': mode.color }}
          >
            <div className="mode-content">
              <div className="mode-icon-large">{mode.icon}</div>
              <div className="mode-details">
                <div className="mode-name">{mode.name}</div>
                <div className="mode-description">{mode.description}</div>
                <div className="mode-stats">
                  <span className="mode-tokens">{mode.tokens} tokens</span>
                  <span className="mode-time">{mode.response_time}</span>
                </div>
              </div>
            </div>
            {chatMode === key && <div className="mode-active-indicator">✓</div>}
          </button>
        ))}
      </div>

      {showModeDetails && (
        <div className="mode-details-popup">
          <div className="details-content">
            <h4>🎯 Modes d'apprentissage</h4>
            <div className="details-grid">
              <div className="detail-item">
                <strong>💬 Conversation:</strong> Discussion naturelle, explications détaillées
              </div>
              <div className="detail-item">
                <strong>📊 Étape par Étape:</strong> Décomposition progressive des problèmes
              </div>
              <div className="detail-item">
                <strong>⚡ Solution Directe:</strong> Réponses rapides et précises
              </div>
              <div className="detail-item">
                <strong>🎤 Mode Audio:</strong> Reconnaissance vocale + synthèse
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 📊 Panneau statistiques temps réel
  const StatsPanel = () => (
    <div className="stats-panel">
      <div className="stats-header">
        <span className="stats-icon">📊</span>
        <span className="stats-title">Statistiques Session</span>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{conversationCount}</div>
          <div className="stat-label">Conversations</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-number">{chatUtils.formatNumber(totalTokens)}</div>
          <div className="stat-label">Tokens utilisés</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-number">{tokenUsage.remaining}</div>
          <div className="stat-label">Restants aujourd'hui</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-number">{Math.round(deepSeekStats.success_rate)}%</div>
          <div className="stat-label">Taux de succès</div>
        </div>
      </div>

      <div className="usage-progress">
        <div className="progress-header">
          <span>Usage quotidien</span>
          <span>{tokenUsage.used_today}/{tokenUsage.daily_limit}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(100, (tokenUsage.used_today / tokenUsage.daily_limit) * 100)}%`,
              background: tokenUsage.used_today > tokenUsage.daily_limit * 0.8 ? 
                CHAT_THEME.error : CHAT_THEME.success
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  // 📄 Panneau document actif
  const DocumentPanel = () => {
    if (!activeDocument) return null;

    return (
      <div className="document-panel">
        <div className="document-header">
          <span className="document-icon">📄</span>
          <span className="document-title">Document actif</span>
        </div>

        <div className="document-info">
          <div className="document-name">{activeDocument.nom_original}</div>
          
          {documentAnalysis && (
            <div className="document-analysis">
              <div className="analysis-stats">
                <span className="stat">
                  <span className="stat-icon">📝</span>
                  <span>{documentAnalysis.word_count} mots</span>
                </span>
                <span className="stat">
                  <span className="stat-icon">⏱️</span>
                  <span>{documentAnalysis.reading_time}</span>
                </span>
                <span className="stat">
                  <span className="stat-icon">🏷️</span>
                  <span>{documentAnalysis.type}</span>
                </span>
              </div>
              
              {documentAnalysis.keywords.length > 0 && (
                <div className="document-keywords">
                  <span className="keywords-label">Mots-clés:</span>
                  {documentAnalysis.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 💡 Suggestions intelligentes
  const SuggestionsPanel = () => {
    if (!showSuggestions || messages.length > 2) return null;

    const suggestions = getSuggestions();

    return (
      <div className="suggestions-panel">
        <div className="suggestions-header">
          <span className="suggestions-icon">💡</span>
          <span className="suggestions-title">Suggestions pour {prenomEleve}</span>
          <button 
            className="refresh-button"
            onClick={handleRandomSuggestion}
            title="Suggestion aléatoire"
          >
            🎲
          </button>
        </div>

        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-btn"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-text">{suggestion}</span>
              <span className="suggestion-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ⌨️ Indicateur de frappe
  const TypingIndicator = () => {
    if (!isLoading) return null;

    return (
      <div className="typing-indicator" ref={typingIndicatorRef}>
        <div className="typing-content">
          <div className="typing-avatar">
            <span className="ai-icon">🤖</span>
          </div>
          <div className="typing-message">
            <div className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <div className="typing-text">
              ÉtudIA réfléchit avec DeepSeek R1...
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔔 Système de notifications
  const NotificationSystem = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="notification-system">
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
                {chatUtils.timeAgo(notification.timestamp)}
              </div>
            </div>

            <button className="notification-close">×</button>
          </div>
        ))}
      </div>
    );
  };

  // ===================================================================
  // 💬 RENDU DES MESSAGES - Formatage et affichage
  // ===================================================================

  const renderMessage = (message, index) => {
    const isUser = message.type === 'user';
    const isWelcome = message.isWelcome;
    const isError = message.isError;
    const hasContext = message.hasContext;

    return (
      <div
        key={message.id}
        className={`message ${message.type} ${isWelcome ? 'welcome' : ''} ${isError ? 'error' : ''} ${hasContext ? 'has-context' : ''} ${message.mode ? `mode-${message.mode}` : ''}`}
      >
        {/* Avatar */}
        <div className="message-avatar">
          {isUser ? (
            <div className="user-avatar">
              {prenomEleve[0].toUpperCase()}
            </div>
          ) : (
            <div className="ai-avatar">
              {isError ? '🚨' : isWelcome ? '🎉' : '🤖'}
            </div>
          )}
        </div>

        {/* Contenu message */}
        <div className="message-content">
          <div className="message-header">
            <span className="message-sender">
              {isUser ? prenomEleve : 'ÉtudIA'}
            </span>
            <span className="message-time">
              {chatUtils.formatTime(message.timestamp)}
            </span>
          </div>

          <div className="message-body">
            <div 
              className="message-text"
              dangerouslySetInnerHTML={{ __html: chatUtils.formatMessage(message.content) }}
            />
          </div>

          {/* Métadonnées message */}
          <div className="message-meta">
            {message.mode && message.mode !== 'normal' && (
              <span className="meta-tag mode" style={{ backgroundColor: chatUtils.getModeColor(message.mode) }}>
                {OPENROUTER_CONFIG.LEARNING_MODES[message.mode]?.icon} {OPENROUTER_CONFIG.LEARNING_MODES[message.mode]?.name}
              </span>
            )}
            
            {hasContext && (
              <span className="meta-tag context">
                📄 {message.documentUsed || 'Document'}
              </span>
            )}
            
            {message.tokens > 0 && userPreferences.show_tokens && (
              <span className="meta-tag tokens">
                🔢 {message.tokens} tokens
              </span>
            )}
            
            {message.model && message.model !== 'Système' && (
              <span className="meta-tag model">
                🤖 {message.model}
              </span>
            )}
            
            {message.responseTime && (
              <span className="meta-tag time">
                ⚡ {message.responseTime.toFixed(1)}s
              </span>
            )}
            
            {message.confidence && (
              <span className="meta-tag confidence">
                🎯 {message.confidence}%
              </span>
            )}
          </div>

          {/* Actions message */}
          {!isUser && !isError && (
            <div className="message-actions">
              <button 
                className="action-btn"
                onClick={() => navigator.clipboard.writeText(message.content)}
                title="Copier"
              >
                📋
              </button>
              
              {userPreferences.sounds && (
                <button 
                  className="action-btn"
                  onClick={() => speakResponse(message.content)}
                  title="Écouter"
                >
                  🔊
                </button>
              )}
              
              <button 
                className="action-btn"
                onClick={() => setInputMessage(`Explique mieux: "${message.content.substring(0, 50)}..."`)}
                title="Demander plus de détails"
              >
                🔍
              </button>
            </div>
          )}

          {/* Bouton retry pour les erreurs */}
          {isError && message.retryable && (
            <div className="error-actions">
              <button 
                className="retry-btn"
                onClick={retryLastMessage}
              >
                🔄 Réessayer
              </button>
            </div>
          )}

          {/* Progression étapes (mode step_by_step) */}
          {message.mode === 'step_by_step' && !isUser && (
            <div className="step-progress">
              <div className="step-header">
                <span>Étape {currentStep} sur {totalSteps}</span>
                <div className="step-bar">
                  <div 
                    className="step-fill"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

// ===================================================================
// FIN PARTIE 4/5 - INTERFACE + UI
// Prochaine partie : Rendu principal et export final
// ===================================================================

  // ===================================================================
// 🚀 ÉtudIA V4.1 - CHATIA.JSX PARTIE 5/5 : RENDU + EXPORT FINAL
// SECTION: Rendu principal + Interface complète + Export component
// Créé par @Pacousstar - Optimisé pour V4.1 par MonAP
// ===================================================================

  // ===================================================================
  // 🎨 RENDU PRINCIPAL - Interface complète ChatIA
  // ===================================================================

  return (
    <div className={`chatia-container ${isDarkMode ? 'dark' : ''} ${isMobile ? 'mobile' : ''}`}>
      
      {/* 🔔 Système de notifications */}
      <NotificationSystem />

      {/* 📊 Panneau latéral gauche - Stats et contrôles */}
      <div className="sidebar-left">
        
        {/* Statut connexion */}
        <ConnectionStatusIndicator />
        
        {/* Sélecteur modèle IA */}
        <ModelSelector />
        
        {/* Sélecteur mode d'apprentissage */}
        <LearningModeSelector />
        
        {/* Statistiques session */}
        <StatsPanel />
        
        {/* Document actif */}
        <DocumentPanel />

        {/* Actions rapides */}
        <div className="quick-actions">
          <button 
            className="action-button clear"
            onClick={clearConversation}
            title="Effacer conversation"
          >
            🗑️ Effacer
          </button>
          
          <button 
            className="action-button save"
            onClick={saveConversation}
            title="Sauvegarder conversation"
          >
            💾 Sauvegarder
          </button>
          
          <button 
            className="action-button copy"
            onClick={copyConversation}
            title="Copier conversation"
          >
            📋 Copier
          </button>
          
          <button 
            className="action-button export"
            onClick={exportStats}
            title="Exporter statistiques"
          >
            📊 Export Stats
          </button>
        </div>

        {/* Mode audio */}
        {audioSupported && (
          <div className="audio-controls">
            <button
              className={`audio-toggle ${isAudioMode ? 'active' : ''}`}
              onClick={() => setIsAudioMode(!isAudioMode)}
            >
              🎤 Mode Audio
            </button>
          </div>
        )}
      </div>

      {/* 💬 Zone de chat principale */}
      <div className="chat-main">
        
        {/* En-tête chat */}
        <div className="chat-header">
          <div className="header-info">
            <h2>💬 Chat IA - ÉtudIA V4.1</h2>
            <div className="header-details">
              <span className="student-info">
                👤 {prenomEleve} - {classeEleve}
              </span>
              <span className="country-info">
                {welcomeConfig.emoji} {paysEleve}
              </span>
              <span className="model-info">
                🤖 {currentModelConfig.name}
              </span>
              <span className="mode-info">
                🎯 {currentModeConfig.name}
              </span>
            </div>
          </div>

          {/* Actions header */}
          <div className="header-actions">
            {unreadCount > 0 && (
              <div className="unread-badge">
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
              </div>
            )}
            
            <button 
              className="scroll-bottom-btn"
              onClick={() => scrollToBottom()}
              style={{ display: showScrollButton ? 'flex' : 'none' }}
            >
              ⬇️
            </button>

            <button 
              className="refresh-btn"
              onClick={checkConnectionStatus}
              title="Vérifier connexion"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.map((message, index) => renderMessage(message, index))}
          
          {/* Indicateur de frappe */}
          <TypingIndicator />
          
          {/* Référence pour auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions intelligentes */}
        <SuggestionsPanel />

        {/* Zone de saisie */}
        <div className="input-container">
          
          {/* Barre d'outils */}
          <div className="input-toolbar">
            
            {/* Indicateur document actif */}
            {activeDocument && (
              <div className="active-document-indicator">
                <span className="doc-icon">📄</span>
                <span className="doc-name">{activeDocument.nom_original}</span>
                <span className="doc-status">✅ Chargé</span>
              </div>
            )}

            {/* Mode d'apprentissage actuel */}
            <div className="current-mode-indicator">
              <span className="mode-icon">
                {currentModeConfig.icon}
              </span>
              <span className="mode-name">
                {currentModeConfig.name}
              </span>
              <span className="mode-tokens">
                {currentModeConfig.tokens} tokens max
              </span>
            </div>

            {/* Compteur de caractères */}
            <div className="char-counter">
              <span className={inputMessage.length > 500 ? 'warning' : ''}>
                {inputMessage.length}/1000
              </span>
            </div>
          </div>

          {/* Zone de saisie principale */}
          <div className="input-area">
            
            {/* Textarea message */}
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Posez votre question à ÉtudIA en mode ${currentModeConfig.name}...`}
              disabled={isLoading || connectionStatus === 'offline'}
              rows={isMobile ? 2 : 3}
              maxLength={1000}
              className={`message-input ${isLoading ? 'disabled' : ''}`}
            />

            {/* Boutons d'action */}
            <div className="input-actions">
              
              {/* Reconnaissance vocale */}
              {audioSupported && isAudioMode && (
                <button
                  className={`voice-btn ${isRecording ? 'recording' : ''}`}
                  onClick={startVoiceRecognition}
                  disabled={isLoading || isRecording}
                  title="Reconnaissance vocale"
                >
                  {isRecording ? '🔴' : '🎤'}
                </button>
              )}

              {/* Suggestion aléatoire */}
              <button
                className="random-btn"
                onClick={handleRandomSuggestion}
                disabled={isLoading}
                title="Suggestion aléatoire"
              >
                🎲
              </button>

              {/* Effacer input */}
              {inputMessage && (
                <button
                  className="clear-input-btn"
                  onClick={() => setInputMessage('')}
                  title="Effacer texte"
                >
                  ❌
                </button>
              )}

              {/* Bouton envoi */}
              <button
                className={`send-btn ${!inputMessage.trim() || isLoading ? 'disabled' : 'active'}`}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading || connectionStatus === 'offline'}
                title={isLoading ? 'Envoi en cours...' : 'Envoyer message'}
              >
                {isLoading ? (
                  <div className="loading-spinner">⏳</div>
                ) : (
                  <span className="send-icon">🚀</span>
                )}
              </button>
            </div>
          </div>

          {/* Barre de statut */}
          <div className="status-bar">
            
            {/* Usage tokens */}
            <div className="token-usage">
              <span className="usage-text">
                📊 {tokenUsage.used_today}/{tokenUsage.daily_limit} requêtes aujourd'hui
              </span>
              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{ 
                    width: `${Math.min(100, (tokenUsage.used_today / tokenUsage.daily_limit) * 100)}%`,
                    background: tokenUsage.used_today > tokenUsage.daily_limit * 0.8 ? 
                      CHAT_THEME.error : CHAT_THEME.success
                  }}
                ></div>
              </div>
            </div>

            {/* Statut frappe */}
            {isTyping && (
              <div className="typing-status">
                ⌨️ {prenomEleve} écrit...
              </div>
            )}

            {/* Dernière activité */}
            <div className="last-activity">
              {messages.length > 0 && (
                <span>
                  Dernière activité: {chatUtils.timeAgo(messages[messages.length - 1]?.timestamp)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📱 Menu mobile (si nécessaire) */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          <button 
            className="nav-btn"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            💡 Suggestions
          </button>
          
          <button 
            className="nav-btn"
            onClick={() => scrollToBottom()}
          >
            ⬇️ Descendre
          </button>
          
          <button 
            className="nav-btn"
            onClick={clearConversation}
          >
            🗑️ Effacer
          </button>
          
          <button 
            className="nav-btn"
            onClick={saveConversation}
          >
            💾 Sauver
          </button>
        </div>
      )}

      {/* 🔧 Debug panel (développement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <div className="debug-header">🔧 Debug ChatIA V4.1</div>
          <div className="debug-info">
            <div>Messages: {messages.length}</div>
            <div>Mode: {chatMode}</div>
            <div>Modèle: {currentModel}</div>
            <div>Connexion: {connectionStatus}</div>
            <div>Document: {activeDocument?.nom_original || 'Aucun'}</div>
            <div>Tokens: {totalTokens}</div>
            <div>Conversations: {conversationCount}</div>
            <div>Mobile: {isMobile ? 'Oui' : 'Non'}</div>
          </div>
          <div className="debug-actions">
            <button onClick={resetStats}>Reset Stats</button>
            <button onClick={() => console.log('Messages:', messages)}>Log Messages</button>
            <button onClick={() => console.log('Stats:', deepSeekStats)}>Log Stats</button>
          </div>
        </div>
      )}

      {/* 🎵 Audio element pour sons */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

// ===================================================================
// 🚀 EXPORT FINAL - Composant ChatIA V4.1 complet
// ===================================================================

export default ChatIA;

// ===================================================================
// 🎯 COMMENTAIRES POUR PACOUSSTAR - ASSEMBLAGE FINAL CHATIA.JSX
// ===================================================================

/*
🚀 INSTRUCTIONS D'ASSEMBLAGE CHATIA.JSX COMPLET:

📁 Dans ton dossier frontend/src/components/:

1️⃣ COPIER LES 5 PARTIES:
   - ChatIA-part1-imports-config-openrouter.js
   - ChatIA-part2-component-states-openrouter.js  
   - ChatIA-part3-messages-openrouter.js
   - ChatIA-part4-interface-ui.js
   - ChatIA-part5-render-export.js

2️⃣ ASSEMBLER EN UN SEUL FICHIER:
   cat ChatIA-part1-imports-config-openrouter.js > ChatIA-new.jsx
   cat ChatIA-part2-component-states-openrouter.js >> ChatIA-new.jsx
   cat ChatIA-part3-messages-openrouter.js >> ChatIA-new.jsx
   cat ChatIA-part4-interface-ui.js >> ChatIA-new.jsx
   cat ChatIA-part5-render-export.js >> ChatIA-new.jsx

3️⃣ REMPLACER TON CHATIA.JSX ACTUEL:
   mv ChatIA.jsx ChatIA-old-backup.jsx
   mv ChatIA-new.jsx ChatIA.jsx

4️⃣ VÉRIFICATIONS IMPORTANTES:
   ✅ Import openRouterService depuis ../services/openRouterService
   ✅ Toutes les props sont bien passées depuis App.js
   ✅ Les CSS classes correspondent à ton App.css
   ✅ Les fonctions utilitaires sont bien définies

5️⃣ NOUVELLES PROPS REQUISES DEPUIS APP.JS:
   - openRouterService: instance du service OpenRouter
   - currentModel: 'free' ou 'paid' 
   - learningMode: mode d'apprentissage actuel
   - onModeChange: callback changement mode
   - isDarkMode: thème sombre boolean
   - isMobile: détection mobile boolean

🎯 TOTAL CHATIA.JSX ASSEMBLÉ: ~1900 lignes réparties en 5 sections fonctionnelles
✅ 100% compatible OpenRouter DeepSeek R1
✅ Interface révolutionnaire avec stats temps réel
✅ 4 modes d'apprentissage visuels
✅ Support audio et reconnaissance vocale
✅ Gestion intelligente des erreurs
✅ Responsive mobile parfait

🚀 PROCHAINE ÉTAPE: openRouterService.js complet !

🇨🇮 Made with ❤️ by @Pacousstar & MonAP
   Révolutionnons l'éducation africaine ensemble !
*/
