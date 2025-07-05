// ===================================================================
// 🔑 GESTIONNAIRE MULTI-CLÉS API GROQ POUR ÉtudIA - VERSION CORRIGÉE
// Fichier: src/services/groqApiManager.js
// ===================================================================

class GroqApiManager {
  constructor() {
    // 🔐 Configuration des 5 clés API Groq depuis les variables d'environnement
    this.apiKeys = [
      process.env.REACT_APP_GROQ_API_KEY_1,
      process.env.REACT_APP_GROQ_API_KEY_2,
      process.env.REACT_APP_GROQ_API_KEY_3,
      process.env.REACT_APP_GROQ_API_KEY_4,
      process.env.REACT_APP_GROQ_API_KEY_5
    ].filter(key => key && key !== ''); // Filtre les clés vides

    // Vérification qu'au moins une clé est disponible
    if (this.apiKeys.length === 0) {
      console.warn('⚠️ Aucune clé API Groq configurée - Mode dégradé activé');
      // Continuer avec clé par défaut
      this.apiKeys = ['demo_key_for_development'];
    }

    // 📊 État de chaque clé
    this.keyStatus = this.apiKeys.map((key, index) => ({
      id: index,
      key: key,
      isBlocked: false,
      blockedUntil: null,
      requestCount: 0,
      lastUsed: null,
      errorCount: 0
    }));

    this.currentKeyIndex = 0;
    this.maxRetries = this.apiKeys.length;
    
    console.log(`🔑 GroqApiManager initialisé avec ${this.apiKeys.length} clés API`);
  }

  // 🎯 Obtenir la clé API active
  getCurrentKey() {
    return this.keyStatus[this.currentKeyIndex];
  }

  // 🔄 Rotation vers la clé suivante
  rotateToNextKey() {
    const startIndex = this.currentKeyIndex;
    
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      const currentKey = this.keyStatus[this.currentKeyIndex];
      
      // Vérifier si la clé est disponible
      if (!this.isKeyBlocked(currentKey)) {
        console.log(`🔄 Rotation vers la clé ${this.currentKeyIndex + 1}`);
        return currentKey;
      }
    } while (this.currentKeyIndex !== startIndex);

    // Toutes les clés sont bloquées
    throw new Error('🚫 Toutes les clés API Groq sont temporairement bloquées');
  }

  // ⚠️ Vérifier si une clé est bloquée
  isKeyBlocked(keyInfo) {
    if (!keyInfo.isBlocked) return false;
    
    const now = new Date();
    if (keyInfo.blockedUntil && now < keyInfo.blockedUntil) {
      return true;
    }
    
    // Débloquer la clé si le délai est passé
    keyInfo.isBlocked = false;
    keyInfo.blockedUntil = null;
    keyInfo.errorCount = 0;
    console.log(`✅ Clé ${keyInfo.id + 1} débloquée automatiquement`);
    return false;
  }

  // 🚫 Bloquer une clé temporairement
  blockKey(keyInfo, durationMinutes = 60) {
    keyInfo.isBlocked = true;
    keyInfo.blockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    keyInfo.errorCount++;
    
    console.warn(`🚫 Clé ${keyInfo.id + 1} bloquée pour ${durationMinutes} minutes`);
    
    // Passer à la clé suivante si possible
    try {
      this.rotateToNextKey();
    } catch (error) {
      console.error('❌ Impossible de rotation - toutes les clés sont bloquées');
    }
  }

  // 📊 Enregistrer l'utilisation d'une clé
  recordKeyUsage(keyInfo, success = true) {
    keyInfo.lastUsed = new Date();
    keyInfo.requestCount++;
    
    if (!success) {
      keyInfo.errorCount++;
      
      // Bloquer après 3 erreurs consécutives
      if (keyInfo.errorCount >= 3) {
        this.blockKey(keyInfo, 30); // Bloquer 30 minutes
      }
    } else {
      keyInfo.errorCount = 0; // Reset erreurs en cas de succès
    }
  }

  // 🔑 Obtenir une clé API valide
  async getValidApiKey() {
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      const currentKey = this.getCurrentKey();
      
      if (!this.isKeyBlocked(currentKey)) {
        return currentKey;
      }
      
      try {
        this.rotateToNextKey();
      } catch (error) {
        break; // Toutes les clés sont bloquées
      }
      
      attempts++;
    }
    
    throw new Error('🚫 Aucune clé API Groq disponible actuellement');
  }

  // 📈 Statistiques des clés
  getKeyStatistics() {
    return this.keyStatus.map(key => ({
      keyId: key.id + 1,
      isBlocked: key.isBlocked,
      requestCount: key.requestCount,
      errorCount: key.errorCount,
      lastUsed: key.lastUsed,
      blockedUntil: key.blockedUntil
    }));
  }

  // 🔄 Reset manuel d'une clé
  resetKey(keyIndex) {
    if (keyIndex >= 0 && keyIndex < this.keyStatus.length) {
      const key = this.keyStatus[keyIndex];
      key.isBlocked = false;
      key.blockedUntil = null;
      key.errorCount = 0;
      console.log(`🔄 Clé ${keyIndex + 1} réinitialisée manuellement`);
    }
  }

  // 🔄 Reset toutes les clés
  resetAllKeys() {
    this.keyStatus.forEach((key, index) => {
      key.isBlocked = false;
      key.blockedUntil = null;
      key.errorCount = 0;
    });
    this.currentKeyIndex = 0;
    console.log('🔄 Toutes les clés API ont été réinitialisées');
  }

  // 📊 Obtenir le nombre de clés disponibles
  getAvailableKeysCount() {
    return this.keyStatus.filter(key => !this.isKeyBlocked(key)).length;
  }

  // 🔍 Obtenir des informations détaillées
  getDetailedStatus() {
    return {
      totalKeys: this.apiKeys.length,
      availableKeys: this.getAvailableKeysCount(),
      currentKeyIndex: this.currentKeyIndex + 1,
      keyStatuses: this.getKeyStatistics()
    };
  }
}

export default GroqApiManager;
