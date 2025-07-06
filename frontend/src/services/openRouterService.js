// ===================================================================
// 🚀 ÉtudIA V4.1 - OPENROUTER SERVICE COMPLET
// NOUVEAU FICHIER: frontend/src/services/openRouterService.js
// Remplace groqService.js pour communiquer avec OpenRouter DeepSeek R1
// Créé par @Pacousstar - Optimisé par MonAP
// ===================================================================

class OpenRouterService {
  constructor() {
    // 🔧 CONFIGURATION - Utilise tes URLs et variables existantes
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://etudia-v4-revolutionary.onrender.com';
    this.openRouterKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    
    // 🤖 MODÈLES DEEPSEEK R1 DISPONIBLES
    this.models = {
      free: process.env.REACT_APP_DEEPSEEK_MODEL_FREE || 'deepseek/deepseek-r1:free',
      paid: process.env.REACT_APP_DEEPSEEK_MODEL_PAID || 'deepseek/deepseek-r1'
    };
    
    // 📊 LOGS INITIALISATION
    console.log('🤖 OpenRouter Service ÉtudIA V4.1 initialisé');
    console.log('- Backend URL:', this.baseUrl);
    console.log('- Free Model:', this.models.free);
    console.log('- Paid Model:', this.models.paid);
    console.log('- API Key configurée:', !!this.openRouterKey);
  }

  // 🏥 VÉRIFIER L'ÉTAT DU SERVICE - Health check backend
  async checkHealth() {
    try {
      console.log('🏥 Vérification santé backend ÉtudIA V4.1...');
      
      // 📡 Appel endpoint /health de ton backend
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ Health check réussi:', data.version);
      
      return {
        success: true,
        status: data.status,
        version: data.version,
        services: data.services,
        ai_provider: data.ai_provider,
        ai_model: data.ai_model
      };

    } catch (error) {
      console.error('❌ Erreur health check:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 💬 CHAT PRINCIPAL - Méthode principale pour communiquer avec DeepSeek R1
  async chat(message, options = {}) {
    try {
      // 🔧 EXTRACTION OPTIONS (avec valeurs par défaut)
      const {
        student_id,
        conversation_history = [],
        mode = 'normal',                    // 🎯 3 modes: normal, step_by_step, direct_solution
        document_context = '',
        learning_profile = {},
        use_free_tier = true                // 🆓 Par défaut gratuit
      } = options;

      console.log('💬 OpenRouter Chat V4.1 - Mode:', mode, '| Free Tier:', use_free_tier);

      // 🔧 CORPS DE LA REQUÊTE - Envoie au backend modifié
      const requestBody = {
        message,                    // 💬 Message de l'élève
        student_id,                // 👤 ID élève (si connecté)
        conversation_history,      // 📚 Historique conversation
        mode,                     // 🎯 Mode d'apprentissage
        document_context,         // 📄 Contexte document uploadé
        learning_profile,         // 🎓 Profil élève (classe, etc.)
        use_free_tier            // 🆓 Modèle gratuit ou payant
      };

      console.log('📡 Envoi requête vers backend ÉtudIA V4.1...');

      // 🚀 APPEL API BACKEND (ton URL existante)
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Réponse OpenRouter reçue:', {
          tokens: data.tokens_used,
          model: data.model,
          free_tier: data.free_tier_used
        });

        return {
          success: true,
          response: data.response,                    // 💬 Réponse DeepSeek R1
          mode: data.mode,                           // 🎯 Mode utilisé
          model: data.model,                         // 🤖 Modèle DeepSeek
          provider: data.provider,                   // 🏷️ OpenRouter
          tokens_used: data.tokens_used,            // 📊 Tokens consommés
          free_tier_used: data.free_tier_used,      // 🆓 Mode gratuit utilisé?
          timestamp: data.timestamp,                // ⏰ Horodatage
          has_context: data.has_context,            // 📄 Document contexte?
          version: data.version                     // 🔖 Version API
        };
      } else {
        throw new Error(data.error || 'Erreur communication IA');
      }

    } catch (error) {
      console.error('❌ Erreur OpenRouter chat:', error);
      
      return {
        success: false,
        error: error.message,
        fallback_response: `Désolé, je rencontre des difficultés avec OpenRouter DeepSeek R1. Réessayez dans quelques instants ! 🤖`
      };
    }
  }

