// ChatIA.js - VERSION CORRIGÉE - FONCTION getSuggestions AJOUTÉE
import React, { useState, useEffect, useRef } from 'react';

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
   openRouterService,           // 🆕 NOUVEAU SERVICE
  currentModel = 'free',       // 🆕 MODÈLE SÉLECTIONNÉ (free/paid)
  onStatsUpdate
}) => {
  const [messages, setMessages] = useState(chatHistory || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(chatTokensUsed || 0);
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  const [learningProfile, setLearningProfile] = useState(null);

  // 🤖 NOUVEAUX ÉTATS OPENROUTER DEEPSEEK R1 - ÉtudIA V4.1
  const [deepSeekStats, setDeepSeekStats] = useState({     // 📊 Stats locales DeepSeek
    total_conversations: 0,
    free_tier_used: 0,
    paid_tier_used: 0,
    tokens_consumed: 0,
    average_response_time: 0
  });
  
  // 🎯 ÉTATS RÉVOLUTIONNAIRES
  const [chatMode, setChatMode] = useState('normal');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(4);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 🔧 CORRECTION TOKENS
  const [tokenUsage, setTokenUsage] = useState({ 
    used_today: chatTokensUsed || 0, 
    remaining: 95000 - (chatTokensUsed || 0),
    total_conversations: 0,
    last_updated: Date.now()
  });
  
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Récupération sécurisée du prénom
  const prenomEleve = student?.nom?.split(' ')[0] || student?.name?.split(' ')[0] || 'Élève';
  const classeEleve = student?.classe || student?.class_level || 'votre classe';

  // 🎯 FONCTION getSuggestions MANQUANTE - CORRECTION IMMÉDIATE!
  const getSuggestions = () => {
    const basesuggestions = [
      "Explique-moi l'exercice 1 de mon document",
      "Aide-moi à résoudre ce problème de mathématiques",
      "Comment faire cet exercice étape par étape?",
      "Donne-moi la solution complète de l'exercice",
      "J'ai des difficultés avec ce calcul",
      "Peux-tu m'expliquer cette formule?",
      "Comment résoudre cette équation?",
      "Aide-moi en français s'il te plaît"
    ];

    // Suggestions basées sur la classe de l'élève
    const classBasedSuggestions = {
      '6ème': [
        "Aide-moi avec les fractions",
        "Comment faire une division?",
        "Explique-moi la géométrie",
        "Les nombres décimaux me posent problème"
      ],
      '5ème': [
        "Comment résoudre une équation simple?",
        "Aide-moi avec les aires et périmètres",
        "Les nombres relatifs c'est dur",
        "Comment faire une proportion?"
      ],
      '4ème': [
        "Les équations du premier degré",
        "Aide-moi avec le théorème de Pythagore", 
        "Comment calculer une puissance?",
        "Les fonctions linéaires m'embêtent"
      ],
      '3ème': [
        "Résous cette équation du second degré",
        "Aide-moi avec la trigonométrie",
        "Comment factoriser cette expression?",
        "Les probabilités me posent problème"
      ],
      'Seconde': [
        "Aide-moi avec les vecteurs",
        "Comment résoudre un système d'équations?",
        "Les fonctions affines c'est compliqué",
        "Explique-moi les statistiques"
      ],
      'Première': [
        "Dérivée de cette fonction?",
        "Aide-moi avec les suites numériques",
        "Comment étudier une fonction?",
        "Les probabilités conditionnelles"
      ],
      'Terminale': [
        "Calcule cette intégrale",
        "Aide-moi avec les limites",
        "Comment résoudre cette équation différentielle?",
        "Les lois de probabilité continues"
      ]
    };

    // Suggestions basées sur le document actuel
    const documentSuggestions = [];
    if (documentContext && documentContext.length > 100) {
      documentSuggestions.push(
        "Analyse ce document pour moi",
        "Résous tous les exercices du document",
        "Explique-moi le premier exercice",
        "Donne-moi un résumé du document"
      );
    }

    // Suggestions basées sur le mode actuel
    const modeSuggestions = [];
    if (chatMode === 'step_by_step') {
      modeSuggestions.push(
        "Guide-moi étape par étape",
        "Explique chaque étape lentement",
        "Je veux comprendre le processus",
        "Vérifie ma compréhension"
      );
    } else if (chatMode === 'direct_solution') {
      modeSuggestions.push(
        "Donne-moi toutes les réponses",
        "Solutions complètes s'il te plaît",
        "Résous tout directement",
        "Je veux les résultats finaux"
      );
    }

    // Combiner toutes les suggestions
    let allSuggestions = [...basesuggestions];
    
    // Ajouter suggestions spécifiques à la classe
    if (classeEleve && classBasedSuggestions[classeEleve]) {
      allSuggestions = [...allSuggestions, ...classBasedSuggestions[classeEleve]];
    }
    
    // Ajouter suggestions document
    if (documentSuggestions.length > 0) {
      allSuggestions = [...documentSuggestions, ...allSuggestions];
    }
    
    // Ajouter suggestions mode
    if (modeSuggestions.length > 0) {
      allSuggestions = [...modeSuggestions, ...allSuggestions];
    }

    // Mélanger et retourner
    return allSuggestions.sort(() => Math.random() - 0.5);
  };

  // 🔧 FONCTION MISE À JOUR TOKENS
  const updateTokenUsage = (newTokens, totalTokens = null) => {
    const updatedTokens = totalTokens !== null ? totalTokens : tokenUsage.used_today + newTokens;
    
    setTokenUsage(prev => {
      const updated = {
        ...prev,
        used_today: updatedTokens,
        remaining: 95000 - updatedTokens,
        total_conversations: prev.total_conversations + 1,
        last_updated: Date.now()
      };
      
      console.log('🔋 Tokens mis à jour:', updated);
      return updated;
    });

    if (setChatTokensUsed) {
      setChatTokensUsed(updatedTokens);
    }
  };

  // 🔧 Synchronisation historique messages
  useEffect(() => {
    if (setChatHistory && messages.length > 0) {
      setChatHistory(messages);
    }
  }, [messages, setChatHistory]);

  // 🔧 Synchronisation tokens depuis parent
  useEffect(() => {
    if (chatTokensUsed !== tokenUsage.used_today) {
      setTokenUsage(prev => ({
        ...prev,
        used_today: chatTokensUsed,
        remaining: 95000 - chatTokensUsed
      }));
    }
  }, [chatTokensUsed]);

// 🎤 INITIALISATION RECONNAISSANCE VOCALE MOBILE CORRIGÉE
useEffect(() => {
  console.log('🎤 Initialisation reconnaissance vocale mobile...');
  
  // 📱 DÉTECTION PRÉCISE DU MOBILE
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  console.log('📱 Appareil détecté:', { isMobile, isIOS, isAndroid });
  
  // 🎤 SUPPORT RECONNAISSANCE VOCALE MULTI-NAVIGATEUR
  const SpeechRecognition = window.SpeechRecognition || 
                           window.webkitSpeechRecognition || 
                           window.mozSpeechRecognition || 
                           window.msSpeechRecognition;
  
  if (SpeechRecognition) {
    console.log('✅ Reconnaissance vocale supportée');
    
    try {
      const recognitionInstance = new SpeechRecognition();
      
      // 🔧 CONFIGURATION MOBILE OPTIMISÉE
      recognitionInstance.continuous = false;        // CRUCIAL pour mobile
      recognitionInstance.interimResults = false;    // CRUCIAL pour mobile
      recognitionInstance.lang = 'fr-FR';
      recognitionInstance.maxAlternatives = 1;       // Optimisation mobile
      
      // 📱 PARAMÈTRES SPÉCIAUX MOBILES
      if (isMobile) {
        // iOS a besoin de paramètres très spécifiques
        if (isIOS) {
          recognitionInstance.lang = 'fr-FR';
          recognitionInstance.continuous = false;
          recognitionInstance.interimResults = false;
          console.log('📱 Configuration iOS appliquée');
        }
        
        // Android aussi a ses spécificités
        if (isAndroid) {
          recognitionInstance.lang = 'fr-FR';
          recognitionInstance.continuous = false;
          console.log('📱 Configuration Android appliquée');
        }
      }
      
      // 🎤 ÉVÉNEMENTS RECONNAISSANCE
      recognitionInstance.onstart = () => {
        console.log('🎤 Reconnaissance vocale démarrée');
        setIsRecording(true);
        
        // 📱 FEEDBACK MOBILE
        if (isMobile && navigator.vibrate) {
          navigator.vibrate([100]); // Vibration courte
        }
      };
      
      recognitionInstance.onresult = (event) => {
        console.log('🎤 Événement résultat:', event);
        
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          console.log('🎤 Texte reconnu:', transcript);
          
          setInputMessage(transcript);
          setIsRecording(false);
          
          // 📱 FEEDBACK SUCCÈS MOBILE
          if (isMobile && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]); // Triple vibration succès
          }
          
          // 🔊 FEEDBACK AUDIO OPTIONNEL
          if (window.AudioContext || window.webkitAudioContext) {
            try {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.1);
            } catch (audioError) {
              console.log('🔊 Pas de feedback audio disponible');
            }
          }
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ Erreur reconnaissance vocale:', event.error, event);
        setIsRecording(false);
        
        // 📱 GESTION ERREURS SPÉCIFIQUES MOBILES
        if (isMobile) {
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            alert('🎤 AUTORISATION NÉCESSAIRE\n\nPour utiliser la reconnaissance vocale :\n• Autorise le microphone dans ton navigateur\n• Vérifie les permissions de ton appareil\n• Essaie Chrome ou Safari');
          } else if (event.error === 'no-speech') {
            console.log('📱 Aucun son détecté - normal sur mobile');
            alert('🎤 Aucun son détecté\n\nAssure-toi de :\n• Parler clairement\n• Être dans un endroit calme\n• Tenir ton téléphone près de ta bouche');
          } else if (event.error === 'network') {
            alert('🌐 Problème de connexion\n\nVérifie ta connexion internet et réessaie.');
          } else if (event.error === 'aborted') {
            console.log('🎤 Reconnaissance annulée par l\'utilisateur');
          } else {
            alert(`🎤 Erreur technique: ${event.error}\n\nRéessaie dans quelques secondes.`);
          }
          
          // 📱 VIBRATION ERREUR
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]); // Pattern d'erreur
          }
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('🎤 Reconnaissance vocale terminée');
        setIsRecording(false);
      };
      
      // 📱 GESTION ÉVÉNEMENT SPÉCIAL MOBILE
      recognitionInstance.onnomatch = () => {
        console.log('🎤 Aucune correspondance trouvée');
        setIsRecording(false);
        if (isMobile) {
          alert('🎤 Je n\'ai pas compris\n\nRépète plus clairement s\'il te plaît.');
        }
      };
      
      setRecognition(recognitionInstance);
      console.log('✅ Reconnaissance vocale configurée pour mobile');
      
    } catch (initError) {
      console.error('❌ Erreur initialisation reconnaissance:', initError);
      setRecognition(null);
    }
    
  } else {
    console.warn('⚠️ Reconnaissance vocale non supportée');
    setRecognition(null);
    
    // 📱 MESSAGE SPÉCIAL MOBILE
    if (isMobile) {
      console.log('📱 Pas de reconnaissance vocale sur ce navigateur mobile');
    }
  }
}, []);

