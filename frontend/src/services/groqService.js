// ===================================================================
// 🚀 SERVICE GROQ AVEC GESTION MULTI-CLÉS POUR ÉtudIA
// Fichier: src/services/groqService.js
// ===================================================================

import GroqApiManager from './groqApiManager';

class GroqService {
  constructor() {
    this.apiManager = new GroqApiManager();
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  // 🤖 Appel API avec rotation automatique des clés
  async callGroqAPI(messages, options = {}) {
    const maxRetries = this.apiManager.apiKeys.length;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const keyInfo = await this.apiManager.getValidApiKey();
        
        console.log(`🔑 Tentative ${attempt + 1} avec la clé ${keyInfo.id + 1}`);

        const response = await this.makeApiCall(keyInfo.key, messages, options);
        
        // Enregistrer le succès
        this.apiManager.recordKeyUsage(keyInfo, true);
        
        return response;

      } catch (error) {
        lastError = error;
        const currentKey = this.apiManager.getCurrentKey();
        
        console.error(`❌ Erreur avec la clé ${currentKey.id + 1}:`, error.message);

        // Gestion des erreurs spécifiques
        if (this.isQuotaError(error) || this.isRateLimitError(error)) {
          console.warn(`🚫 Quota/Rate limit atteint pour la clé ${currentKey.id + 1}`);
          this.apiManager.blockKey(currentKey, 60); // Bloquer 1 heure
        } else if (this.isAuthError(error)) {
          console.error(`🔐 Erreur d'authentification pour la clé ${currentKey.id + 1}`);
          this.apiManager.blockKey(currentKey, 120); // Bloquer 2 heures
        } else {
          // Erreur temporaire, juste enregistrer
          this.apiManager.recordKeyUsage(currentKey, false);
          try {
            this.apiManager.rotateToNextKey();
          } catch (rotateError) {
            break; // Toutes les clés sont bloquées
          }
        }

        // Attendre avant la prochaine tentative
        if (attempt < maxRetries - 1) {
          await this.delay(1000 * (attempt + 1)); // Délai progressif
        }
      }
    }

    throw new Error(`🚫 Échec après ${maxRetries} tentatives. Dernière erreur: ${lastError?.message}`);
  }

  // 🌐 Effectuer l'appel API réel
  async makeApiCall(apiKey, messages, options) {
    const requestBody = {
      model: options.model || "llama-3.1-70b-versatile",
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1,
      stream: false
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.response = errorData;
      throw error;
    }

    return await response.json();
  }

  // 🔍 Identifier les erreurs de quota
  isQuotaError(error) {
    return error.status === 429 || 
           (error.message && (
             error.message.includes('quota') ||
             error.message.includes('limit exceeded') ||
             error.message.includes('usage limit')
           ));
  }

  // 🔍 Identifier les erreurs de rate limiting
  isRateLimitError(error) {
    return error.status === 429 ||
           (error.message && (
             error.message.includes('rate limit') ||
             error.message.includes('too many requests') ||
             error.message.includes('requests per')
           ));
  }

  // 🔍 Identifier les erreurs d'authentification
  isAuthError(error) {
    return error.status === 401 || 
           error.status === 403 ||
           (error.message && (
             error.message.includes('authorization') ||
             error.message.includes('invalid api key') ||
             error.message.includes('unauthorized')
           ));
  }

  // ⏰ Fonction de délai
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 📊 Obtenir les statistiques
  getStatistics() {
    return this.apiManager.getKeyStatistics();
  }

  // 📊 Obtenir le statut détaillé
  getDetailedStatus() {
    return this.apiManager.getDetailedStatus();
  }

  // 🔄 Réinitialiser les clés
  resetKeys() {
    this.apiManager.resetAllKeys();
  }

  // 🔄 Réinitialiser une clé spécifique
  resetKey(keyIndex) {
    this.apiManager.resetKey(keyIndex);
  }

  // 🔑 Obtenir le nombre de clés disponibles
  getAvailableKeysCount() {
    return this.apiManager.getAvailableKeysCount();
  }

  // 🤖 Méthodes spécifiques pour ÉtudIA

  // 📚 Traitement de document avec IA
  async processDocument(documentText, instruction, options = {}) {
    const messages = [
      {
        role: "system",
        content: "Tu es ÉtudIA, une IA spécialisée dans l'aide aux étudiants africains. Tu dois analyser le document fourni et répondre selon l'instruction donnée."
      },
      {
        role: "user",
        content: `Document à analyser :\n\n${documentText}\n\nInstruction : ${instruction}`
      }
    ];

    return await this.callGroqAPI(messages, {
      model: "llama-3.1-70b-versatile",
      temperature: 0.5,
      max_tokens: 2000,
      ...options
    });
  }

  // 💬 Conversation avec l'IA
  async chat(userMessage, conversationHistory = [], options = {}) {
    const messages = [
      {
        role: "system",
        content: "Tu es ÉtudIA, une IA spécialisée dans l'aide aux étudiants africains. Tu es bienveillant, pédagogique et adapté au contexte éducatif africain."
      },
      ...conversationHistory,
      {
        role: "user",
        content: userMessage
      }
    ];

    return await this.callGroqAPI(messages, {
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500,
      ...options
    });
  }

  // 📝 Génération de résumé
  async generateSummary(text, options = {}) {
    const messages = [
      {
        role: "system",
        content: "Tu es ÉtudIA. Crée un résumé clair et structuré du texte fourni, adapté aux étudiants."
      },
      {
        role: "user",
        content: `Résume ce texte :\n\n${text}`
      }
    ];

    return await this.callGroqAPI(messages, {
      model: "llama-3.1-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000,
      ...options
    });
  }

  // ❓ Génération de questions
  async generateQuestions(text, questionCount = 5, options = {}) {
    const messages = [
      {
        role: "system",
        content: "Tu es ÉtudIA. Génère des questions pertinentes basées sur le texte fourni pour aider les étudiants à réviser."
      },
      {
        role: "user",
        content: `Génère ${questionCount} questions basées sur ce texte :\n\n${text}`
      }
    ];

    return await this.callGroqAPI(messages, {
      model: "llama-3.1-70b-versatile",
      temperature: 0.6,
      max_tokens: 1200,
      ...options
    });
  }
}

export default GroqService;