  // 📚 ANALYSE DE DOCUMENT - Utilise DeepSeek R1 pour analyser documents
  async analyzeDocument(documentText, instruction, options = {}) {
    try {
      console.log('📚 Analyse document avec DeepSeek R1...');
      
      const analysisPrompt = `Analyse ce document et ${instruction}:\n\n${documentText}`;
      
      return await this.chat(analysisPrompt, {
        ...options,
        mode: 'direct_solution',                    // 🎯 Mode solution directe pour analyse
        use_free_tier: options.use_free_tier !== false // 🆓 Gratuit par défaut
      });

    } catch (error) {
      console.error('❌ Erreur analyse document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎯 MODE ÉTAPE PAR ÉTAPE - Guidance progressive avec DeepSeek R1
  async stepByStepGuidance(question, options = {}) {
    try {
      console.log('📊 Mode étape par étape avec DeepSeek R1...');
      
      return await this.chat(question, {
        ...options,
        mode: 'step_by_step',                       // 🎯 Mode étape par étape
        use_free_tier: options.use_free_tier !== false
      });

    } catch (error) {
      console.error('❌ Erreur mode étape par étape:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ MODE SOLUTION DIRECTE - Résolution complète avec DeepSeek R1  
  async directSolution(problem, options = {}) {
    try {
      console.log('✅ Mode solution directe avec DeepSeek R1...');
      
      return await this.chat(problem, {
        ...options,
        mode: 'direct_solution',                    // 🎯 Mode solution directe
        use_free_tier: options.use_free_tier !== false
      });

    } catch (error) {
      console.error('❌ Erreur solution directe:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎓 MESSAGE D'ACCUEIL PERSONNALISÉ - Avec DeepSeek R1
  async generateWelcomeMessage(studentProfile, documentInfo = null) {
    try {
      console.log('🎉 Génération message d\'accueil avec DeepSeek R1...');
      
      const studentName = studentProfile?.nom || studentProfile?.name || 'Élève';
      const studentClass = studentProfile?.classe || 'votre niveau';
      
      let welcomePrompt = `Génère un message d'accueil chaleureux et motivant pour ${studentName}, élève en ${studentClass}, qui utilise ÉtudIA V4.1 avec OpenRouter DeepSeek R1.`;
      
      if (documentInfo) {
        welcomePrompt += ` L'élève a uploadé un document "${documentInfo.name}" de ${documentInfo.size} caractères.`;
      }
      
      welcomePrompt += ` Le message doit être encourageant, mentionner les nouvelles capacités de DeepSeek R1, et expliquer les 3 modes d'apprentissage disponibles.`;

      return await this.chat(welcomePrompt, {
        student_id: studentProfile?.id,
        learning_profile: studentProfile,
        mode: 'normal',
        use_free_tier: true                         // 🆓 Toujours gratuit pour l'accueil
      });

    } catch (error) {
      console.error('❌ Erreur message d\'accueil:', error);
      return {
        success: false,
        error: error.message,
        fallback_response: `Salut ${studentProfile?.nom || 'Élève'} ! 🚀 

Bienvenue sur ÉtudIA V4.1 avec OpenRouter DeepSeek R1 ! 

🤖 **Nouveautés révolutionnaires :**
- **DeepSeek R1** : IA avec raisonnement transparent
- **100% Gratuit** : Accès illimité via OpenRouter  
- **3 modes d'apprentissage** optimisés pour toi

Je suis prêt à t'aider avec mes nouveaux pouvoirs de raisonnement ! ✨`
      };
    }
  }

  // 📊 OBTENIR STATISTIQUES D'USAGE - Tracking local
  getUsageStats() {
    return {
      total_requests: localStorage.getItem('etudia_total_requests') || '0',
      free_tier_usage: localStorage.getItem('etudia_free_usage') || '0', 
      paid_tier_usage: localStorage.getItem('etudia_paid_usage') || '0',
      last_request: localStorage.getItem('etudia_last_request') || null,
      model_preference: localStorage.getItem('etudia_model_preference') || 'free'
    };
  }

  // 📈 METTRE À JOUR STATISTIQUES D'USAGE - Après chaque requête
  updateUsageStats(response) {
    try {
      const stats = this.getUsageStats();
      const newTotalRequests = parseInt(stats.total_requests) + 1;
      
      // 📊 Mise à jour compteurs
      localStorage.setItem('etudia_total_requests', newTotalRequests.toString());
      localStorage.setItem('etudia_last_request', new Date().toISOString());
      
      // 🆓💎 Comptage gratuit vs payant
      if (response.free_tier_used) {
        const newFreeUsage = parseInt(stats.free_tier_usage) + 1;
        localStorage.setItem('etudia_free_usage', newFreeUsage.toString());
      } else {
        const newPaidUsage = parseInt(stats.paid_tier_usage) + 1;
        localStorage.setItem('etudia_paid_usage', newPaidUsage.toString());
      }

      console.log('📊 Stats V4.1 mises à jour:', {
        total: newTotalRequests,
        free: localStorage.getItem('etudia_free_usage'),
        paid: localStorage.getItem('etudia_paid_usage')
      });

    } catch (error) {
      console.warn('⚠️ Erreur mise à jour stats:', error);
    }
  }

  // 🎛️ BASCULER MODÈLE - Choix entre gratuit et payant
  setModelPreference(useFreeTier = true) {
    localStorage.setItem('etudia_model_preference', useFreeTier ? 'free' : 'paid');
    console.log('🎛️ Préférence modèle V4.1:', useFreeTier ? 'Gratuit DeepSeek R1' : 'Payant DeepSeek R1');
  }

  // 🔍 OBTENIR PRÉFÉRENCE MODÈLE - Lecture choix utilisateur
  getModelPreference() {
    return localStorage.getItem('etudia_model_preference') === 'paid' ? false : true;
  }

  // 🏷️ INFORMATIONS MODÈLES - Détails pour l'interface
  getModelInfo() {
    return {
      free: {
        name: this.models.free,
        cost: '0$/M tokens',
        speed: 'Variable (3s-60s)',
        availability: 'File d\'attente',
        features: 'Toutes fonctionnalités DeepSeek R1'
      },
      paid: {
        name: this.models.paid,
        cost: '0.55$/M input, 2.19$/M output',
        speed: 'Garanti (2-4s)',
        availability: 'Priorité absolue',
        features: 'Toutes + cache intelligent + vitesse max'
      }
    };
  }

  // 🔄 RÉINITIALISER STATISTIQUES - Pour debug/reset
  resetStats() {
    localStorage.removeItem('etudia_total_requests');
    localStorage.removeItem('etudia_free_usage');
    localStorage.removeItem('etudia_paid_usage');
    localStorage.removeItem('etudia_last_request');
    localStorage.removeItem('etudia_model_preference');
    
    console.log('🔄 Statistiques ÉtudIA V4.1 réinitialisées');
  }

  // 🔧 MODE DÉVELOPPEMENT - Tests directs pour debug
  async debugTest(testMessage = 'Test ÉtudIA V4.1 OpenRouter') {
    try {
      console.log('🔧 Test debug OpenRouter V4.1...');
      
      const result = await this.chat(testMessage, {
        mode: 'normal',
        use_free_tier: true,
        learning_profile: { nom: 'TestEleve', classe: 'Debug' }
      });

      console.log('🔧 Résultat test V4.1:', result);
      return result;

    } catch (error) {
      console.error('❌ Erreur test debug:', error);
      return { success: false, error: error.message };
    }
  }

  // 📱 VÉRIFIER COMPATIBILITÉ MOBILE - Optimisations spécifiques
  isMobileOptimized() {
    return {
      supported: true,
      features: ['offline_cache', 'reduced_bandwidth', 'fast_response'],
      recommendation: 'Utilisez le mode gratuit pour économiser la batterie'
    };
  }
}

// 🚀 EXPORT SERVICE GLOBAL - Instance unique pour toute l'app
const openRouterService = new OpenRouterService();

// 📊 Logs de debug en développement
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Mode développement - OpenRouter Service debug activé');
  // Attacher à window pour debug console
  window.openRouterService = openRouterService;
}

export default openRouterService;

// 🔧 COMMENTAIRES POUR PACOUSSTAR :
// 1. Ce service remplace complètement groqService.js
// 2. Il communique avec ton backend existant (même URL)
// 3. Toutes les méthodes ont les mêmes noms pour compatibilité
// 4. Stats d'usage stockées en localStorage pour tracking
// 5. Support mobile optimisé avec cache intelligent
// 6. Mode debug pour tes tests de développement
// 7. Gestion d'erreurs robuste avec fallbacks