// 🎤 FONCTION DÉMARRAGE RECONNAISSANCE VOCALE MOBILE CORRIGÉE
const startVoiceRecognition = async () => {
  console.log('🎤 Tentative démarrage reconnaissance vocale...');
  
  if (!recognition) {
    console.warn('⚠️ Reconnaissance vocale non supportée');
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      alert('🎤 RECONNAISSANCE VOCALE NON DISPONIBLE\n\nTon navigateur mobile ne supporte pas cette fonctionnalité.\n\nEssaie :\n• Chrome (Android)\n• Safari (iOS)\n• Firefox mobile récent');
    } else {
      alert('🎤 RECONNAISSANCE VOCALE NON DISPONIBLE\n\nTon navigateur ne supporte pas cette fonctionnalité.\n\nUtilise Chrome, Edge ou Firefox récent.');
    }
    return;
  }

  if (isRecording) {
    console.log('🎤 Reconnaissance déjà en cours...');
    return;
  }

  try {
    console.log('🎤 Démarrage reconnaissance vocale...');
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // 📱 DEMANDE PERMISSION MICROPHONE EXPLICITE SUR MOBILE
    if (isMobile) {
      console.log('📱 Demande permission microphone mobile...');
      
      // 🎤 Méthode 1: getUserMedia pour permission explicite
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100
            } 
          });
          
          console.log('📱 Permission micro accordée');
          
          // Arrêter le stream immédiatement (on n'en a plus besoin)
          stream.getTracks().forEach(track => track.stop());
          
          // 📱 DÉLAI SPÉCIAL iOS (nécessaire)
          if (isIOS) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Démarrer la reconnaissance
          recognition.start();
          
        } catch (permissionError) {
          console.error('📱 Permission micro refusée:', permissionError);
          
          if (permissionError.name === 'NotAllowedError') {
            alert('🎤 PERMISSION REFUSÉE\n\nPour utiliser la reconnaissance vocale :\n\n1. Autorise l\'accès au microphone\n2. Dans les paramètres de ton navigateur\n3. Recharge la page\n4. Réessaie');
          } else if (permissionError.name === 'NotFoundError') {
            alert('🎤 MICROPHONE NON TROUVÉ\n\nVérifie que ton appareil a un microphone fonctionnel.');
          } else {
            alert(`🎤 ERREUR PERMISSION\n\n${permissionError.message}\n\nVérifie les paramètres de ton navigateur.`);
          }
          return;
        }
      } else {
        // 🎤 Méthode 2: Directement reconnaissance (anciens navigateurs)
        console.log('📱 Démarrage direct reconnaissance (pas de getUserMedia)');
        recognition.start();
      }
    } else {
      // 💻 DESKTOP: Démarrage direct
      recognition.start();
    }
    
  } catch (error) {
    console.error('❌ Erreur démarrage reconnaissance:', error);
    setIsRecording(false);
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      alert('🎤 ERREUR MOBILE\n\nProblème technique.\n\nSolutions :\n• Recharge la page\n• Redémarre ton navigateur\n• Vérifie ta connexion\n• Utilise le clavier à la place');
    } else {
      alert('🎤 ERREUR TECHNIQUE\n\nRéessaie dans quelques secondes ou utilise le clavier.');
    }
  }
};

