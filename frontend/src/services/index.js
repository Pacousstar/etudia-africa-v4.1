// ===================================================================
// 📦 EXPORT CENTRALISÉ DES SERVICES GROQ
// Fichier: src/services/index.js
// ===================================================================

import GroqApiManager from './groqApiManager';
import GroqService from './groqService';

// Export des classes principales
export { GroqApiManager, GroqService };

// Export par défaut du service principal
export default GroqService;