// 🔊 FONCTION SYNTHÈSE VOCALE MOBILE CORRIGÉE
const speakResponse = (text) => {
  console.log('🔊 DÉBUT SYNTHÈSE VOCALE:', text?.substring(0, 50));
  
  // 🔧 VÉRIFICATION SUPPORT
  if (!('speechSynthesis' in window)) {
    console.error('❌ speechSynthesis non supporté');
    alert('🔊 Synthèse vocale non supportée sur ton appareil');
    return;
  }

  // 📱 DÉTECTION MOBILE
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  console.log('🔊 Appareil détecté:', { isMobile, isIOS });

  // 🛑 ARRÊTER TOUTE SYNTHÈSE EN COURS
  try {
    speechSynthesis.cancel();
    console.log('🛑 Synthèse précédente annulée');
  } catch (cancelError) {
    console.warn('⚠️ Erreur annulation synthèse:', cancelError);
  }
  
  // 🧹 NETTOYAGE TEXTE ULTRA-COMPLET
  let cleanText = text;
  
  try {
    cleanText = text
      // Supprimer TOUS les emojis
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Supprimer emojis spécifiques
      .replace(/📊|🔁|✅|🎯|💬|🤖|📄|💡|🚀|❓|🎉|👍|🌟|⚡|💪|🇨🇮|✨|🔧|🧠|📚|📝|🎓|🔊|🎤/g, '')
      // Supprimer format étapes
      .replace(/📊\s*Étape\s+\d+\/\d+/gi, '')
      // Supprimer markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remplacer sauts de ligne par points
      .replace(/\n+/g, '. ')
      // Supprimer espaces multiples
      .replace(/\s+/g, ' ')
      // Supprimer caractères spéciaux
      .replace(/[{}[\]()]/g, '')
      .trim();
      
    console.log('🧹 Texte nettoyé:', cleanText?.substring(0, 100));
    
  } catch (cleanError) {
    console.error('❌ Erreur nettoyage texte:', cleanError);
    cleanText = text?.replace(/[^\w\s.,!?]/g, '').trim();
  }
  
  if (!cleanText || cleanText.length < 3) {
    console.warn('⚠️ Texte trop court pour synthèse:', cleanText);
    return;
  }
  
  // 🔊 CRÉATION UTTERANCE
  let utterance;
  try {
    utterance = new SpeechSynthesisUtterance(cleanText);
    console.log('✅ Utterance créée');
  } catch (utteranceError) {
    console.error('❌ Erreur création utterance:', utteranceError);
    return;
  }
  
  // 🔧 CONFIGURATION UTTERANCE
  utterance.lang = 'fr-FR';
  utterance.volume = 1.0; // Volume maximum
  utterance.rate = isMobile ? 0.8 : 0.9;
  utterance.pitch = 1.0;
  
  // 📱 CONFIGURATION SPÉCIALE MOBILE
  if (isMobile) {
    if (isIOS) {
      utterance.rate = 0.7;  // iOS plus lent
      utterance.volume = 1.0; // Volume max iOS
      console.log('🍎 Configuration iOS appliquée');
    } else {
      utterance.rate = 0.85; // Android normal
      utterance.volume = 1.0;
      console.log('🤖 Configuration Android appliquée');
    }
  }

  // 🗣️ SÉLECTION VOIX FRANÇAISE
  const selectVoice = () => {
    try {
      const voices = speechSynthesis.getVoices();
      console.log('🗣️ Voix disponibles:', voices.length);
      
      if (voices.length === 0) {
        console.warn('⚠️ Aucune voix disponible');
        return null;
      }
      
      // Chercher voix française prioritaire
      const frenchVoices = voices.filter(voice => 
        voice.lang.toLowerCase().includes('fr')
      );
      
      console.log('🇫🇷 Voix françaises trouvées:', frenchVoices.length);
      
      if (frenchVoices.length > 0) {
        // Priorité aux voix locales
        const localFrenchVoice = frenchVoices.find(voice => voice.localService);
        if (localFrenchVoice) {
          console.log('✅ Voix française locale sélectionnée:', localFrenchVoice.name);
          return localFrenchVoice;
        }
        
        // Sinon première voix française
        console.log('✅ Voix française sélectionnée:', frenchVoices[0].name);
        return frenchVoices[0];
      }
      
      // Fallback voix par défaut
      console.log('⚠️ Pas de voix française, voix par défaut utilisée');
      return voices[0];
      
    } catch (voiceError) {
      console.error('❌ Erreur sélection voix:', voiceError);
      return null;
    }
  };

  // 🎯 ÉVÉNEMENTS SYNTHÈSE
  utterance.onstart = () => {
    console.log('🔊 ▶️ SYNTHÈSE DÉMARRÉE');
    
    // 📱 FEEDBACK MOBILE
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // 🔊 NOTIFICATION VISUELLE
    if (typeof setIsRecording === 'function') {
      // Pas de setIsRecording pour synthèse, mais on peut ajouter un état
    }
  };
  
  utterance.onend = () => {
    console.log('🔊 ⏹️ SYNTHÈSE TERMINÉE');
  };
  
  utterance.onerror = (event) => {
    console.error('❌ ERREUR SYNTHÈSE VOCALE:', {
      error: event.error,
      charIndex: event.charIndex,
      elapsedTime: event.elapsedTime
    });
    
    // 🔊 GESTION ERREURS SPÉCIFIQUES
    switch (event.error) {
      case 'network':
        console.log('🌐 Erreur réseau - synthèse hors ligne');
        break;
      case 'synthesis-failed':
        console.log('🔊 Échec synthèse - texte trop long?');
        break;
      case 'synthesis-unavailable':
        console.log('🔊 Synthèse non disponible');
        alert('🔊 Synthèse vocale temporairement indisponible');
        break;
      case 'language-unavailable':
        console.log('🇫🇷 Langue française non disponible');
        break;
      case 'voice-unavailable':
        console.log('🗣️ Voix sélectionnée non disponible');
        break;
      case 'text-too-long':
        console.log('📝 Texte trop long pour synthèse');
        break;
      case 'invalid-argument':
        console.log('⚠️ Argument invalide pour synthèse');
        break;
      default:
        console.log('❓ Erreur synthèse inconnue:', event.error);
    }
  };

  utterance.onpause = () => {
    console.log('🔊 ⏸️ Synthèse en pause');
  };

  utterance.onresume = () => {
    console.log('🔊 ▶️ Synthèse reprise');
  };

  utterance.onmark = (event) => {
    console.log('🔊 📍 Marque synthèse:', event.name);
  };

  utterance.onboundary = (event) => {
    console.log('🔊 📏 Frontière synthèse:', event.name, event.charIndex);
  };

  // 🚀 FONCTION DÉMARRAGE SYNTHÈSE
  const startSpeech = () => {
    try {
      console.log('🚀 LANCEMENT SYNTHÈSE...');
      
      // Sélectionner voix si disponible
      const selectedVoice = selectVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Test du volume système
      console.log('🔊 Volume utterance:', utterance.volume);
      console.log('🔊 Rate utterance:', utterance.rate);
      console.log('🔊 Pitch utterance:', utterance.pitch);
      console.log('🔊 Lang utterance:', utterance.lang);
      console.log('🔊 Voice utterance:', utterance.voice?.name || 'Default');
      
      // DÉMARRAGE EFFECTIF
      speechSynthesis.speak(utterance);
      console.log('✅ speechSynthesis.speak() appelé');
      
      // VÉRIFICATION POST-DÉMARRAGE
      setTimeout(() => {
        const isSpaking = speechSynthesis.speaking;
        const isPending = speechSynthesis.pending;
        const isPaused = speechSynthesis.paused;
        
        console.log('🔊 État synthèse après 100ms:', {
          speaking: isSpaking,
          pending: isPending,
          paused: isPaused
        });
        
        if (!isSpaking && !isPending) {
          console.warn('⚠️ Synthèse n\'a pas démarré - tentative de réactivation');
          
          // RÉESSAI FORCE
          setTimeout(() => {
            try {
              speechSynthesis.cancel();
              speechSynthesis.speak(utterance);
              console.log('🔄 Réessai synthèse effectué');
            } catch (retryError) {
              console.error('❌ Erreur réessai:', retryError);
            }
          }, 100);
        }
      }, 100);
      
    } catch (startError) {
      console.error('❌ Erreur démarrage synthèse:', startError);
      alert('🔊 Impossible de démarrer la synthèse vocale');
    }
  };

  // 🕐 DÉLAI SELON PLATEFORME
  if (isMobile) {
    // 📱 Mobile: délai pour éviter conflits
    console.log('📱 Démarrage synthèse mobile avec délai...');
    setTimeout(startSpeech, 300);
  } else {
    // 💻 Desktop: immédiat
    console.log('💻 Démarrage synthèse desktop immédiat...');
    setTimeout(startSpeech, 100);
  }
};

// 🔧 FONCTION HELPER: Vérifier support audio
const checkAudioSupport = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const support = {
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    speechSynthesis: !!window.speechSynthesis,
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    vibration: !!navigator.vibrate,
    audioContext: !!(window.AudioContext || window.webkitAudioContext)
  };
  
  console.log('🎤 Support audio:', support);
  
  return {
    canRecord: support.speechRecognition,
    canSpeak: support.speechSynthesis,
    canVibrate: support.vibration && isMobile,
    isFullySupported: support.speechRecognition && support.speechSynthesis
  };
};

// 🎤 APPELER LA VÉRIFICATION AU MONTAGE
useEffect(() => {
  const audioSupport = checkAudioSupport();
  
  if (!audioSupport.isFullySupported) {
    console.warn('⚠️ Support audio partiel:', audioSupport);
  } else {
    console.log('✅ Support audio complet disponible');
  }
}, []);

  // 🔧 MESSAGE D'ACCUEIL CORRIGÉ
  const triggerWelcomeMessage = async () => {
    if (welcomeMessageSent) return;
    
    console.log('🎉 Déclenchement message d\'accueil...');
    
    try {
      setIsLoading(true);
      setConnectionStatus('connecting');
      
      let currentDocument = null;
      let contextToSend = '';
      
      try {
        if (selectedDocumentId && allDocuments.length > 0) {
          currentDocument = allDocuments.find(doc => doc.id === selectedDocumentId);
        }
        
        if (!currentDocument && allDocuments.length > 0) {
          currentDocument = allDocuments[0];
        }
        
        contextToSend = currentDocument?.texte_extrait || documentContext || '';
      } catch (docError) {
        console.warn('⚠️ Erreur récupération document:', docError.message);
        contextToSend = documentContext || '';
      }
      
      console.log('📄 Contexte pour accueil:', {
        document_found: !!currentDocument,
        document_name: currentDocument?.nom_original || 'Aucun',
        context_length: contextToSend.length
      });
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'connexion',
          user_id: student.id,
          document_context: contextToSend,
          is_welcome: true,
          mode: 'normal'
        }),
      });

      console.log('📡 Réponse API accueil:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Données accueil reçues:', {
        success: data.success,
        has_context: data.has_context,
        document_name: data.document_name
      });

      if (data.success !== false) {
        const welcomeMessage = {
          id: Date.now(),
          type: 'ai',
          content: data.response,
          timestamp: data.timestamp,
          tokens: data.tokens_used || 0,
          model: data.model,
          hasContext: data.has_context,
          isWelcome: true,
          documentUsed: data.document_name
        };

        setMessages([welcomeMessage]);
        setWelcomeMessageSent(true);
        setConnectionStatus('online');

        if (data.tokens_used) {
          updateTokenUsage(data.tokens_used);
        }
        
        console.log(`✅ Message d'accueil OK avec document: "${data.document_name}"`);
        
      } else {
        throw new Error(data.error || 'Erreur réponse API');
      }
      
    } catch (error) {
      console.error('❌ Erreur message d\'accueil:', error.message);
      setConnectionStatus('offline');
      
      const fallbackMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Salut ${prenomEleve} ! 🤖

Je suis ÉtudIA, ton tuteur IA révolutionnaire !

${allDocuments.length > 0 ? 
  `📄 Document détecté : "${allDocuments[0].nom_original}"` : 
  '📄 Aucun document - Upload-en un pour commencer !'}

🎯 Mode hors ligne temporaire activé.
Pose-moi tes questions, je ferai de mon mieux ! ✨

💡 Recharge la page pour reconnecter à ÉtudIA !`,
        timestamp: new Date().toISOString(),
        tokens: 0,
        isWelcome: true,
        isOffline: true
      };

      setMessages([fallbackMessage]);
      setWelcomeMessageSent(true);
      
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id && !welcomeMessageSent) {
      setTimeout(triggerWelcomeMessage, 500);
    }
  }, [student, welcomeMessageSent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

// 📊 MISE À JOUR STATS LOCALES - ÉtudIA V4.1
const updateLocalStats = (response) => {
  console.log('📊 Mise à jour stats DeepSeek R1:', response);
  
  // 🔢 Mise à jour compteurs locaux
  setDeepSeekStats(prev => ({
    ...prev,
    total_conversations: prev.total_conversations + 1,
    free_tier_used: response.free_tier_used ? prev.free_tier_used + 1 : prev.free_tier_used,
    paid_tier_used: !response.free_tier_used ? prev.paid_tier_used + 1 : prev.paid_tier_used,
    tokens_consumed: prev.tokens_consumed + (response.tokens_used || 0)
  }));

  // 🔄 Callback vers App.js pour mise à jour globale
  if (onStatsUpdate) {
    const updatedStats = openRouterService.getUsageStats();
    onStatsUpdate(updatedStats);
    console.log('📈 Stats globales mises à jour');
  }
};
  
  // 🔧 FONCTION ENVOI MESSAGE COMPLÈTE
  const handleSendMessage = async (messageText = inputMessage, mode = chatMode) => {
  if (!messageText.trim() || isLoading) return;

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: messageText.trim(),
    timestamp: new Date().toISOString(),
    tokens: 0,
    mode: mode
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  // 🔧 DÉCLARE LES VARIABLES EN HAUT POUR LE SCOPE
  let activeDocument = null;
  let finalDocumentContext = '';
  let hasValidContext = false;

  try {
    // 🔧 RÉCUPÉRATION DOCUMENT SÉCURISÉE
    try {
      if (selectedDocumentId && allDocuments.length > 0) {
        activeDocument = allDocuments.find(doc => doc.id === selectedDocumentId);
        console.log('🎯 Document sélectionné trouvé:', activeDocument?.nom_original);
      }
      
      if (!activeDocument && allDocuments.length > 0) {
        activeDocument = allDocuments[0];
        console.log('🎯 Premier document utilisé:', activeDocument?.nom_original);
      }
      
      finalDocumentContext = activeDocument?.texte_extrait || documentContext || '';
      hasValidContext = finalDocumentContext && finalDocumentContext.length > 50;
      
      console.log('📤 Contexte document final:', {
  active_document: activeDocument?.nom_original || 'Aucun',
  context_length: finalDocumentContext?.length || 0,
  has_valid_context: hasValidContext,
  mode: mode,
  message_preview: (messageText || '').substring(0, 50) + '...'
});
      
    } catch (contextError) {
      console.warn('⚠️ Erreur récupération contexte:', contextError.message);
      finalDocumentContext = documentContext || '';
      hasValidContext = false;
    }

    const payload = {
      message: messageText.trim(),
      user_id: student.id,
      document_context: finalDocumentContext,
      mode: mode,
      selected_document_id: selectedDocumentId || null,
      document_name: activeDocument?.nom_original || '',
      has_document: hasValidContext
    };

    if (mode === 'step_by_step') {
      payload.step_info = {
        current_step: currentStep,
        total_steps: totalSteps
      };
    }

    console.log('📡 Envoi vers API:', {
      url: `${apiUrl}/api/chat`,
      payload_keys: Object.keys(payload),
      user_id: payload.user_id,
      has_context: !!payload.document_context
    });

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('📡 Réponse API chat:', response.status, response.ok);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Données chat reçues:', {
      success: data.success,
      response_length: data.response?.length || 0,
      tokens_used: data.tokens_used,
      has_context: data.has_context
    });

    if (data.success !== false) {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: data.timestamp,
        tokens: data.tokens_used || 0,
        model: data.model,
        hasContext: data.has_context || hasValidContext,
        mode: mode,
        nextStep: data.next_step,
        documentUsed: data.document_name || activeDocument?.nom_original,
        contextLength: data.context_length || finalDocumentContext.length,
        responseValidated: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationCount(prev => prev + 1);
      setTotalTokens(prev => prev + (data.tokens_used || 0));
      setConnectionStatus('online');

      if (data.tokens_used) {
        updateTokenUsage(data.tokens_used);
      }

      if (mode === 'step_by_step' && data.next_step?.next) {
        setCurrentStep(data.next_step.next);
      }

      if (isAudioMode && data.response) {
        setTimeout(() => speakResponse(data.response), 500);
      }

      if (onStatsUpdate && student?.id) {
        try {
          onStatsUpdate(student.id);
        } catch (statsError) {
          console.warn('⚠️ Erreur mise à jour stats:', statsError.message);
        }
      }

      console.log(`✅ IA a répondu avec succès. Document utilisé: "${aiMessage.documentUsed || 'Aucun'}" (${aiMessage.contextLength || 0} chars)`);

    } else {
      throw new Error(data.error || 'Erreur communication IA');
    }
  } catch (error) {
    console.error('❌ Erreur chat complète:', {
      error_name: error.name,
      error_message: error.message,
      student_id: student?.id,
      api_url: apiUrl,
      has_document: !!(finalDocumentContext || documentContext)  // ✅ MAINTENANT ACCESSIBLE !
    });
    
    setConnectionStatus('error');
    
    let errorContent;
    
    if (error.message.includes('404')) {
      errorContent = `${prenomEleve}, la route de chat ÉtudIA est introuvable ! 🔍

🔧 **Problème**: Route /api/chat non trouvée sur le serveur

💡 **Solutions immédiates**:
• Vérifie que le serveur Render est démarré
• Recharge la page (F5)
• Vérifie l'URL du serveur dans la console

🤖 **URL actuelle**: ${apiUrl}/api/chat`;

    } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      errorContent = `${prenomEleve}, problème de connexion réseau ! 🌐

🔧 **Problème**: Impossible de joindre le serveur ÉtudIA

💡 **Solutions**:
• Vérifie ta connexion internet
• Le serveur Render est peut-être en train de démarrer (30s)
• Réessaie dans quelques instants

🤖 ÉtudIA sera bientôt de retour !`;

    } else {
      errorContent = `Désolé ${prenomEleve}, problème technique ! 😅

🔧 **Erreur**: ${error.message.substring(0, 100)}

${finalDocumentContext ? 
  `J'ai bien ton document mais je n'arrive pas à le traiter.` : 
  'Tu n\'as pas encore uploadé de document.'}

💡 **Solutions**:
${!finalDocumentContext ? '• Upload d\'abord un document\n' : ''}• Recharge la page (F5)  
• Réessaie dans 30 secondes
• Vérifie ta connexion

🤖 ÉtudIA sera bientôt de retour !`;
    }
    
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: errorContent,
      timestamp: new Date().toISOString(),
      tokens: 0,
      isError: true,
      hasContext: !!(finalDocumentContext || documentContext),  // ✅ MAINTENANT ACCESSIBLE !
      errorType: error.name,
      canRetry: true
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};

  // 🎯 BOUTON 1: MODE ÉTAPE PAR ÉTAPE 
  const activateStepByStepMode = () => {
    setChatMode('step_by_step');
    setCurrentStep(1);
    setTotalSteps(4);
    
    const modeMessage = `🔁 Mode "Étape par Étape" activé !

${prenomEleve}, je vais te guider progressivement à travers chaque étape de résolution.

📊 Format strict : "📊 Étape X/4"
🎯 Une seule question à la fois
✅ Validation de ta compréhension

Pose ta question et nous procéderons étape par étape ! 🚀`;

    const systemMessage = {
      id: Date.now(),
      type: 'system',
      content: modeMessage,
      timestamp: new Date().toISOString(),
      mode: 'step_by_step'
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  // 🎯 BOUTON 2: MODE SOLUTION DIRECTE
  const activateDirectSolutionMode = () => {
    setChatMode('direct_solution');
    
    const confirmMessage = `✅ Mode "Solution Directe" activé !

${prenomEleve}, je vais analyser ton document et te donner toutes les solutions complètes.

🎯 Toutes les réponses finales
📝 Solutions détaillées et structurées
💡 Explications claires pour chaque calcul
⚡ Résultats immédiats

Quel exercice veux-tu que je résolve complètement ?`;

    const systemMessage = {
      id: Date.now(),
      type: 'system', 
      content: confirmMessage,
      timestamp: new Date().toISOString(),
      mode: 'direct_solution'
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  // 🎤 MODE AUDIO AMÉLIORÉ
  const toggleAudioMode = () => {
    setIsAudioMode(!isAudioMode);
    
    if (!isAudioMode) {
      const audioMessage = {
        id: Date.now(),
        type: 'system',
        content: `🎤 Mode Audio activé !

${prenomEleve}, tu peux maintenant :
🎙️ Parler à ÉtudIA (clic sur le bouton micro)
🔊 Entendre mes réponses vocalement
✍️ Continuer à écrire normalement

Clique sur 🎙️ pour commencer à parler !`,
        timestamp: new Date().toISOString(),
        mode: 'audio'
      };
      setMessages(prev => [...prev, audioMessage]);
      
      setTimeout(() => speakResponse(`Mode audio activé ! ${prenomEleve}, tu peux maintenant me parler !`), 1000);
    } else {
      speechSynthesis.cancel();
      const audioOffMessage = {
        id: Date.now(),
        type: 'system',
        content: `🔇 Mode Audio désactivé !

${prenomEleve}, retour au mode texte uniquement.`,
        timestamp: new Date().toISOString(),
        mode: 'normal'
      };
      setMessages(prev => [...prev, audioOffMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Retour mode normal
  const resetToNormalMode = () => {
    setChatMode('normal');
    setCurrentStep(1);
    
    const resetMessage = {
      id: Date.now(),
      type: 'system',
      content: `↩️ Retour au mode normal !

${prenomEleve}, nous reprenons la conversation équilibrée. Tu peux à nouveau choisir tes modes d'apprentissage !`,
      timestamp: new Date().toISOString(),
      mode: 'normal'
    };

    setMessages(prev => [...prev, resetMessage]);
  };

  const formatMessage = (content) => {
    return content
      .split('\n')
      .map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir couleur selon le mode
  const getModeColor = (mode) => {
    switch (mode) {
      case 'step_by_step': return '#FF8C00';
      case 'direct_solution': return '#32CD32';
      case 'audio': return '#F59E0B';
      default: return '#6366F1';
    }
  };

  return (
    <div className={`tab-content chat-tab ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="content-header">
        <h2>🤖 Chat Révolutionnaire avec ÉtudIA</h2>
        <p>Votre tuteur IA personnel avec mémoire et modes d'apprentissage adaptatifs !</p>
        
        {/* 🔧 HEADER AMÉLIORÉ AVEC COMPTEUR TOKENS CORRIGÉ */}
        <div className="student-profile-header">
          <div className="student-info">
            <span className="student-name">👤 {prenomEleve} • 🎓 {classeEleve}</span>
            {learningProfile && (
              <span className="learning-style">
                🧠 Style: {learningProfile.style || 'adaptatif'}
              </span>
            )}
            {(documentContext || allDocuments.length > 0) && (
              <span className="document-badge">
                📄 {allDocuments.length > 0 ? 
                  `${allDocuments.length} document(s)` : 
                  'Document analysé'}
              </span>
            )}
          </div>
          
          <div className="status-section">
            <div className="current-mode" style={{ color: getModeColor(chatMode) }}>
              <span className="mode-indicator">
                {chatMode === 'step_by_step' ? '🔁 Étape par Étape' :
                 chatMode === 'direct_solution' ? '✅ Solution Directe' :
                 chatMode === 'audio' ? '🎤 Audio' : '💬 Normal'}
              </span>
              {chatMode === 'step_by_step' && (
                <span className="step-counter">📊 Étape {currentStep}/{totalSteps}</span>
              )}
            </div>
            
            <div className="tokens-display">
              <div className="tokens-bar">
                <div 
                  className="tokens-fill" 
                  style={{ 
                    width: `${Math.min(100, (tokenUsage.used_today / 95000) * 100)}%`,
                    backgroundColor: tokenUsage.used_today > 85000 ? '#EF4444' : 
                                    tokenUsage.used_today > 50000 ? '#F59E0B' : '#32CD32'
                  }}
                ></div>
              </div>
              <span className="tokens-text">
                Tokens: {tokenUsage.used_today.toLocaleString('fr-FR')}/{(95000).toLocaleString('fr-FR')}
              </span>
              <div className="connection-status">
                <div className={`status-dot ${connectionStatus}`}></div>
                <span>{connectionStatus === 'online' ? 'En ligne' : 
                       connectionStatus === 'offline' ? 'Hors ligne' : 'Connexion...'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-container">
        {/* 🔧 HEADER CONTRÔLES AMÉLIORÉ */}
        <div className="chat-header revolutionary">
          <div className="chat-title">
            <span className="title-icon">💬</span>
            <span className="title-text">ÉtudIA - Tuteur IA Révolutionnaire</span>
          </div>
          
          <div className="chat-controls">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`control-button ${isDarkMode ? 'active' : ''}`}
              title="Mode sombre"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button
              onClick={toggleAudioMode}
              className={`control-button audio-btn ${isAudioMode ? 'active' : ''}`}
              title="Mode audio"
            >
              🎤
            </button>
          </div>
        </div>

        {/* 🚀 BOUTONS RÉVOLUTIONNAIRES CORRIGÉS */}
        {chatMode === 'normal' && (
          <div className="revolutionary-buttons">
            <div className="mode-buttons-header">
              <h3>🎯 Choisis ton mode d'apprentissage, {prenomEleve} !</h3>
            </div>
            
            <div className="mode-buttons-grid">
              <button
                onClick={() => setChatMode('normal')}
                className="mode-button normal active"
                disabled={isLoading}
              >
                <div className="mode-icon">💬</div>
                <div className="mode-content">
                  <div className="mode-title">Mode Normal</div>
                  <div className="mode-description">
                    Conversation équilibrée avec ÉtudIA - Ni trop guidé, ni trop direct
                  </div>
                  <div className="mode-benefit">⚖️ Équilibre parfait</div>
                </div>
              </button>

              <button
                onClick={activateStepByStepMode}
                className="mode-button step-by-step"
                disabled={isLoading}
              >
                <div className="mode-icon">🔁</div>
                <div className="mode-content">
                  <div className="mode-title">Explication Étape par Étape</div>
                  <div className="mode-description">
                    Je te guide progressivement à travers chaque étape de résolution
                  </div>
                  <div className="mode-benefit">✨ Compréhension garantie</div>
                </div>
              </button>

              <button
                onClick={activateDirectSolutionMode}
                className="mode-button direct-solution"
                disabled={isLoading}
              >
                <div className="mode-icon">✅</div>
                <div className="mode-content">
                  <div className="mode-title">Solution Finale</div>
                  <div className="mode-description">
                    Je donne directement toutes les solutions complètes de tes exercices
                  </div>
                  <div className="mode-benefit">⚡ Résultats immédiats</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Bouton retour au mode normal */}
        {chatMode !== 'normal' && (
          <div className="mode-reset">
            <button onClick={resetToNormalMode} className="reset-button">
              ↩️ Retour au mode normal
            </button>
          </div>
        )}

        {/* 🔧 ZONE MESSAGES AMÉLIORÉE */}
        <div className="chat-messages enhanced">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${message.type} ${message.mode ? `mode-${message.mode}` : ''}`}
            >
              <div className="message-content">
                {formatMessage(message.content)}
              </div>
              <div className="message-meta">
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
                <div className="message-info">
                  {message.isWelcome && (
                    <span className="message-tag welcome">🎉 Accueil</span>
                  )}
                  {message.hasContext && (
                    <span className="message-tag context">📄 Doc</span>
                  )}
                  {message.mode && message.mode !== 'normal' && (
                    <span className="message-tag mode" style={{ backgroundColor: getModeColor(message.mode) }}>
                      {message.mode === 'step_by_step' ? '🔁 Étapes' :
                       message.mode === 'direct_solution' ? '✅ Solution' :
                       message.mode === 'audio' ? '🎤 Audio' : message.mode}
                    </span>
                  )}
                  {message.tokens > 0 && (
                    <span className="message-tokens">
                      {message.tokens} tokens
                    </span>
                  )}
                  {message.isError && (
                    <span className="message-tag error">⚠️ Erreur</span>
                  )}
                  {message.isOffline && (
                    <span className="message-tag offline">📶 Hors ligne</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 🔧 INDICATEUR CHARGEMENT AMÉLIORÉ */}
          {isLoading && (
            <div className="message-bubble ai loading enhanced">
              <div className="message-content">
                <div className="ai-thinking">
                  <div className="thinking-animation">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <div className="thinking-text">
                    <span className="main-text">🦙 ÉtudIA analyse ta question...</span>
                    {chatMode === 'step_by_step' && (
                      <div className="step-info">📊 Préparation étape {currentStep}/{totalSteps}</div>
                    )}
                    {chatMode === 'direct_solution' && (
                      <div className="step-info">✅ Résolution complète en cours...</div>
                    )}
                    {isAudioMode && (
                      <div className="step-info">🎤 Réponse vocale activée</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Section d'entrée */}
        <div className="chat-input-container">
          {/* Suggestions intelligentes - CORRECTION APPLIQUÉE! */}
          {messages.length <= 2 && !isLoading && (
            <div className="suggestions-container">
              <div className="suggestions-title">
                💡 Questions suggérées pour {prenomEleve} :
              </div>
              <div className="suggestions-grid">
                {getSuggestions().slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 🔧 ZONE SAISIE DARK MODE CORRIGÉE */}
          <div className="chat-input-wrapper revolutionary enhanced">
            <div className="input-container">
              <textarea
                ref={inputRef}
                className="chat-input enhanced"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isRecording ? `🎤 Écoute en cours... Parlez maintenant !` :
                  chatMode === 'step_by_step' ? `${prenomEleve}, pose ta question pour l'étape ${currentStep}...` :
                  chatMode === 'direct_solution' ? `${prenomEleve}, quel exercice résoudre directement ?` :
                  isAudioMode ? `${prenomEleve}, parle (🎙️) ou écris à ÉtudIA...` :
                  `${prenomEleve}, pose une question à ton tuteur IA...`
                }
                disabled={isLoading || isRecording}
                rows={1}
                style={{
                  borderColor: isRecording ? '#F59E0B' : getModeColor(chatMode),
                  backgroundColor: isRecording ? 'rgba(245, 158, 11, 0.1)' : 'white'
                }}
              />
              
              <div className="input-buttons">
                {isAudioMode && (
                  <button
                    className={`voice-button ${isRecording ? 'recording' : ''}`}
                    onClick={startVoiceRecognition}
                    disabled={isLoading || isRecording}
                    title={isRecording ? "Écoute en cours..." : "Parler à ÉtudIA"}
                  >
                    {isRecording ? '🔴' : '🎙️'}
                  </button>
                )}
                
                <button
                  className="send-button enhanced"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading || isRecording}
                  style={{ backgroundColor: getModeColor(chatMode) }}
                >
                  <span className="send-icon">
                    {isLoading ? '⏳' : 
                     isRecording ? '🎤' :
                     chatMode === 'step_by_step' ? '📊' :
                     chatMode === 'direct_solution' ? '✅' : '🚀'}
                  </span>
                </button>
              </div>
            </div>

            <div className="input-hints enhanced">
              {isRecording && (
                <span className="hint recording">🎤 Parlez maintenant ! ÉtudIA vous écoute...</span>
              )}
              {!isRecording && chatMode === 'normal' && (
                <span className="hint normal">💡 Conseil : Choisis un mode d'apprentissage pour une expérience optimisée</span>
              )}
              {!isRecording && chatMode === 'step_by_step' && (
                <span className="hint step">📊 Mode Étape par Étape : Je te guide progressivement vers la solution</span>
              )}
              {!isRecording && chatMode === 'direct_solution' && (
                <span className="hint direct">✅ Mode Solution Directe : Je résous complètement tes exercices</span>
              )}
              {!isRecording && isAudioMode && chatMode === 'normal' && (
                <span className="hint audio">🎤 Mode Audio actif : Parle (🎙️) ou écris à ÉtudIA - Réponses vocales automatiques</span>
              )}
              {tokenUsage.used_today > 85000 && (
                <span className="hint warning">⚠️ Attention : Limite tokens bientôt atteinte ({tokenUsage.remaining.toLocaleString('fr-FR')} restants)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations sur les fonctionnalités */}
      {messages.length <= 2 && (
        <div className="features-showcase">
          <h3>🚀 Fonctionnalités Révolutionnaires d'ÉtudIA</h3>
          
          <div className="features-grid revolutionary">
            <div className="feature-card memory">
              <span className="feature-icon">🧠</span>
              <h4>Mémoire IA Personnalisée</h4>
              <p>ÉtudIA mémorise ton style d'apprentissage et s'adapte automatiquement</p>
              {learningProfile && (
                <div className="profile-info">
                  Style détecté: <strong>{learningProfile.style}</strong>
                </div>
              )}
            </div>
            
            <div className="feature-card modes">
              <span className="feature-icon">🎯</span>
              <h4>Modes d'Apprentissage</h4>
              <p>Choisis entre guidage étape par étape ou solutions directes</p>
              <div className="mode-badges">
                <span className="mode-badge step">🔁 Étape par Étape</span>
                <span className="mode-badge direct">✅ Solution Directe</span>
              </div>
            </div>
                        
            <div className="feature-card audio">
              <span className="feature-icon">🎤</span>
              <h4>Mode Audio Fonctionnel</h4>
              <p>Parle à ÉtudIA avec reconnaissance vocale et écoute ses réponses</p>
              <div className="audio-status">
                {isAudioMode ? (
                  <span className="status-active">🟢 Activé - Clic 🎙️ pour parler</span>
                ) : (
                  <span className="status-available">⚪ Disponible - Clic 🎤 pour activer</span>
                )}
              </div>
            </div>
          </div>

          <div className="personal-stats">
            <h4>📊 Tes Statistiques, {prenomEleve}</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{conversationCount}</span>
                <span className="stat-label">Conversations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{tokenUsage.used_today.toLocaleString('fr-FR')}</span>
                <span className="stat-label">Tokens utilisés</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {allDocuments?.length || (documentContext ? '1' : '0')}
                </span>
                <span className="stat-label">Documents analysés</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {learningProfile?.level || Math.min(5, Math.ceil(conversationCount / 10))}
                </span>
                <span className="stat-label">Niveau IA</span>
              </div>
            </div>
          </div>
        </div>
      )}

<style jsx>{`
  /* 🔧 CORRECTION 1: HEADER CHAT MOBILE RESPONSIVE */
  .chat-header.revolutionary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 1rem 1rem 0 0;
    margin-bottom: 1rem;
    min-height: 60px; /* ✅ Hauteur minimum garantie */
    position: relative;
    overflow: visible; /* ✅ Évite la coupure des boutons */
  }

  .chat-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0; /* ✅ Permet compression */
  }

  .title-icon {
    font-size: 1.5rem;
    flex-shrink: 0; /* ✅ Empêche compression */
  }

  .title-text {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 🔧 CORRECTION 2: BOUTONS CONTRÔLES MOBILES */
  .chat-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0; /* ✅ Empêche compression */
    margin-left: 0.5rem;
  }

  .control-button {
    width: 45px; /* ✅ Taille fixe pour mobile */
    height: 45px; /* ✅ Taille fixe pour mobile */
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    flex-shrink: 0; /* ✅ Empêche compression */
    min-width: 45px; /* ✅ Largeur minimum */
    min-height: 45px; /* ✅ Hauteur minimum */
  }

  .control-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .control-button.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }

  .audio-btn.active {
    background: linear-gradient(135deg, #F59E0B, #F97316);
    animation: pulse-audio 2s infinite;
  }

  @keyframes pulse-audio {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* 🔧 CORRECTION 3: MODES RÉVOLUTIONNAIRES RESPONSIVE */
  .revolutionary-buttons {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
    border: 2px solid rgba(99, 102, 241, 0.2);
    border-radius: 1.5rem;
    padding: 1.5rem; /* ✅ Padding réduit pour mobile */
    margin: 1rem 0;
    backdrop-filter: blur(10px);
  }

  .mode-buttons-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .mode-buttons-header h3 {
    font-size: 1.3rem; /* ✅ Taille réduite pour mobile */
    font-weight: 800;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1.3;
  }

  /* 🔧 CORRECTION 4: GRILLE MODES MOBILE */
  .mode-buttons-grid {
    display: grid;
    grid-template-columns: 1fr; /* ✅ Une colonne sur mobile */
    gap: 1rem;
    max-width: 100%;
  }

  .mode-button {
    background: white;
    border: 2px solid rgba(99, 102, 241, 0.2);
    border-radius: 1rem;
    padding: 1.25rem; /* ✅ Padding réduit */
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    min-height: auto; /* ✅ Hauteur automatique */
    width: 100%; /* ✅ Largeur complète */
    box-sizing: border-box;
  }

  .mode-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
  }

  .mode-button.active {
    border-color: rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  }

  .mode-button.normal {
    border-color: rgba(99, 102, 241, 0.3);
  }

  .mode-button.step-by-step {
    border-color: rgba(255, 140, 0, 0.3);
  }

  .mode-button.direct-solution {
    border-color: rgba(50, 205, 50, 0.3);
  }

  .mode-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* 🔧 CORRECTION 5: CONTENU MODE BUTTONS */
  .mode-content {
    flex: 1;
    text-align: left;
  }

  .mode-title {
    font-size: 1.1rem; /* ✅ Taille réduite */
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .mode-description {
    font-size: 0.9rem; /* ✅ Taille réduite */
    color: #6B7280;
    line-height: 1.4;
    margin-bottom: 0.75rem;
  }

  .mode-benefit {
    font-size: 0.85rem; /* ✅ Taille réduite */
    font-weight: 600;
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
    padding: 0.3rem 0.6rem;
    border-radius: 0.5rem;
    display: inline-block;
  }

  .mode-icon {
    font-size: 2rem; /* ✅ Taille réduite */
    margin-bottom: 0.75rem;
    display: block;
    text-align: center;
  }

  /* 🔧 RESPONSIVE MOBILE SPÉCIFIQUE */
  @media (max-width: 768px) {
    /* Header chat mobile */
    .chat-header.revolutionary {
      padding: 0.75rem;
      min-height: 50px;
    }

    .title-text {
      font-size: 1rem;
    }

    .title-icon {
      font-size: 1.3rem;
    }

    .control-button {
      width: 40px;
      height: 40px;
      font-size: 1.1rem;
      min-width: 40px;
      min-height: 40px;
    }

    /* Modes mobile */
    .revolutionary-buttons {
      padding: 1rem;
      margin: 0.75rem 0;
    }

    .mode-buttons-header h3 {
      font-size: 1.1rem;
      line-height: 1.2;
    }

    .mode-buttons-grid {
      gap: 0.75rem;
    }

    .mode-button {
      padding: 1rem;
    }

    .mode-title {
      font-size: 1rem;
    }

    .mode-description {
      font-size: 0.85rem;
    }

    .mode-benefit {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
    }

    .mode-icon {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }
  }

  /* 🔧 TRÈS PETITS ÉCRANS (< 480px) */
  @media (max-width: 480px) {
    .chat-header.revolutionary {
      padding: 0.5rem;
      flex-wrap: nowrap; /* ✅ Empêche retour à la ligne */
    }

    .title-text {
      font-size: 0.9rem;
    }

    .control-button {
      width: 35px;
      height: 35px;
      font-size: 1rem;
      min-width: 35px;
      min-height: 35px;
      margin-left: 0.25rem;
    }

    .chat-controls {
      gap: 0.25rem;
    }

    .revolutionary-buttons {
      padding: 0.75rem;
      margin: 0.5rem 0;
    }

    .mode-buttons-header h3 {
      font-size: 1rem;
      padding: 0 0.5rem;
    }

    .mode-button {
      padding: 0.75rem;
    }

    .mode-title {
      font-size: 0.95rem;
    }

    .mode-description {
      font-size: 0.8rem;
      line-height: 1.3;
    }

    .mode-benefit {
      font-size: 0.75rem;
    }

    .mode-icon {
      font-size: 1.5rem;
    }
  }

  /* 🔧 TRÈS LARGE ÉCRANS (Desktop) */
  @media (min-width: 1024px) {
    .mode-buttons-grid {
      grid-template-columns: repeat(3, 1fr); /* ✅ 3 colonnes sur desktop */
      gap: 1.5rem;
    }

    .mode-button {
      min-height: 180px; /* ✅ Hauteur fixe desktop */
    }

    .revolutionary-buttons {
      padding: 2rem;
    }
  }

  /* 🔧 ÉCRANS MOYENS (Tablettes) */
  @media (min-width: 768px) and (max-width: 1023px) {
    .mode-buttons-grid {
      grid-template-columns: repeat(2, 1fr); /* ✅ 2 colonnes sur tablette */
      gap: 1.25rem;
    }

    .mode-button:last-child {
      grid-column: span 2; /* ✅ Le 3ème bouton prend 2 colonnes */
    }
  }

  /* 🔧 FIXES POUR DARK MODE */
  .dark-mode .chat-header.revolutionary {
    background: linear-gradient(135deg, #374151, #4B5563);
  }

  .dark-mode .revolutionary-buttons {
    background: linear-gradient(135deg, rgba(55, 65, 81, 0.1), rgba(75, 85, 99, 0.1));
    border-color: rgba(156, 163, 175, 0.3);
  }

  .dark-mode .mode-button {
    background: #374151;
    border-color: rgba(156, 163, 175, 0.3);
    color: #F9FAFB;
  }

  .dark-mode .mode-title {
    color: #F9FAFB;
  }

  .dark-mode .mode-description {
    color: #D1D5DB;
  }

  .dark-mode .mode-benefit {
    background: rgba(16, 185, 129, 0.2);
    color: #34D399;
  }

  /* 🔧 ANIMATIONS FLUIDES */
  .mode-button, .control-button {
    will-change: transform;
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-button, .control-button {
      transition: none;
    }
    
    .audio-btn.active {
      animation: none;
    }
  }

  /* 🔧 FIXES DÉBORDEMENT */
  .revolutionary-buttons {
    overflow: hidden; /* ✅ Évite débordement */
    width: 100%;
    box-sizing: border-box;
  }

  .mode-buttons-grid {
    width: 100%;
    max-width: 100%;
    overflow: hidden; /* ✅ Évite débordement */
  }

  .chat-container {
    overflow-x: hidden; /* ✅ Évite scroll horizontal */
    width: 100%;
    max-width: 100%;
  }

/* 📱 CORRECTION CENTRAGE MODES MOBILE - AJOUTE À LA FIN DU CSS ChatIA.jsx */

/* 🎯 AMÉLIORATION BOUTONS MODES MOBILE */
.mode-button {
  background: white !important;
  border: 2px solid rgba(99, 102, 241, 0.2) !important;
  border-radius: 1rem !important;
  padding: 1.75rem 1.5rem !important; /* Padding augmenté */
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  position: relative !important;
  overflow: hidden !important;
  width: 100% !important;
  box-sizing: border-box !important;
  /* 🎯 CENTRAGE PARFAIT */
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  min-height: 160px !important; /* Hauteur minimum pour mobile */
}

/* 🎨 ICÔNES MODES CENTRÉES ET STYLÉES */
.mode-icon {
  font-size: 2.5rem !important; /* Agrandie */
  margin-bottom: 1rem !important;
  display: block !important;
  text-align: center !important;
  line-height: 1 !important;
  /* 🌟 Effet brillant */
  filter: drop-shadow(0 2px 8px rgba(99, 102, 241, 0.3)) !important;
  transition: all 0.3s ease !important;
}

/* 🎯 CONTENU MODES CENTRÉ */
.mode-content {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  width: 100% !important;
  gap: 0.75rem !important;
}

/* ✨ TITRE MODES STYLÉ */
.mode-title {
  font-size: 1.25rem !important; /* Agrandie */
  font-weight: 800 !important; /* Plus gras */
  color: #1F2937 !important;
  margin: 0 !important;
  line-height: 1.3 !important;
  text-align: center !important;
  /* 🎨 Gradient de couleur */
  background: linear-gradient(135deg, #1F2937, #374151) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  letter-spacing: 0.3px !important;
}

/* 📝 DESCRIPTION MODES STYLÉE */
.mode-description {
  font-size: 1rem !important; /* Agrandie */
  color: #6B7280 !important;
  line-height: 1.5 !important;
  margin: 0 !important;
  text-align: center !important;
  font-weight: 500 !important; /* Plus défini */
  max-width: 100% !important;
  padding: 0 0.5rem !important;
}

/* 🏆 BADGE BÉNÉFICE STYLÉ */
.mode-benefit {
  font-size: 0.9rem !important; /* Agrandie */
  font-weight: 700 !important; /* Plus gras */
  color: #059669 !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1)) !important;
  padding: 0.5rem 1rem !important; /* Padding augmenté */
  border-radius: 0.75rem !important; /* Plus arrondi */
  display: inline-block !important;
  text-align: center !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* 🎨 EFFETS HOVER AMÉLIORÉS */
.mode-button:hover {
  transform: translateY(-5px) scale(1.02) !important;
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.25) !important;
  border-color: rgba(99, 102, 241, 0.4) !important;
}

.mode-button:hover .mode-icon {
  transform: scale(1.1) !important;
  filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4)) !important;
}

.mode-button:hover .mode-title {
  background: linear-gradient(135deg, #6366F1, #8B5CF6) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

/* 🎯 COULEURS SPÉCIFIQUES PAR MODE */
.mode-button.normal:hover {
  border-color: rgba(99, 102, 241, 0.5) !important;
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.3) !important;
}

.mode-button.step-by-step:hover {
  border-color: rgba(255, 140, 0, 0.5) !important;
  box-shadow: 0 15px 35px rgba(255, 140, 0, 0.3) !important;
}

.mode-button.direct-solution:hover {
  border-color: rgba(50, 205, 50, 0.5) !important;
  box-shadow: 0 15px 35px rgba(50, 205, 50, 0.3) !important;
}

/* 🌟 MODE ACTIF HIGHLIGHT */
.mode-button.active {
  border-color: rgba(99, 102, 241, 0.6) !important;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)) !important;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2) !important;
}

.mode-button.active .mode-icon {
  filter: drop-shadow(0 3px 10px rgba(99, 102, 241, 0.4)) !important;
}

/* 📱 RESPONSIVE MOBILE SPÉCIFIQUE */
@media (max-width: 768px) {
  .mode-button {
    min-height: 140px !important; /* Hauteur mobile */
    padding: 1.5rem 1.25rem !important;
  }
  
  .mode-icon {
    font-size: 2.25rem !important; /* Légèrement plus petit sur mobile */
    margin-bottom: 0.75rem !important;
  }
  
  .mode-title {
    font-size: 1.15rem !important;
  }
  
  .mode-description {
    font-size: 0.95rem !important;
    line-height: 1.4 !important;
  }
  
  .mode-benefit {
    font-size: 0.85rem !important;
    padding: 0.4rem 0.8rem !important;
  }
}

/* 📱 TRÈS PETITS ÉCRANS */
@media (max-width: 480px) {
  .mode-button {
    min-height: 130px !important;
    padding: 1.25rem 1rem !important;
  }
  
  .mode-icon {
    font-size: 2rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .mode-title {
    font-size: 1.1rem !important;
    line-height: 1.2 !important;
  }
  
  .mode-description {
    font-size: 0.9rem !important;
    padding: 0 0.25rem !important;
  }
  
  .mode-benefit {
    font-size: 0.8rem !important;
    padding: 0.35rem 0.7rem !important;
  }
}

/* 🌙 DARK MODE MODES */
.dark-mode .mode-button {
  background: #374151 !important;
  border-color: rgba(156, 163, 175, 0.3) !important;
  color: #F9FAFB !important;
}

.dark-mode .mode-title {
  color: #F9FAFB !important;
  background: linear-gradient(135deg, #F9FAFB, #E5E7EB) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.dark-mode .mode-description {
  color: #D1D5DB !important;
}

.dark-mode .mode-benefit {
  background: rgba(16, 185, 129, 0.2) !important;
  color: #34D399 !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
}

.dark-mode .mode-button:hover .mode-title {
  background: linear-gradient(135deg, #6366F1, #8B5CF6) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
  
`}</style>
      
    </div>
  );
};

export default ChatIA;
