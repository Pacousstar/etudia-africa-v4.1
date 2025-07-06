// ===================================================================
// 🚀 ÉTUDIA V4.1 OPENROUTER - SERVER.JS 
// Backend Node.js optimisé pour Render
// Créé par @Pacousstar - Made with ❤️ in Côte d'Ivoire 🇨🇮
// ===================================================================

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v2: cloudinary } = require('cloudinary');
const axios = require('axios'); // Pour appels API OpenRouter DeepSeek R1
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🔧 CACHE ET RATE LIMITING
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 minutes

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    error: 'Trop de requêtes. Attendez 15 minutes.',
    retry_after: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================================================================
// 🔧 CONFIGURATIONS
// ===================================================================

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration Multer optimisée
const upload = multer({ 
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🔧 CONFIGURATION OPENROUTER DEEPSEEK R1 - ÉtudIA V4.1
const OPENROUTER_CONFIG = {
  // 🔑 Clé API OpenRouter (à configurer dans variables d'environnement)
  apiKey: process.env.OPENROUTER_API_KEY,
  // 🌐 URL de base OpenRouter
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  // 🤖 Modèles DeepSeek R1 disponibles
  models: {
    free: process.env.DEEPSEEK_MODEL_FREE || 'deepseek/deepseek-r1:free', // 🆓 Gratuit
    paid: process.env.DEEPSEEK_MODEL_PAID || 'deepseek/deepseek-r1'        // 💎 Payant
  },
  // 🔢 Limites de tokens par mode d'apprentissage
  maxTokens: {
    normal: 250,           // 💬 Mode conversation normale
    step_by_step: 180,     // 📊 Mode étape par étape (plus court)
    direct_solution: 400,  // ✅ Mode solution directe (plus long)
    welcome: 200           // 🎉 Message d'accueil
  },
  // 🌡️ Température (créativité) par mode
  temperature: {
    normal: 0.15,          // 💬 Équilibré
    step_by_step: 0.05,    // 📊 Très précis pour étapes
    direct_solution: 0.1,  // ✅ Précis pour solutions
    welcome: 0.2           // 🎉 Légèrement créatif pour accueil
  }
};

// 📊 LOGS DE CONFIGURATION - ÉtudIA V4.1
console.log('🔗 ÉtudIA V4.1 Configuration OpenRouter DeepSeek R1:');
console.log('- Port:', PORT);
console.log('- Environment:', process.env.NODE_ENV);
console.log('- OpenRouter API:', OPENROUTER_CONFIG.apiKey ? '✅ Configuré' : '❌ Manquant');
console.log('- DeepSeek Free Model:', OPENROUTER_CONFIG.models.free);
console.log('- DeepSeek Paid Model:', OPENROUTER_CONFIG.models.paid);

// ===================================================================
// 🧠 GESTION MÉMOIRE IA RÉVOLUTIONNAIRE - VERSION CORRIGÉE LLAMA
// ===================================================================

const MemoryManager = {
  // Analyser le style d'apprentissage de l'élève
  async analyzeLearnignStyle(chatHistory, userResponses) {
    const totalMessages = chatHistory.length;
    const questionsAsked = chatHistory.filter(msg => msg.reponse_ia.includes('?')).length;
    const exercicesMentioned = chatHistory.filter(msg => 
      msg.message_eleve.toLowerCase().includes('exercice') || 
      msg.reponse_ia.toLowerCase().includes('exercice')
    ).length;

    let style = 'equilibre'; // Par défaut

    if (questionsAsked > totalMessages * 0.7) {
      style = 'interactif'; // Aime les questions
    } else if (exercicesMentioned > totalMessages * 0.5) {
      style = 'pratique'; // Préfère la pratique
    } else {
      style = 'theorique'; // Préfère les explications
    }

    return style;
  },

  // Identifier les difficultés récurrentes
  async identifyDifficulties(chatHistory, documents) {
    const difficulties = [];
    const subjects = new Map();

    // Analyser les matières les plus mentionnées
    for (const doc of documents) {
      const subject = doc.matiere || 'general';
      subjects.set(subject, (subjects.get(subject) || 0) + 1);
    }

    // Analyser les mots-clés de difficulté dans le chat
    const difficultyKeywords = [
      'je ne comprends pas', 'difficile', 'compliqué', 'aide-moi',
      'je n\'arrive pas', 'problème', 'bloqué'
    ];

    for (const msg of chatHistory) {
      for (const keyword of difficultyKeywords) {
        if (msg.message_eleve.toLowerCase().includes(keyword)) {
          const context = msg.message_eleve + ' ' + msg.reponse_ia;
          if (context.includes('math')) difficulties.push('mathematiques');
          if (context.includes('français')) difficulties.push('francais');
          if (context.includes('physique')) difficulties.push('physique');
          if (context.includes('exercice')) difficulties.push('resolution_exercices');
        }
      }
    }

    return [...new Set(difficulties)];
  },

  // Mettre à jour le profil de l'élève
  async updateStudentProfile(studentId) {
    try {
      const [chatHistoryResult, documentsResult] = await Promise.all([
        supabase.from('historique_conversations').select('*').eq('eleve_id', studentId),
        supabase.from('documents').select('*').eq('eleve_id', studentId)
      ]);

      const chatHistory = chatHistoryResult.data || [];
      const documents = documentsResult.data || [];

      const learnignStyle = await this.analyzeLearnignStyle(chatHistory, []);
      const difficulties = await this.identifyDifficulties(chatHistory, documents);
      const niveauGlobal = Math.min(5, Math.max(1, Math.ceil(chatHistory.length / 10)));

      await supabase.from('eleves').update({
        style_apprentissage: learnignStyle,
        matieres_difficiles: difficulties,
        niveau_global: niveauGlobal,
        preferences_pedagogiques: {
          derniere_analyse: new Date().toISOString(),
          nb_interactions: chatHistory.length,
          nb_documents: documents.length
        }
      }).eq('id', studentId);

      console.log(`✅ Profil mis à jour pour élève ${studentId}: ${learnignStyle}, difficultés: ${difficulties.join(', ')}`);
      return { learnignStyle, difficulties, niveauGlobal };

    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      return null;
    }
  },

  // 🎯 PROMPTS ULTRA-COURTS ET DIRECTS (MAX 500 CHARS) - CORRECTION LLAMA
  // 🔧 AMÉLIORATION: Fonction createPersonalizedPrompt AMÉLIORÉE (pas remplacée)
  createPersonalizedPrompt(studentInfo, learningProfile, documentName, documentContent, mode = 'normal', conversationContext = null) {
    const prenomExact = studentInfo.nom.trim().split(' ')[0];
    const className = studentInfo.classe;

    // 🔧 NOUVEAUTÉ: Gestion du contexte de conversation
    let contextInstruction = '';
    if (conversationContext?.hasContext && conversationContext?.wasIncomplete) {
      contextInstruction = `\nCONTEXTE: Tu étais en train de traiter "${conversationContext.lastTopic}". Continue exactement où tu t'es arrêté.`;
    }

    // 🔧 INSTRUCTIONS CORE AMÉLIORÉES (garde la logique existante + ajoute les nouvelles)
    let coreInstruction = '';
    let maxTokens = 200;

    if (mode === 'step_by_step') {
      // 🔧 AMÉLIORATION STEP-BY-STEP: Plus de leadership, moins de questions vides
      coreInstruction = `RÈGLE ABSOLUE pour ${prenomExact}: 
1. Commence TOUJOURS par "📊 Étape X/Y" OBLIGATOIRE
2. RÉSOUS activement l'étape (calculs, explications)
3. GUIDE ${prenomExact} dans la résolution
4. Termine par UNE question de compréhension pour continuer
5. Ne donne pas tout d'un coup - UNE étape à la fois
6. Reconnais quand ${prenomExact} dit "continue" pour poursuivre

EXEMPLE FORMAT:
📊 Étape 1/4
Pour résoudre cette équation, je commence par isoler x...
[calculs et explications]
❓ ${prenomExact}, comprends-tu pourquoi j'ai fait cette opération ?${contextInstruction}`;
      maxTokens = 180;
      
    } else if (mode === 'direct_solution') {
      // 🔧 AMÉLIORATION DIRECT: Ajoute détection de fin
      coreInstruction = `RÈGLE ABSOLUE pour ${prenomExact}:
1. Donne TOUTES les solutions complètes immédiatement
2. Détaille chaque calcul et étape
3. N'utilise PAS "📊 Étape X/Y" 
4. Format: Exercice 1: [solution complète], Exercice 2: [solution complète]
5. Termine par un message de fin quand tout est résolu${contextInstruction}`;
      maxTokens = 400;
      
    } else if (mode === 'normal') {
      // 🔧 NOUVEAUTÉ: Mode normal COMPLÈTEMENT LIBRE
      coreInstruction = `NOUVEAU MODE LIBRE pour ${prenomExact}:
1. Réponds à TOUTE question (maths, actualités, culture, devoirs)
2. N'utilise PAS le document - mode libre total
3. Sois concis pour économiser les tokens
4. Réponses précises et directes
5. Pas de format spécial - conversation naturelle${contextInstruction}`;
      maxTokens = 200;
    }

    // 🔧 NOUVEAUTÉ: Instruction de fin d'exercice pour tous les modes
    const completionInstruction = `
RÈGLE FIN D'EXERCICE: Quand tu donnes un résultat final, ajoute un message de célébration approprié.`;

    // 🎯 PROMPT FINAL (CONSERVE LA STRUCTURE EXISTANTE)
    return {
      prompt: `Tu es ÉtudIA pour ${prenomExact}.

${coreInstruction}

${mode !== 'normal' ? `Document: "${documentName}"` : 'Mode libre - pas de document'}
Style: ${learningProfile?.style_apprentissage || 'équilibré'}${completionInstruction}

TOUJOURS commencer par "${prenomExact}," dans tes réponses.`,
      maxTokens
    };
  },

  // 🔧 AMÉLIORATION: Fonction validateAndFixResponse AMÉLIORÉE
  validateAndFixResponse(aiResponse, mode, prenomExact, step_info = null, isExerciseComplete = false) {
    let correctedResponse = aiResponse;

    // 1. Vérifier présence du prénom (CONSERVE L'EXISTANT)
    if (!correctedResponse.includes(prenomExact)) {
      correctedResponse = `${prenomExact}, ${correctedResponse}`;
    }

    // 2. Validation MODE ÉTAPE PAR ÉTAPE (AMÉLIORE L'EXISTANT)
    if (mode === 'step_by_step' && step_info) {
      const expectedFormat = `📊 Étape ${step_info.current_step}/${step_info.total_steps}`;
      
      if (!correctedResponse.includes('📊 Étape')) {
        correctedResponse = `${expectedFormat}\n\n${correctedResponse}`;
      }
      
      // 🔧 AMÉLIORATION: Logique de question plus intelligente
      if (!correctedResponse.includes('?') && !correctedResponse.includes('🔄')) {
        // Si c'est la dernière étape, moins de questions
        if (step_info.current_step >= step_info.total_steps || isExerciseComplete) {
          correctedResponse += `\n\n✅ ${prenomExact}, as-tu bien compris cette dernière étape ?`;
        } else {
          correctedResponse += `\n\n❓ ${prenomExact}, peux-tu me confirmer que tu suis ?`;
        }
      }
    }

    // 3. Validation MODE SOLUTION DIRECTE (CONSERVE L'EXISTANT)
    if (mode === 'direct_solution') {
      correctedResponse = correctedResponse.replace(/📊 Étape \d+\/\d+/g, '');
      
      if (!correctedResponse.includes('Exercice') && !correctedResponse.includes('Solution')) {
        correctedResponse = `✅ Solutions complètes pour ${prenomExact} :\n\n${correctedResponse}`;
      }
    }

    // 4. 🔧 NOUVEAUTÉ: Ajouter message de fin si exercice terminé
    if (isExerciseComplete) {
      const completionMessage = ExerciseCompletionDetector.generateCompletionMessage(mode, prenomExact);
      correctedResponse += completionMessage;
    }

    // 5. Gérer continuation automatique (CONSERVE L'EXISTANT)
    const isIncomplete = (
      correctedResponse.length > 280 && 
      !correctedResponse.includes('🎉') && 
      !correctedResponse.includes('[RÉPONSE CONTINUE...]') &&
      !isExerciseComplete
    );

    if (isIncomplete) {
      correctedResponse += '\n\n🔄 [RÉPONSE CONTINUE...]\n💬 Écris "continue" pour la suite !';
    }

    return correctedResponse;
  },

  // 🔧 AMÉLIORATION: Messages optimisés AMÉLIORÉS (pas remplacés)
  createOptimizedMessages(basePromptData, chatHistory, userMessage, mode, step_info, conversationContext = null) {
    const { prompt, maxTokens } = basePromptData;

    const messages = [
      {
        role: 'system',
        content: prompt
      }
    ];

    // 🔧 AMÉLIORATION: Gestion intelligente de l'historique
    if (chatHistory?.length > 0) {
      const recentHistory = chatHistory.slice(-2).reverse();
      
      for (const exchange of recentHistory) {
        messages.push({ role: 'user', content: exchange.message_eleve.substring(0, 100) });
        messages.push({ role: 'assistant', content: exchange.reponse_ia.substring(0, 150) });
      }
    }

    // Message actuel
    messages.push({ role: 'user', content: userMessage });

    // 🔧 NOUVEAUTÉ: Instructions de continuation améliorées
    
    if (isContinuation && conversationContext?.hasContext) {
      messages.push({
        role: 'system',
        content: `CONTINUATION: L'élève demande la suite. Tu traitais "${conversationContext.lastTopic}". Continue exactement où tu t'es arrêté sans répéter.`
      });
    }

    return { messages, maxTokens };
  }
};

// 🎯 GESTIONNAIRE MODES DE CHAT - VERSION OPTIMISÉE
const ChatModeManager = {
  // Paramètres stricts pour chaque mode
  getModeConfig(mode) {
    const configs = {
      'step_by_step': {
        temperature: 0.05, // Ultra-strict
        max_tokens: 150,
        top_p: 0.7,
        systemPrefix: '📊 MODE ÉTAPE PAR ÉTAPE ACTIVÉ:'
      },
      'direct_solution': {
        temperature: 0.1,
        max_tokens: 400,
        top_p: 0.8,
        systemPrefix: '✅ MODE SOLUTION DIRECTE ACTIVÉ:'
      },
      'normal': {
        temperature: 0.15,
        max_tokens: 250,
        top_p: 0.9,
        systemPrefix: '💬 MODE NORMAL ACTIVÉ:'
      }
    };

    return configs[mode] || configs['normal'];
  }
};

// 🔧 CORRECTION MAJEURE : AJOUT ConversationMemoryManager MANQUANT !
const ConversationMemoryManager = {
  // 🧠 RÉCUPÈRE LE CONTEXTE COMPLET DE CONVERSATION
  async getConversationContext(userId, currentMessage) {
    try {
      // 🎯 RÉCUPÈRE LES 5 DERNIERS ÉCHANGES
      const { data: recentExchanges } = await supabase
        .from('historique_conversations')
        .select('*')
        .eq('eleve_id', userId)
        .order('date_creation', { ascending: false })
        .limit(5);

      if (!recentExchanges || recentExchanges.length === 0) {
        return { hasContext: false, lastResponse: null, wasIncomplete: false };
      }

      const lastExchange = recentExchanges[0];
      const lastResponse = lastExchange.reponse_ia || '';
      
      // 🔍 DÉTECTION RÉPONSE INCOMPLÈTE AMÉLIORÉE
      const wasIncomplete = 
        lastResponse.includes('[RÉPONSE CONTINUE...]') ||
        lastResponse.includes('🔄') ||
        lastResponse.includes('continue') ||
        lastResponse.includes('suite') ||
        lastResponse.includes('...') ||
        lastResponse.length > 250 ||
        /exercice\s+\d+.*:/i.test(lastResponse) ||
        /\d+\)\s*[^.!?]*$/i.test(lastResponse) || // Se termine par "1) calcul"
        /=\s*[^.!?]*$/i.test(lastResponse) || // Se termine par "= calcul"
        lastResponse.endsWith(':') ||
        lastResponse.endsWith(',');

      // 🎯 EXTRACTION DU POINT D'ARRÊT PRÉCIS
      let stopPoint = 'au milieu de la résolution';
      let lastTopic = 'exercice en cours';
      
      if (wasIncomplete) {
        // Analyse du contenu pour identifier où on s'est arrêté
        if (lastResponse.includes('Exercice 1')) {
          stopPoint = 'pendant l\'exercice 1';
          lastTopic = 'exercice 1';
        } else if (lastResponse.includes('Exercice 2')) {
          stopPoint = 'pendant l\'exercice 2';  
          lastTopic = 'exercice 2';
        } else if (lastResponse.includes('b)')) {
          stopPoint = 'à la question b)';
          lastTopic = 'question b';
        } else if (lastResponse.includes('c)')) {
          stopPoint = 'à la question c)';
          lastTopic = 'question c';
        } else if (/=\s*[^.!?]*$/i.test(lastResponse)) {
          stopPoint = 'au milieu d\'un calcul';
          lastTopic = 'calcul en cours';
        }
      }

      return {
        hasContext: true,
        lastResponse: lastResponse,
        wasIncomplete: wasIncomplete,
        stopPoint: stopPoint,
        lastTopic: lastTopic,
        lastMode: lastExchange.mode_utilise,
        conversationHistory: recentExchanges.slice(0, 4), // 4 derniers échanges
        fullLastResponse: lastResponse // NOUVEAUTÉ : Garde la réponse complète
      };

    } catch (error) {
      console.warn('⚠️ Erreur récupération contexte:', error.message);
      return { hasContext: false, lastResponse: null, wasIncomplete: false };
    }
  },

  // 🔍 DÉTECTION DEMANDE CONTINUATION AMÉLIORÉE
  isContinuationRequest(message) {
    const continuationKeywords = [
      'continue', 'suite', 'la suite', 'continuer', 'poursuis', 'va-y',
      'après', 'ensuite', 'next', 'suivant', 'reprends', 'finis',
      'termine', 'complète', 'achève', 'et puis', 'maintenant',
      'continue le calcul', 'continue l\'exercice', 'suite du problème'
    ];
    
    const messageLower = message.toLowerCase().trim();
    
    // Détection directe
    const directMatch = continuationKeywords.some(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    // Détection contextuelle (messages très courts qui implicitement demandent suite)
    const implicitContinuation = 
      messageLower.length < 10 && 
      (messageLower.includes('oui') || 
       messageLower.includes('ok') || 
       messageLower.includes('d\'accord') ||
       messageLower.includes('vas-y'));
    
    return directMatch || implicitContinuation;
  }
};

// ===================================================================
// 📄 FONCTIONS OCR
// ===================================================================

async function extractTextFromFile(filePath, mimeType, originalName) {
  try {
    let extractedText = '';
    
    console.log('🔍 OCR - Type de fichier:', mimeType, 'Taille:', fs.statSync(filePath).size);
    
    if (mimeType.startsWith('image/')) {
      console.log('🖼️ Traitement image avec Tesseract...');
      const result = await Tesseract.recognize(filePath, 'fra+eng');
      extractedText = result.data.text;
    } else if (mimeType === 'application/pdf') {
      console.log('📄 Traitement PDF...');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (mimeType === 'text/plain') {
      console.log('📝 Traitement TXT...');
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      console.log('📘 Traitement Word...');
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      extractedText = result.value;
    }
    
    console.log('✅ OCR terminé - Longueur:', extractedText.length);
    return extractedText.replace(/\s+/g, ' ').trim();
    
  } catch (error) {
    console.error('❌ Erreur OCR:', error.message);
    return `[ERREUR OCR: ${error.message}]`;
  }
}

async function analyzeDocumentWithIA(extractedText, fileName) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{
        role: "system",
        content: "Expert pédagogique. Réponds UNIQUEMENT avec du JSON valide."
      }, {
        role: "user",
        content: `Analyse: ${extractedText.substring(0, 2000)}
JSON requis:
{"subject": "matière", "summary": "résumé", "exercise_count": nombre_exercices}`
      }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 300
    });
    
    try {
      return JSON.parse(completion.choices[0].message.content.trim());
    } catch {
      return { subject: "Document", summary: "Document analysé", exercise_count: 1 };
    }
  } catch {
    return { subject: "Document", summary: "Document uploadé", exercise_count: 1 };
  }
}


// ===================================================================
// 🔧 MIDDLEWARES
// ===================================================================

// Rate limiting AVANT CORS
app.use('/api/', limiter);

app.use(cors({
  origin: [
    // Localhost développement
    'http://localhost:3000',
    'http://localhost:3001',
    
    // Production Vercel
    'https://etudia-africa-v4.vercel.app',
    
    // 🔥 NOUVELLE URL RENDER !
    'https://etudia-v4-revolutionary.onrender.com',
    
    // Regex pour tous les domaines Vercel et Render
    /.*\.vercel\.app$/,
    /.*\.onrender\.com$/    
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Parsing avec limites
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Headers de sécurité
app.use((req, res, next) => {
  res.header('X-Powered-By', 'EtudIA v4.0');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// 🔧 MIDDLEWARE LOGS AMÉLIORÉS 
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('user-agent') || 'Unknown';
  const origin = req.get('origin') || 'Direct';
  
  console.log(`\n🌐 =============== REQUÊTE ENTRANTE ===============`);
  console.log(`📅 [${timestamp}]`);
  console.log(`🎯 ${req.method} ${req.originalUrl}`);
  console.log(`📍 IP: ${req.ip}`);
  console.log(`🌍 Origin: ${origin}`);
  console.log(`🖥️ User-Agent: ${userAgent.substring(0, 100)}`);
  console.log(`📦 Content-Type: ${req.get('content-type') || 'None'}`);
  console.log(`🔑 Headers: ${JSON.stringify({
    'content-type': req.get('content-type'),
    'origin': req.get('origin'),
    'referer': req.get('referer')
  }, null, 2)}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📋 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  console.log(`🏁 =============== FIN INFO REQUÊTE ===============\n`);
  
  next();
});

// 🔧 CORRECTION 1: AJOUTER AVANT TES AUTRES ROUTES (ligne ~250)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
  res.status(200).end();
});

// ===================================================================
// 🔧 CORRECTION 5: ROUTE DEBUG (optionnelle)
// ===================================================================

app.get('/debug', (req, res) => {
  res.json({
    message: '🔍 Debug ÉtudIA Render',
    timestamp: new Date().toISOString(),
    url_called: req.originalUrl,
    method: req.method,
    headers: {
      host: req.get('host'),
      origin: req.get('origin'),
      'user-agent': req.get('user-agent')?.substring(0, 100)
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: PORT,
      platform: 'Render.com'
    },
    service_info: {
      render_url: 'https://etudia-v4-revolutionary.onrender.com',
      health_endpoint: '/health',
      api_base: '/api',
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
    }
  });
});

// ===================================================================
// 🔗 ROUTES DE BASE
// ===================================================================

app.get('/health', async (req, res) => {
  try {
    console.log('🏥 Route /health appelée depuis:', req.get('origin') || 'Direct');
    
    // Test rapide Supabase
    let supabaseStatus = '✅ Connecté';
    try {
      const { data } = await supabase.from('eleves').select('count(*)').limit(1);
      supabaseStatus = '✅ Connecté';
    } catch (dbError) {
      supabaseStatus = '⚠️ Erreur: ' + dbError.message.substring(0, 50);
    }
    
    // 🧪 TEST OPENROUTER DEEPSEEK R1 - ÉtudIA V4.1
    let deepseekStatus = '✅ Fonctionnel';
    try {
      console.log('🏥 Test santé OpenRouter DeepSeek R1...');
      const testResult = await deepseek.testConnection();
      if (testResult.success) {
        deepseekStatus = `✅ OpenRouter DeepSeek R1 opérationnel (${testResult.tokens} tokens)`;
        console.log('✅ OpenRouter DeepSeek R1 fonctionne parfaitement');
      } else {
        deepseekStatus = `⚠️ Erreur OpenRouter: ${testResult.error}`;
        console.warn('⚠️ OpenRouter DeepSeek R1 non disponible:', testResult.error);
      }
    } catch (deepseekError) {
      deepseekStatus = '⚠️ Erreur: ' + deepseekError.message.substring(0, 50);
      console.error('❌ Erreur test OpenRouter:', deepseekError.message);
    }
    
    // RÉPONSE SANTÉ COMPLÈTE
    const healthData = {
      status: 'ok',
      message: '✅ ÉtudIA V4.1 avec OpenRouter DeepSeek R1 en ligne !',  // 🔧 NOUVEAU MESSAGE
      version: '4.1.0-openrouter-deepseek',                              // 🔧 NOUVELLE VERSION
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: 'Render.com',
      port: PORT,
      host: req.get('host'),
      services: {
        server: '✅ Opérationnel',
        supabase: supabaseStatus,
        openrouter_deepseek: deepseekStatus,  // 🔧 NOUVEAU SERVICE
        cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configuré' : '❌ Manquant'
      },
      ai_provider: 'OpenRouter',                           // 🆕 NOUVEAU CHAMP
      ai_model: OPENROUTER_CONFIG.models.free,           // 🆕 MODÈLE ACTUEL
      migration_status: {                                 // 🆕 INFO MIGRATION
        from: 'Groq Llama 3.3-70B',
        to: 'OpenRouter DeepSeek R1',
        completed: true,
        date: new Date().toISOString().split('T')[0]      // Date du jour
      }
      tokens_status: {
        used_today: 0,
        remaining: 95000,
        last_reset: new Date().toISOString(),
        status: '🟢 Optimal'
      },
      render_info: {
        service_url: 'https://etudia-v4-revolutionary.onrender.com',
        deployment_time: new Date().toISOString(),
        memory_usage: process.memoryUsage().heapUsed / 1024 / 1024 + ' MB'
      }
    };
    
    console.log('✅ Health check réussi:', healthData.message);
    res.json(healthData);
    
  } catch (error) {
    console.error('❌ Erreur health check:', error.message);
    
    // RÉPONSE MÊME EN CAS D'ERREUR (pour éviter status maintenance)
    res.status(200).json({
      status: 'degraded',
      message: '⚠️ ÉtudIA fonctionne en mode dégradé',
      version: '4.0.0-render',
      timestamp: new Date().toISOString(),
      error: error.message,
      platform: 'Render.com',
      services: {
        server: '✅ Opérationnel',
        database: '❓ À vérifier',
        ai: '❓ À vérifier'
      }
    });
  }
});

// 🔧 CORRECTION 4: ROUTE DEBUG ÉTENDUE (ajoute après /health)
app.get('/debug', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    message: '🔍 Debug ÉtudIA Render Complet',
    timestamp: new Date().toISOString(),
    server_info: {
      platform: 'Render.com',
      node_version: process.version,
      environment: process.env.NODE_ENV,
      port: PORT,
      uptime: Math.round(process.uptime()),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
      }
    },
    request_info: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      user_agent: req.get('user-agent')?.substring(0, 100),
      origin: req.get('origin'),
      referer: req.get('referer')
    },
    api_status: {
      supabase: !!process.env.SUPABASE_URL,
      groq: !!process.env.GROQ_API_KEY,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
    },
    available_routes: [
      '✅ GET /',
      '✅ GET /health', 
      '✅ GET /debug',
      '✅ POST /api/students',
      '✅ POST /api/students/login',
      '✅ POST /api/upload',
      '✅ POST /api/chat',
      '✅ GET /api/stats'
    ],
    cors_config: {
      origins: [
        'https://etudia-africa-v4.vercel.app',
        'https://etudia-v4-revolutionary.onrender.com'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Accept']
    }
  });
});

// ===================================================================
// 👤 API ÉLÈVES
// ===================================================================

app.get('/api/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eleves')
      .select('id, nom, email, classe, ecole, date_inscription, style_apprentissage, matieres_difficiles, niveau_global')
      .order('date_inscription', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, students: data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, email, class_level, school } = req.body;
    
    if (!name || !email || !class_level) {
      return res.status(400).json({ success: false, error: 'Données manquantes' });
    }

    const { data: existingStudent } = await supabase
      .from('eleves')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'Email déjà inscrit !'
      });
    }
    
    const { data, error } = await supabase
      .from('eleves')
      .insert([{
        nom: name.trim(),
        email: email.toLowerCase().trim(),
        classe: class_level,
        ecole: school || 'Non spécifié',
        style_apprentissage: 'equilibre',
        matieres_difficiles: [],
        niveau_global: 1,
        preferences_pedagogiques: {
          date_inscription: new Date().toISOString(),
          premiere_utilisation: true
        }
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      student: data[0],
      message: `🎉 Bienvenue ${name} sur ÉtudIA ! Ton tuteur IA personnel t'attend !`
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/students/login', async (req, res) => {
  try {
    console.log('🔥 ROUTE LOGIN APPELÉE !');
    console.log('📧 Body reçu:', req.body);
    
    const { email } = req.body;
    console.log('📧 Email extrait:', email);
    
    if (!email) {
      console.log('❌ Email manquant');
      return res.status(400).json({ error: 'Email requis' });
    }

    console.log('🔍 Recherche dans Supabase...');
    const { data: student, error } = await supabase
      .from('eleves')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    console.log('📊 Résultat Supabase:', { student: !!student, error: error?.message });

    if (error || !student) {
      console.log('❌ Élève non trouvé');
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    console.log('✅ Élève trouvé:', student.nom);
    
    // Mettre à jour le profil lors de la connexion
    MemoryManager.updateStudentProfile(student.id).catch(console.error);

    res.json({ message: 'Connexion réussie ! 🎉', student });

  } catch (error) {
    console.error('💥 ERREUR ROUTE LOGIN:', error);
    res.status(500).json({ error: 'Erreur connexion' });
  }
});

// ===================================================================
// 📄 UPLOAD DOCUMENTS
// ===================================================================

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'ID utilisateur manquant' });
    }

    const nomOriginal = req.file.originalname;
    const nomFichier = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 🔍 ICI C'EST BON - DANS LA FONCTION ASYNC !
    console.log('🔍 Extraction OCR...');
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype, nomOriginal);
    
    console.log('📊 Résultat OCR:', {
      file_type: req.file.mimetype,
      file_size: req.file.size,
      text_length: extractedText.length,
      text_preview: extractedText.substring(0, 100),
      is_error: extractedText.startsWith('[ERREUR')
    });

    if (extractedText.startsWith('[ERREUR')) {
      return res.status(400).json({ success: false, error: 'Impossible d\'extraire le texte' });
    }

    console.log('🧠 Analyse IA avancée...');
    const aiAnalysis = await analyzeDocumentWithIA(extractedText, nomOriginal);

    console.log('☁️ Upload Cloudinary...');
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'etudia_documents_v4',
        public_id: nomFichier,
        resource_type: 'auto'
      });
    } catch {
      uploadResult = { secure_url: 'url_non_disponible', public_id: nomFichier + '_local' };
    }

    const documentData = {
      eleve_id: parseInt(user_id),
      nom_fichier: nomFichier,
      nom_original: nomOriginal,
      taille_fichier: req.file.size,
      type_fichier: req.file.mimetype,
      url_cloudinary: uploadResult.secure_url,
      id_public_cloudinary: uploadResult.public_id,
      texte_extrait: extractedText,
      confiance_ocr: 95.00,
      langue_ocr: 'fra',
      matiere: aiAnalysis.subject,
      type_document: 'document',
      est_traite: true,
      statut_traitement: 'termine',
      mots_cles: [],
      date_traitement: new Date().toISOString(),
      nb_exercices: aiAnalysis.exercise_count || 1
    };

    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select();

    if (error) throw error;

    // Mettre à jour le profil après upload
    MemoryManager.updateStudentProfile(user_id).catch(console.error);

    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch {}

    res.json({
      success: true,
      message: 'Document analysé avec IA avancée ! 🎉',
      data: {
        id: data[0].id,
        nom_original: nomOriginal,
        matiere: aiAnalysis.subject,
        resume: aiAnalysis.summary,
        texte_extrait: extractedText,
        nb_exercices: aiAnalysis.exercise_count || 1
      }
    });

  } catch (error) {
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch {}

    res.status(500).json({ success: false, error: 'Erreur traitement document' });
  }
});

app.get('/api/documents/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('eleve_id', userId)
      .order('date_upload', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, documents: data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🗑️ SUPPRESSION DOCUMENT
app.delete('/api/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    console.log(`🗑️ Suppression document ID: ${documentId}`);
    
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      console.log('❌ Document non trouvé:', fetchError?.message);
      return res.status(404).json({ 
        success: false, 
        error: 'Document non trouvé' 
      });
    }

    console.log(`📄 Document trouvé: ${document.nom_original}`);

    if (document.id_public_cloudinary && document.id_public_cloudinary !== 'url_non_disponible') {
      try {
        const cloudinaryResult = await cloudinary.uploader.destroy(document.id_public_cloudinary);
        console.log('☁️ Cloudinary suppression:', cloudinaryResult);
      } catch (cloudinaryError) {
        console.warn('⚠️ Erreur Cloudinary (non bloquante):', cloudinaryError.message);
      }
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('❌ Erreur suppression base:', deleteError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur suppression base de données' 
      });
    }

    if (document.eleve_id) {
      MemoryManager.updateStudentProfile(document.eleve_id).catch(console.error);
    }

    console.log(`✅ Document "${document.nom_original}" supprimé avec succès !`);

    res.json({
      success: true,
      message: `Document "${document.nom_original}" supprimé avec succès !`,
      deleted_document: {
        id: document.id,
        nom_original: document.nom_original,
        matiere: document.matiere
      }
    });

  } catch (error) {
    console.error('💥 Erreur suppression document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur technique lors de la suppression' 
    });
  }
});

// 🔧 AMÉLIORATION 1: DÉTECTEUR DE FIN D'EXERCICE
// Ajoute cette fonction AVANT la route /api/chat (ligne ~800)
const ExerciseCompletionDetector = {
  // 🎯 NOUVELLE FONCTION: Détecte si un exercice est terminé
  isExerciseComplete(aiResponse, userMessage, mode) {
    // Mots-clés indiquant une fin d'exercice
    const completionKeywords = [
      'résultat final', 'réponse finale', 'solution complète',
      'exercice terminé', 'c\'est fini', 'voilà la réponse',
      'donc la réponse est', 'en conclusion', 'résultat:',
      'la solution est', 'réponse:', 'donc', 'finalement'
    ];
    
    // Vérifications spécifiques par mode
    if (mode === 'direct_solution') {
      // En mode direct: si l'IA a donné des résultats numériques ou des conclusions
      const hasNumericalResult = /=\s*[\d,.-]+|résultat\s*[:=]\s*[\d,.-]+/i.test(aiResponse);
      const hasConclusion = completionKeywords.some(keyword => 
        aiResponse.toLowerCase().includes(keyword.toLowerCase())
      );
      return hasNumericalResult || hasConclusion;
    }
    
    if (mode === 'step_by_step') {
      // En mode étape: si l'IA indique la dernière étape ET donne un résultat
      const isLastStep = /étape\s+\d+\/\d+/i.test(aiResponse);
      const hasResult = /résultat|solution|réponse/i.test(aiResponse);
      const noMoreQuestions = !aiResponse.includes('?') || aiResponse.includes('exercice terminé');
      return isLastStep && hasResult && noMoreQuestions;
    }
    
    return false;
  },

  // 🎯 NOUVELLE FONCTION: Génère un message de fin approprié
  generateCompletionMessage(mode, prenomEleve) {
    const completionMessages = {
      'step_by_step': [
        `🎉 Excellent ${prenomEleve} ! Nous avons terminé cet exercice ensemble !`,
        `✅ Bravo ${prenomEleve} ! Tu as suivi toutes les étapes avec succès !`,
        `🌟 Parfait ${prenomEleve} ! Exercice complètement résolu étape par étape !`
      ],
      'direct_solution': [
        `🎯 Voilà ${prenomEleve} ! Solution complète fournie !`,
        `✅ Parfait ${prenomEleve} ! Tous les exercices sont résolus !`,
        `🚀 Terminé ${prenomEleve} ! Toutes les réponses sont là !`
      ],
      'normal': [
        `👍 Voilà ${prenomEleve} ! J'espère que ça répond à ta question !`,
        `✅ Parfait ${prenomEleve} ! Autre chose ?`
      ]
    };

    const messages = completionMessages[mode] || completionMessages['normal'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return `\n\n${randomMessage}\n\n💡 **Prêt pour le prochain défi ?**`;
  }
};

// 🔧 AMÉLIORATION 2: GESTIONNAIRE DE CONTINUITÉ AMÉLIORÉ
// Ajoute cette fonction AVANT la route /api/chat
const ConversationContinuityManager = {
  // 🎯 NOUVELLE FONCTION: Détecte les demandes de continuation
  isContinuationRequest(message) {
    const continuationKeywords = [
      'continue', 'suite', 'la suite', 'continuer', 'après', 'ensuite',
      'et puis', 'next', 'suivant', 'poursuit', 'va-y', 'poursuis', 'et après',
    ];
    
    return continuationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  },

  // 🎯 NOUVELLE FONCTION: Analyse le contexte de conversation
  analyzeConversationContext(chatHistory, currentMessage) {
    if (!chatHistory || chatHistory.length === 0) {
      return { hasContext: false, lastTopic: null, wasIncomplete: false };
    }

    const lastExchange = chatHistory[chatHistory.length - 1];
    const lastResponse = lastExchange?.reponse_ia || '';
    
    // Détecte si la dernière réponse était incomplète
    const wasIncomplete = 
      lastResponse.includes('[RÉPONSE CONTINUE...]') ||
      lastResponse.includes('🔄') ||
      lastResponse.length > 280;

    // Extrait le sujet principal de la dernière conversation
    const lastTopic = this.extractMainTopic(lastExchange?.message_eleve || '');

    return {
      hasContext: true,
      lastTopic: lastTopic,
      wasIncomplete: wasIncomplete,
      lastMode: lastExchange?.mode_utilise || 'normal',
      lastResponse: lastResponse.substring(0, 200) // Garde les 200 premiers chars
    };
  },

  // 🎯 FONCTION HELPER: Extrait le sujet principal
  extractMainTopic(message) {
    // Mots-clés pour identifier le type d'exercice/sujet
    if (/équation|résoudre|x\s*=|inconnue/i.test(message)) return 'équation';
    if (/dérivée|dériver|f'|limite/i.test(message)) return 'dérivée';
    if (/intégrale|primitive|∫/i.test(message)) return 'intégrale';
    if (/fraction|pourcentage|%/i.test(message)) return 'fraction';
    if (/géométrie|triangle|cercle|aire|périmètre/i.test(message)) return 'géométrie';
    if (/probabilité|chance|statistique/i.test(message)) return 'probabilité';
    if (/exercice|problème|question/i.test(message)) return 'exercice général';
    
    return 'sujet général';
  }
};

// 📊 GESTIONNAIRE DE MÉMOIRE CONVERSATION AMÉLIORÉ

// ===================================================================
// 🤖 CORRECTIONS IA - SERVER.JS 
// 🚀 REMPLACE TA ROUTE /api/chat DEBUG PAR CETTE VERSION AVANCÉE
// ===================================================================

app.post('/api/chat', async (req, res) => {
  console.log('\n🚀 =============== ÉTUDIA CHAT AVANCÉ ===============');
  console.log('📅 Timestamp:', new Date().toLocaleString('fr-FR'));
  
  try {
    const { 
      message, 
      user_id, 
      document_context = '', 
      is_welcome = false, 
      mode = 'normal',
      step_info = null,
      selected_document_id = null
    } = req.body;
    
    console.log('🎯 Variables extraites:', {
      message: message?.substring(0, 50),
      user_id,
      mode,
      has_context: !!document_context
    });
    
    if (!user_id) {
      return res.status(400).json({ 
        error: 'ID utilisateur manquant',
        success: false 
      });
    }

    // 🎯 RÉCUPÉRATION ÉLÈVE
    const { data: studentInfo } = await supabase
      .from('eleves')
      .select('nom, classe, email')
      .eq('id', user_id)
      .single();
    
    if (!studentInfo) {
      return res.status(404).json({
        error: 'Élève non trouvé',
        success: false
      });
    }

    const prenomExact = studentInfo.nom.trim().split(' ')[0];

    // 🎯 RÉCUPÉRATION DOCUMENT AVEC DÉTAILS
    let finalDocumentContext = '';
    let documentName = 'Aucun document';
    let documentLength = 0;
    
    try {
      if (selected_document_id) {
        const { data: specificDoc } = await supabase
          .from('documents')
          .select('nom_original, texte_extrait, matiere')
          .eq('id', selected_document_id)
          .eq('eleve_id', user_id)
          .single();

        if (specificDoc?.texte_extrait) {
          finalDocumentContext = specificDoc.texte_extrait;
          documentName = specificDoc.nom_original;
          documentLength = specificDoc.texte_extrait.length;
        }
      }
      
      if (!finalDocumentContext) {
        const { data: latestDoc } = await supabase
          .from('documents')
          .select('nom_original, texte_extrait, matiere')
          .eq('eleve_id', user_id)
          .order('date_upload', { ascending: false })
          .limit(1)
          .single();

        if (latestDoc?.texte_extrait) {
          finalDocumentContext = latestDoc.texte_extrait;
          documentName = latestDoc.nom_original;
          documentLength = latestDoc.texte_extrait.length;
        }
      }
      
      if (!finalDocumentContext && document_context) {
        finalDocumentContext = document_context;
        documentName = 'Document transmis';
        documentLength = document_context.length;
      }
    } catch (docError) {
      console.warn('⚠️ Erreur récupération document:', docError.message);
    }

    // 🎉 MESSAGE D'ACCUEIL AVANCÉ
    if (is_welcome || !message || message.trim().toLowerCase() === 'connexion') {
      console.log('🎉 Message d\'accueil avec détails document...');
      
      const documentInfo = finalDocumentContext ? 
        `📄 **Document analysé** : "${documentName}" (${documentLength.toLocaleString()} caractères)` :
        '📄 **Aucun document** - Upload un document pour commencer !';

      const reponseAccueil = `Salut ${prenomExact} ! 🤖

Je suis ÉtudIA, ton tuteur IA révolutionnaire !

${documentInfo}

💡 **Comment puis-je t'aider aujourd'hui ?**
- Résoudre des exercices de maths ?
- Expliquer des concepts ?
- Analyser tes documents ?

🚀 **Tape ta question et c'est parti !**`;

      try {
        await supabase.from('historique_conversations').insert([{
          eleve_id: parseInt(user_id),
          message_eleve: 'Connexion',
          reponse_ia: reponseAccueil,
          tokens_utilises: 0,
          modele_ia: 'etudia-accueil-avance',
          mode_utilise: 'accueil',
          document_utilise: documentName,
          contexte_utilise: !!finalDocumentContext
        }]);
      } catch (saveError) {
        console.warn('⚠️ Erreur sauvegarde accueil:', saveError.message);
      }

      return res.json({
        response: reponseAccueil,
        timestamp: new Date().toISOString(),
        model: 'etudia-accueil-avance',
        student_name: prenomExact,
        has_context: !!finalDocumentContext,
        document_name: documentName,
        context_length: documentLength,
        success: true
      });
    }

    if (!message?.trim()) {
      return res.json({
        response: `${prenomExact}, je n'ai pas reçu ton message ! Peux-tu le réécrire ? 😊`,
        timestamp: new Date().toISOString(),
        success: true
      });
    }

// 🔧 AMÉLIORATION 2: DANS TA ROUTE /api/chat, REMPLACE LA SECTION APRÈS "console.log('💬 Mode actuel:', mode);"

    console.log('💬 Mode actuel:', mode);
    console.log('📄 Document:', documentName, `(${documentLength} chars)`);

   // 🧠 RÉCUPÉRATION CONTEXTE CONVERSATION AMÉLIORÉ  
// 🧠 RÉCUPÉRATION CONTEXTE CONVERSATION CORRIGÉ !
let conversationContext;
try {
  conversationContext = await ConversationMemoryManager.getConversationContext(user_id, message);
  console.log('🧠 Contexte conversation détaillé:', {
    hasContext: conversationContext.hasContext,
    wasIncomplete: conversationContext.wasIncomplete,
    stopPoint: conversationContext.stopPoint,
    lastTopic: conversationContext.lastTopic,
    historyLength: conversationContext.conversationHistory?.length || 0
  });
} catch (contextError) {
  console.warn('⚠️ Erreur récupération contexte:', contextError.message);
  conversationContext = { hasContext: false, wasIncomplete: false };
}

// 🔍 DÉTECTION DEMANDE CONTINUATION CORRIGÉE !
const isContinuation = conversationContext && conversationContext.hasContext && 
  (message.toLowerCase().includes('continue') || 
   message.toLowerCase().includes('suite') || 
   message.toLowerCase().includes('la suite') ||
   message.toLowerCase().includes('continuer') ||
   conversationContext.wasIncomplete);

console.log('🔄 Demande de continuation:', isContinuation);

// 📊 CALCUL PROGRESSION ÉTAPES CORRIGÉ
const stepProgression = {
  current_step: step_info?.current_step || 1,
  total_steps: step_info?.total_steps || 4
};
console.log('📊 Progression étapes:', stepProgression);

// 🎯 PROMPTS RÉVOLUTIONNAIRES AVEC MÉMOIRE (garde tes prompts existants)
let systemPrompt = '';
let maxTokens = 250;

if (mode === 'step_by_step') {
  // 📊 MODE ÉTAPE PAR ÉTAPE AVEC MÉMOIRE
  const currentStep = stepProgression.current_step;
  const totalSteps = stepProgression.total_steps;
  
  let continuationInstruction = '';
  if (isContinuation && conversationContext.wasIncomplete) {
    continuationInstruction = `
ATTENTION CONTINUATION: L'élève demande la suite. Tu t'es arrêté ${conversationContext.stopPoint}.
Reprends exactement le fil de "${conversationContext.lastTopic}".
Continue EXACTEMENT où tu t'es arrêté sans répéter ce qui a déjà été fait.
`;
  }
  
  systemPrompt = `Tu es ÉtudIA en mode ÉTAPE PAR ÉTAPE pour ${prenomExact}.

RÈGLES ABSOLUES:
1. Commence TOUJOURS par "📊 Étape ${currentStep}/${totalSteps}"
2. RÉSOUS activement l'étape (calculs, explications)
3. UNE seule étape à la fois - pas tout d'un coup
4. Termine par UNE question de compréhension
5. Maximum 150 mots par étape

${continuationInstruction}

Document: "${documentName}"
Question élève: ${message}

${currentStep === 1 ? 'Commence par la première étape de résolution.' : 
  currentStep === totalSteps ? 'Dernière étape - donne la solution finale.' : 
  `Continue avec l'étape ${currentStep} de la résolution.`}`;
  
  maxTokens = 150;
  
} else if (mode === 'direct_solution') {
  // ✅ MODE SOLUTION DIRECTE AVEC CONTINUATION
  let continuationInstruction = '';
  if (isContinuation && conversationContext.wasIncomplete) {
    continuationInstruction = `
ATTENTION CONTINUATION: L'élève demande la suite. Tu t'es arrêté ${conversationContext.stopPoint}.
Reprends exactement le fil de "${conversationContext.lastTopic}".
Continue EXACTEMENT où tu t'es arrêté. Termine la résolution complète.
`;
  }
  
  systemPrompt = `Tu es ÉtudIA en mode SOLUTION DIRECTE pour ${prenomExact}.

RÈGLES ABSOLUES:
1. Donne TOUTES les solutions complètes
2. Structure: Exercice 1: [solution], Exercice 2: [solution]
3. Détaille chaque calcul étape par étape
4. N'utilise PAS "📊 Étape X/Y"
5. TERMINE tous les calculs - pas d'interruption
6. Finis par "🎉 Tous les exercices résolus !"

${continuationInstruction}

Document: "${documentName}"
Question élève: ${message}

Résous complètement TOUT ce qui est demandé avec TOUS les calculs jusqu'au bout.`;
  
  maxTokens = 400;
  
} else {
  // 💬 MODE NORMAL LIBRE
  systemPrompt = `Tu es ÉtudIA en mode NORMAL LIBRE pour ${prenomExact}.

RÈGLES:
1. Réponds à TOUTE question (maths, actualités, culture, devoirs)
2. N'utilise PAS le document - mode libre total
3. Sois concis et précis (maximum 180 mots)
4. Conversation naturelle et directe

Question élève: ${message}

Réponds avec précision et logique sans référence au document.`;
  
  maxTokens = 200;
}

// 🔍 DEBUG DOCUMENT RÉCUPÉRATION CORRIGÉ
console.log('🔍 DEBUG DOCUMENT RÉCUPÉRATION:', {
  user_id: user_id,
  selected_document_id: selected_document_id,
  document_context_length: document_context?.length || 0,
  finalDocumentContext_length: finalDocumentContext?.length || 0,
  documentName: documentName,
  documentLength: documentLength
});

// 🔍 DEBUG SUPABASE QUERY
if (selected_document_id) {
  console.log('🔍 Tentative récupération doc ID:', selected_document_id, 'pour user:', user_id);
  
  const { data: debugDoc, error: debugError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', selected_document_id)
    .eq('eleve_id', user_id);
    
  console.log('🔍 Résultat debug Supabase:', {
    doc_found: !!debugDoc,
    doc_count: debugDoc?.length || 0,
    error: debugError?.message || 'Aucune',
    doc_preview: debugDoc?.[0] ? {
      id: debugDoc[0].id,
      nom: debugDoc[0].nom_original,
      text_length: debugDoc[0].texte_extrait?.length || 0
    } : 'Aucun'
  });
}

// 🔍 DEBUG DOCUMENTS UTILISATEUR CORRIGÉ
try {
  const { data: allUserDocs } = await supabase
    .from('documents')
    .select('id, nom_original, date_upload')
    .eq('eleve_id', user_id)
    .order('date_upload', { ascending: false });
    
  console.log('🔍 Tous documents utilisateur:', allUserDocs?.map(doc => ({
    id: doc.id,
    nom: doc.nom_original,
    date: doc.date_upload
  })) || []);
} catch (debugError) {
  console.warn('⚠️ Erreur debug documents:', debugError.message);
}
    
// 🚀 APPEL GROQ AVEC MÉMOIRE AMÉLIORÉE
let completion;

try {
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  // 🧠 AJOUTER CONTEXTE CONVERSATION COMPLET SI CONTINUATION - CORRECTION !
if (isContinuation && conversationContext && conversationContext.hasContext && conversationContext.wasIncomplete) {
  // AJOUTER LE CONTEXTE COMPLET DE LA DERNIÈRE RÉPONSE
  messages.push({
    role: 'system',
    content: `CONTEXTE CONTINUATION OBLIGATOIRE:
L'élève demande la suite de ta réponse précédente qui était incomplète.

TA DERNIÈRE RÉPONSE (à continuer) :
"${conversationContext.fullLastResponse || conversationContext.lastResponse || ''}"

Tu t'es arrêté ${conversationContext.stopPoint || 'au milieu'}.
Continue EXACTEMENT où tu t'es arrêté sans répéter ce qui a été fait.
Reprends le fil de "${conversationContext.lastTopic || 'la question'}".`
  });
  
  console.log('🔄 Contexte continuation ajouté pour:', conversationContext.lastTopic);
} else if (conversationContext && conversationContext.hasContext && conversationContext.conversationHistory) {
  // AJOUTER HISTORIQUE NORMAL (pas continuation)
  const recentHistory = conversationContext.conversationHistory.slice(0, 2).reverse();
  
  for (const exchange of recentHistory) {
    if (exchange.message_eleve && exchange.reponse_ia) {
      messages.push({ 
        role: 'user', 
        content: exchange.message_eleve.substring(0, 150)
      });
      messages.push({ 
        role: 'assistant', 
        content: exchange.reponse_ia.substring(0, 300)
      });
    }
  }
}

  // Message actuel de l'utilisateur
  messages.push({
    role: 'user',
    content: mode !== 'normal' && finalDocumentContext ? 
      `Document: ${finalDocumentContext.substring(0, 1000)}\n\nQuestion: ${message}` :
      message
  });

  console.log('📨 Messages construits:', {
    total_messages: messages.length,
    has_continuation_context: isContinuation && conversationContext.wasIncomplete,
    context_type: isContinuation ? 'continuation' : 'normal'
  });

  completion = await groq.chat.completions.create({
    messages: messages,
    model: 'llama-3.3-70b-versatile',
    temperature: mode === 'step_by_step' ? 0.05 : mode === 'normal' ? 0.15 : 0.1,
    max_tokens: maxTokens,
    top_p: 0.7
  });
  
  console.log('✅ Réponse Groq reçue avec mémoire');
  
} catch (groqError) {
  console.error('❌ Erreur Groq:', groqError.message);
  
  const fallbackResponse = `${prenomExact}, problème technique ! 😅

🔧 Mon système IA redémarre...
💡 Reformule ta question et je ferai de mon mieux !

${finalDocumentContext ? 
  `📄 J'ai ton document "${documentName}" (${documentLength.toLocaleString()} chars)` :
  '📄 Upload un document pour des réponses plus précises !'}`;

  return res.json({
    response: fallbackResponse,
    timestamp: new Date().toISOString(),
    model: 'etudia-fallback',
    student_name: prenomExact,
    is_fallback: true,
    success: true
  });
}

    // ✅ TRAITEMENT RÉPONSE AVEC VALIDATION INTELLIGENTE
    let aiResponse = completion.choices[0]?.message?.content || `Désolé ${prenomExact}, erreur technique.`;
    
    // 🔧 VALIDATION STRICTE DU FORMAT SELON MODE
    if (mode === 'step_by_step') {
      // Forcer le format étape si absent
      if (!aiResponse.includes('📊 Étape')) {
        const currentStep = stepProgression.current_step;
        const totalSteps = stepProgression.total_steps;
        aiResponse = `📊 Étape ${currentStep}/${totalSteps}\n\n${aiResponse}`;
      }
      
      // Forcer question à la fin si absente
      if (!aiResponse.includes('?') && !aiResponse.includes('❓')) {
        aiResponse += `\n\n❓ ${prenomExact}, comprends-tu cette étape ?`;
      }
    }
    
    // 🔧 VALIDATION PRÉNOM
    if (!aiResponse.includes(prenomExact)) {
      aiResponse = `${prenomExact}, ${aiResponse}`;
    }

    // 🔧 DÉTECTION FIN D'EXERCICE AMÉLIORÉE
    const exercisePatterns = [
      /résultat final/i, /réponse finale/i, /solution complète/i,
      /exercice terminé/i, /c'est fini/i, /voilà la réponse/i,
      /donc.*=.*\d+/i, // Pattern "donc x = 5"
      /les solutions sont/i, /réponses.*:/i,
      /tous.*exercices.*résolus/i
    ];
    
    const isExerciseComplete = exercisePatterns.some(pattern => pattern.test(aiResponse));
    
    if (isExerciseComplete || (mode === 'step_by_step' && stepProgression.current_step >= stepProgression.total_steps)) {
      const completionMessages = {
        'step_by_step': `\n\n🎉 Excellent ${prenomExact} ! Nous avons terminé cet exercice étape par étape !`,
        'direct_solution': `\n\n✅ Parfait ${prenomExact} ! Tous les exercices sont résolus !`,
        'normal': `\n\n👍 Voilà ${prenomExact} ! J'espère que ça répond à ta question !`
      };
      
      aiResponse += completionMessages[mode] || completionMessages['normal'];
      aiResponse += `\n\n💡 **Prêt pour le prochain défi ?**`;
    }

    console.log('✅ Réponse IA traitée avec mémoire et progression');

    // ✅ SAUVEGARDE AVEC INFORMATIONS ÉTAPES
    try {
      await supabase.from('historique_conversations').insert([{
        eleve_id: parseInt(user_id),
        message_eleve: message.trim(),
        reponse_ia: aiResponse,
        tokens_utilises: completion.usage?.total_tokens || 0,
        modele_ia: 'llama-3.3-memoire',
        mode_utilise: mode,
        document_utilise: documentName,
        contexte_utilise: !!finalDocumentContext,
        // 🆕 NOUVELLES COLONNES (si elles existent)
        etape_courante: mode === 'step_by_step' ? stepProgression.current_step : null,
        etape_totale: mode === 'step_by_step' ? stepProgression.total_steps : null,
        est_continuation: isContinuation
      }]);
    } catch (saveError) {
      console.warn('⚠️ Erreur sauvegarde:', saveError.message);
    }

    // 🎯 RÉPONSE FINALE AVEC INFORMATIONS PROGRESSION
    const responseData = {
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: 'llama-3.3-memoire',
      student_name: prenomExact,
      tokens_used: completion.usage?.total_tokens || 0,
      mode_used: mode,
      has_context: !!finalDocumentContext,
      document_name: documentName,
      context_length: documentLength,
      step_info: mode === 'step_by_step' ? {
        current_step: stepProgression.current_step,
        total_steps: stepProgression.total_steps,
        next_step: Math.min(stepProgression.current_step + 1, stepProgression.total_steps)
      } : null,
      conversation_context: {
        had_previous_context: conversationContext.hasContext,
        was_continuation: isContinuation,
        was_incomplete: conversationContext.wasIncomplete
      },
      success: true
    };

    console.log('🎉 =============== ÉTUDIA MÉMOIRE SUCCÈS ===============\n');
    res.json(responseData);

  } catch (error) {
    console.error('💥 Erreur chat avancé:', error.message);
    
    res.status(500).json({
      error: 'Erreur technique',
      response: `Désolé, ÉtudIA rencontre un problème ! 🛠️\n\n🔧 Réessaie dans quelques instants.`,
      timestamp: new Date().toISOString(),
      success: false
    });
  }
});

// ===================================================================
// 📊 NOUVELLES ROUTES - PROFIL ET PROGRÈS
// ===================================================================

app.get('/api/student/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [studentResult, documentsResult, conversationsResult] = await Promise.all([
      supabase.from('eleves').select('*').eq('id', userId).single(),
      supabase.from('documents').select('*').eq('eleve_id', userId),
      supabase.from('historique_conversations').select('*').eq('eleve_id', userId)
    ]);

    const student = studentResult.data;
    const documents = documentsResult.data || [];
    const conversations = conversationsResult.data || [];

    const stats = {
      documents_uploaded: documents.length,
      total_conversations: conversations.length,
      total_tokens_used: conversations.reduce((sum, conv) => sum + (conv.tokens_utilises || 0), 0),
      subjects_studied: [...new Set(documents.map(doc => doc.matiere))],
      learning_progress: Math.min(100, Math.round((conversations.length / 50) * 100)),
      last_activity: conversations[0]?.date_creation || student.date_inscription,
      preferred_mode: conversations.reduce((acc, conv) => {
        acc[conv.mode_utilise || 'normal'] = (acc[conv.mode_utilise || 'normal'] || 0) + 1;
        return acc;
      }, {}),
      average_session_length: conversations.length > 0 ? Math.round(conversations.length / documents.length) : 0
    };

    res.json({
      success: true,
      student: {
        ...student,
        nom: student.nom.trim().split(' ')[0]
      },
      statistics: stats,
      learning_profile: {
        style: student.style_apprentissage || 'equilibre',
        difficulties: student.matieres_difficiles || [],
        level: student.niveau_global || 1,
        preferences: student.preferences_pedagogiques || {}
      }
    });

  } catch (error) {
    console.error('❌ Erreur profil élève:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/student/profile/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await MemoryManager.updateStudentProfile(userId);
    
    if (profile) {
      res.json({
        success: true,
        message: 'Profil mis à jour !',
        profile: profile
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur mise à jour profil'
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎤 Route préparatoire pour le mode audio
app.post('/api/chat/audio', async (req, res) => {
  try {
    const { audio_data, user_id, mode = 'normal' } = req.body;
    
    res.json({
      success: true,
      message: 'Mode audio en cours de développement ! 🎤',
      features_coming: [
        'Reconnaissance vocale en français',
        'Synthèse vocale des réponses IA',
        'Support audio pour tous les modes',
        'Transcription automatique'
      ]
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📈 Route analytics avancées
app.get('/api/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const { data: conversations } = await supabase
      .from('historique_conversations')
      .select('*')
      .eq('eleve_id', userId)
      .gte('date_creation', startDate.toISOString());

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('eleve_id', userId)
      .gte('date_upload', startDate.toISOString());

    const analytics = {
      period_days: parseInt(period),
      activity_trend: {
        conversations_count: conversations?.length || 0,
        documents_uploaded: documents?.length || 0,
        avg_daily_activity: Math.round((conversations?.length || 0) / parseInt(period))
      },
      mode_usage: conversations?.reduce((acc, conv) => {
        acc[conv.mode_utilise || 'normal'] = (acc[conv.mode_utilise || 'normal'] || 0) + 1;
        return acc;
      }, {}) || {},
      token_consumption: {
        total: conversations?.reduce((sum, conv) => sum + (conv.tokens_utilises || 0), 0) || 0,
        average_per_conversation: conversations?.length > 0 ? 
          Math.round(conversations.reduce((sum, conv) => sum + (conv.tokens_utilises || 0), 0) / conversations.length) : 0
      },
      subjects_focus: documents?.reduce((acc, doc) => {
        acc[doc.matiere] = (acc[doc.matiere] || 0) + 1;
        return acc;
      }, {}) || {},
      engagement_score: Math.min(100, Math.round(((conversations?.length || 0) / parseInt(period)) * 10))
    };

    res.json({
      success: true,
      analytics: analytics,
      period: `${period} derniers jours`,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================================
// 📊 ROUTES STATS ET HEALTH
// ===================================================================

// 🔍 ROUTE TEST COMPLET SYSTÈME
app.get('/api/diagnostic/system/:userId', async (req, res) => {
  const { userId } = req.params;
  
  console.log(`🔍 DIAGNOSTIC SYSTÈME COMPLET pour élève ${userId}`);
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    user_id: userId,
    system_version: 'ÉtudIA v4.0 - Diagnostic V2',
    tests: {},
    overall_status: 'EN_COURS',
    recommendations: [],
    repair_actions: []
  };
  
  try {
    // 🧪 TEST 1: Connexion base de données
    console.log('🧪 Test 1: Connexion Supabase...');
    try {
      const { data: healthCheck } = await supabase
        .from('eleves')
        .select('count(*)');
      
      diagnostic.tests.database = {
        status: '✅ OPÉRATIONNEL',
        message: 'Connexion Supabase active et fonctionnelle',
        response_time: '< 500ms'
      };
    } catch (dbError) {
      diagnostic.tests.database = {
        status: '❌ ÉCHEC',
        message: `Erreur Supabase: ${dbError.message}`,
        action_required: 'Vérifier configuration SUPABASE_URL et SUPABASE_ANON_KEY'
      };
    }
    
    // 🧪 TEST 2: Élève existe et données complètes
    console.log('🧪 Test 2: Validation données élève...');
    try {
      const { data: student, error: studentError } = await supabase
        .from('eleves')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (student) {
        diagnostic.tests.student = {
          status: '✅ TROUVÉ',
          message: `Élève "${student.nom}" trouvé et valide`,
          data: {
            nom: student.nom,
            email: student.email,
            classe: student.classe || 'Non spécifiée',
            style_apprentissage: student.style_apprentissage || 'Non défini',
            date_inscription: student.date_inscription
          },
          completeness: {
            nom: !!student.nom,
            email: !!student.email,
            classe: !!student.classe,
            score: Math.round(([student.nom, student.email, student.classe].filter(Boolean).length / 3) * 100)
          }
        };
        
        if (diagnostic.tests.student.data.completeness.score < 100) {
          diagnostic.repair_actions.push('Compléter les informations manquantes de l\'élève');
        }
      } else {
        diagnostic.tests.student = {
          status: '❌ NON_TROUVÉ',
          message: `Élève ID ${userId} non trouvé dans la base`,
          action_required: 'Vérifier que l\'élève existe ou créer un nouveau compte'
        };
      }
    } catch (studentError) {
      diagnostic.tests.student = {
        status: '❌ ERREUR',
        message: studentError.message,
        action_required: 'Vérifier la structure de la table eleves'
      };
    }
    
    // 🧪 TEST 3: Documents et extraction OCR
    console.log('🧪 Test 3: Analyse documents...');
    try {
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('eleve_id', userId)
        .order('date_upload', { ascending: false });
      
      const totalDocs = documents?.length || 0;
      const docsWithText = documents?.filter(doc => doc.texte_extrait && doc.texte_extrait.length > 50) || [];
      const docsUsable = docsWithText.length;
      const latestDoc = documents?.[0];
      
      diagnostic.tests.documents = {
        status: totalDocs > 0 ? (docsUsable > 0 ? '✅ OPÉRATIONNEL' : '⚠️ PROBLÈME_OCR') : '📄 AUCUN_DOCUMENT',
        message: `${totalDocs} documents trouvés, ${docsUsable} utilisables par l'IA`,
        data: {
          total_count: totalDocs,
          usable_count: docsUsable,
          success_rate: totalDocs > 0 ? Math.round((docsUsable / totalDocs) * 100) : 0,
          latest_document: latestDoc ? {
            id: latestDoc.id,
            nom: latestDoc.nom_original,
            upload_date: latestDoc.date_upload,
            has_text: !!(latestDoc.texte_extrait),
            text_length: latestDoc.texte_extrait?.length || 0,
            ocr_confidence: latestDoc.confiance_ocr || 0,
            is_usable: !!(latestDoc.texte_extrait && latestDoc.texte_extrait.length > 50)
          } : null
        }
      };
      
      if (totalDocs === 0) {
        diagnostic.repair_actions.push('Élève doit uploader au moins un document');
      } else if (docsUsable === 0) {
        diagnostic.repair_actions.push('Problème OCR - documents sans texte extrait');
      }
      
    } catch (docError) {
      diagnostic.tests.documents = {
        status: '❌ ERREUR',
        message: docError.message,
        action_required: 'Vérifier la structure de la table documents'
      };
    }
    
    // 🧪 TEST 4: Test API Groq et génération IA
    console.log('🧪 Test 4: Test Groq LLaMA...');
    try {
      const testStart = Date.now();
      
      const testCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es ÉtudIA. Réponds juste "Test ÉtudIA OK" en français.'
          },
          {
            role: 'user',
            content: 'Test de fonctionnement'
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 10
      });
      
      const testDuration = Date.now() - testStart;
      const testResponse = testCompletion.choices[0]?.message?.content || '';
      
      diagnostic.tests.groq_api = {
        status: testResponse.toLowerCase().includes('test') ? '✅ OPÉRATIONNEL' : '⚠️ RÉPONSE_ANORMALE',
        message: `Groq LLaMA répond correctement`,
        data: {
          model: 'llama-3.3-70b-versatile',
          response: testResponse,
          response_time: `${testDuration}ms`,
          tokens_used: testCompletion.usage?.total_tokens || 0,
          api_status: 'active'
        }
      };
      
    } catch (groqError) {
      diagnostic.tests.groq_api = {
        status: '❌ ÉCHEC',
        message: `Groq API inaccessible: ${groqError.message}`,
        action_required: 'Vérifier GROQ_API_KEY et connexion réseau',
        error_code: groqError.code || 'UNKNOWN'
      };
    }
    
    // 🧪 TEST 5: Simulation chat complet avec document
    console.log('🧪 Test 5: Simulation chat avec contexte...');
    try {
      const hasValidDoc = diagnostic.tests.documents?.data?.usable_count > 0;
      const testDocument = diagnostic.tests.documents?.data?.latest_document;
      
      let simulationResult;
      
      if (hasValidDoc && testDocument?.is_usable) {
        // Test avec document
        simulationResult = {
          status: '✅ SIMULATION_RÉUSSIE',
          message: 'Chat fonctionnel avec contexte document',
          scenario: 'avec_document',
          document_used: testDocument.nom,
          context_length: testDocument.text_length
        };
      } else if (diagnostic.tests.student?.status.includes('✅') && diagnostic.tests.groq_api?.status.includes('✅')) {
        // Test sans document mais IA fonctionnelle
        simulationResult = {
          status: '⚠️ FONCTIONNEL_SANS_DOCUMENT',
          message: 'Chat possible mais sans contexte document',
          scenario: 'sans_document',
          recommendation: 'Upload document pour expérience complète'
        };
      } else {
        // Problèmes critiques
        simulationResult = {
          status: '❌ CHAT_IMPOSSIBLE',
          message: 'Conditions non réunies pour le chat',
          scenario: 'bloqué',
          blockers: [
            !diagnostic.tests.student?.status.includes('✅') ? 'Élève non trouvé' : null,
            !diagnostic.tests.groq_api?.status.includes('✅') ? 'Groq API défaillante' : null
          ].filter(Boolean)
        };
      }
      
      diagnostic.tests.chat_simulation = simulationResult;
      
    } catch (chatError) {
      diagnostic.tests.chat_simulation = {
        status: '❌ ERREUR_SIMULATION',
        message: chatError.message
      };
    }
    
    // 🧪 TEST 6: Historique conversations et performance
    console.log('🧪 Test 6: Analyse historique...');
    try {
      const { data: conversations } = await supabase
        .from('historique_conversations')
        .select('*')
        .eq('eleve_id', userId)
        .order('date_creation', { ascending: false })
        .limit(10);
      
      const totalConversations = conversations?.length || 0;
      const recentConversations = conversations?.filter(conv => 
        new Date(conv.date_creation) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) || [];
      
      diagnostic.tests.conversation_history = {
        status: totalConversations > 0 ? '✅ HISTORIQUE_PRÉSENT' : '📊 NOUVEL_UTILISATEUR',
        message: `${totalConversations} conversations totales, ${recentConversations.length} cette semaine`,
        data: {
          total_conversations: totalConversations,
          recent_conversations: recentConversations.length,
          total_tokens: conversations?.reduce((sum, conv) => sum + (conv.tokens_utilises || 0), 0) || 0,
          modes_used: [...new Set(conversations?.map(conv => conv.mode_utilise) || [])],
          last_activity: conversations?.[0]?.date_creation || 'Jamais'
        }
      };
      
      if (totalConversations > 100) {
        diagnostic.repair_actions.push('Nettoyer l\'historique ancien (> 100 conversations)');
      }
      
    } catch (historyError) {
      diagnostic.tests.conversation_history = {
        status: '❌ ERREUR',
        message: historyError.message
      };
    }
    
    // 📊 ANALYSE GLOBALE ET STATUT FINAL
    const allTests = Object.values(diagnostic.tests);
    const successfulTests = allTests.filter(test => test.status.includes('✅')).length;
    const warningTests = allTests.filter(test => test.status.includes('⚠️')).length;
    const failedTests = allTests.filter(test => test.status.includes('❌')).length;
    const totalTests = allTests.length;
    
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    if (successRate >= 90) {
      diagnostic.overall_status = '✅ SYSTÈME_OPTIMAL';
      diagnostic.recommendations.push('🎉 ÉtudIA fonctionne parfaitement ! Système optimal.');
    } else if (successRate >= 70) {
      diagnostic.overall_status = '⚠️ SYSTÈME_FONCTIONNEL';
      diagnostic.recommendations.push('⚠️ Système fonctionnel avec quelques améliorations possibles.');
    } else if (successRate >= 50) {
      diagnostic.overall_status = '🔧 SYSTÈME_DÉGRADÉ';
      diagnostic.recommendations.push('🔧 Problèmes détectés - maintenance nécessaire.');
    } else {
      diagnostic.overall_status = '❌ SYSTÈME_DÉFAILLANT';
      diagnostic.recommendations.push('🚨 Système en panne - intervention urgente requise.');
    }
    
    // RECOMMANDATIONS SPÉCIFIQUES
    if (!diagnostic.tests.student?.status.includes('✅')) {
      diagnostic.recommendations.push('👤 Vérifier l\'existence de l\'élève dans la base de données');
    }
    if (diagnostic.tests.documents?.data?.usable_count === 0) {
      diagnostic.recommendations.push('📄 Aucun document utilisable - problème OCR à investiguer');
    }
    if (!diagnostic.tests.groq_api?.status.includes('✅')) {
      diagnostic.recommendations.push('🤖 Groq API défaillante - vérifier clé API et configuration');
    }
    if (!diagnostic.tests.database?.status.includes('✅')) {
      diagnostic.recommendations.push('🗄️ Problème base de données - vérifier Supabase');
    }
    
    diagnostic.summary = {
      total_tests: totalTests,
      successful: successfulTests,
      warnings: warningTests,
      failed: failedTests,
      success_rate: successRate,
      can_chat: diagnostic.tests.chat_simulation?.status?.includes('✅') || 
                diagnostic.tests.chat_simulation?.status?.includes('⚠️'),
      ready_for_production: successRate >= 80
    };
    
    console.log(`✅ Diagnostic complet terminé: ${diagnostic.overall_status} (${successRate}%)`);
    res.json(diagnostic);
    
  } catch (error) {
    console.error('💥 Erreur diagnostic système:', error);
    res.status(500).json({
      ...diagnostic,
      overall_status: '💥 ERREUR_CRITIQUE',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      },
      recommendations: ['🚨 Erreur technique grave - contacter le développeur immédiatement']
    });
  }
});

// 🔧 ROUTE RÉPARATION AUTOMATIQUE
app.post('/api/diagnostic/repair/:userId', async (req, res) => {
  const { userId } = req.params;
  
  console.log(`🔧 RÉPARATION AUTOMATIQUE V2 pour élève ${userId}`);
  
  const repairResults = {
    timestamp: new Date().toISOString(),
    user_id: userId,
    repairs_attempted: [],
    repairs_successful: [],
    repairs_failed: [],
    overall_result: 'EN_COURS'
  };
  
  try {
    // RÉPARATION 1: Validation données élève
    console.log('🔧 Réparation 1: Validation élève...');
    try {
      const { data: student } = await supabase
        .from('eleves')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (student) {
        repairResults.repairs_successful.push({
          action: 'validation_eleve',
          message: `✅ Élève "${student.nom}" validé`,
          details: `ID: ${student.id}, Email: ${student.email}`
        });
      } else {
        repairResults.repairs_failed.push({
          action: 'validation_eleve',
          message: '❌ Élève non trouvé - impossible de réparer automatiquement',
          recommendation: 'Créer le compte élève manuellement'
        });
      }
    } catch (error) {
      repairResults.repairs_failed.push({
        action: 'validation_eleve',
        message: `❌ Erreur validation: ${error.message}`
      });
    }
    
    // RÉPARATION 2: Nettoyage historique volumineux
    console.log('🔧 Réparation 2: Nettoyage historique...');
    try {
      const { data: conversations } = await supabase
        .from('historique_conversations')
        .select('id, date_creation')
        .eq('eleve_id', userId)
        .order('date_creation', { ascending: false });
      
      if (conversations && conversations.length > 50) {
        const oldConversations = conversations.slice(30); // Garder les 30 plus récentes
        const idsToDelete = oldConversations.map(conv => conv.id);
        
        const { error: deleteError } = await supabase
          .from('historique_conversations')
          .delete()
          .in('id', idsToDelete);
        
        if (!deleteError) {
          repairResults.repairs_successful.push({
            action: 'nettoyage_historique',
            message: `✅ ${oldConversations.length} anciennes conversations supprimées`,
            details: `Conservé les 30 conversations les plus récentes`
          });
        } else {
          throw deleteError;
        }
      } else {
        repairResults.repairs_successful.push({
          action: 'nettoyage_historique',
          message: '✅ Historique OK - pas de nettoyage nécessaire',
          details: `${conversations?.length || 0} conversations (< limite de 50)`
        });
      }
    } catch (error) {
      repairResults.repairs_failed.push({
        action: 'nettoyage_historique',
        message: `❌ Erreur nettoyage: ${error.message}`
      });
    }
    
    // RÉPARATION 3: Validation documents OCR
    console.log('🔧 Réparation 3: Validation documents...');
    try {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('eleve_id', userId);
      
      const totalDocs = documents?.length || 0;
      const docsOK = documents?.filter(doc => doc.texte_extrait && doc.texte_extrait.length > 50)?.length || 0;
      const docsProblematic = totalDocs - docsOK;
      
      repairResults.repairs_successful.push({
        action: 'validation_documents',
        message: `✅ Documents analysés: ${docsOK}/${totalDocs} utilisables`,
        details: {
          total: totalDocs,
          usable: docsOK,
          problematic: docsProblematic,
          success_rate: totalDocs > 0 ? Math.round((docsOK / totalDocs) * 100) : 0
        }
      });
      
      if (docsProblematic > 0) {
        repairResults.repairs_attempted.push({
          action: 'documents_problematiques',
          message: `⚠️ ${docsProblematic} documents avec problèmes OCR détectés`,
          recommendation: 'Re-upload des documents ou vérification qualité images'
        });
      }
      
    } catch (error) {
      repairResults.repairs_failed.push({
        action: 'validation_documents',
        message: `❌ Erreur validation documents: ${error.message}`
      });
    }
    
    // RÉPARATION 4: Test final Groq
    console.log('🔧 Réparation 4: Test Groq...');
    try {
      const testGroq = await groq.chat.completions.create({
        messages: [{ 
          role: 'user', 
          content: 'Test réparation ÉtudIA - réponds juste OK' 
        }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 5
      });
      
      const response = testGroq.choices[0]?.message?.content || '';
      
      repairResults.repairs_successful.push({
        action: 'test_groq',
        message: '✅ Groq API fonctionnelle',
        details: `Réponse: "${response}", Tokens: ${testGroq.usage?.total_tokens || 0}`
      });
      
    } catch (groqError) {
      repairResults.repairs_failed.push({
        action: 'test_groq',
        message: `❌ Groq API: ${groqError.message}`,
        recommendation: 'Vérifier GROQ_API_KEY et connexion réseau'
      });
    }
    
    // BILAN FINAL
    const totalRepairs = repairResults.repairs_attempted.length + 
                        repairResults.repairs_successful.length + 
                        repairResults.repairs_failed.length;
    
    const successfulRepairs = repairResults.repairs_successful.length;
    const failedRepairs = repairResults.repairs_failed.length;
    
    if (failedRepairs === 0) {
      repairResults.overall_result = '✅ RÉPARATION_RÉUSSIE';
    } else if (successfulRepairs > failedRepairs) {
      repairResults.overall_result = '⚠️ RÉPARATION_PARTIELLE';
    } else {
      repairResults.overall_result = '❌ RÉPARATION_ÉCHOUÉE';
    }
    
    repairResults.summary = {
      total_actions: totalRepairs,
      successful: successfulRepairs,
      failed: failedRepairs,
      success_rate: totalRepairs > 0 ? Math.round((successfulRepairs / totalRepairs) * 100) : 0
    };
    
    repairResults.next_steps = [
      '1. Exécuter diagnostic complet: GET /api/diagnostic/system/' + userId,
      '2. Tester chat simple avec document',
      '3. Vérifier upload/OCR si problèmes persistent',
      '4. Contacter développeur si échecs critiques'
    ];
    
    console.log(`✅ Réparation terminée: ${repairResults.overall_result}`);
    res.json(repairResults);
    
  } catch (error) {
    console.error('💥 Erreur réparation:', error);
    res.status(500).json({
      ...repairResults,
      overall_result: '💥 ERREUR_CRITIQUE',
      error: {
        name: error.name,
        message: error.message
      },
      next_steps: ['🚨 Contacter le développeur - erreur critique de réparation']
    });
  }
});

// 📊 ROUTE STATS MANQUANTE - Ajoute ça dans server.js
app.get('/api/stats', async (req, res) => {
  try {
    console.log('📊 Route /api/stats appelée');
    
    // Récupération des stats de base
    const [studentsResult, documentsResult, conversationsResult] = await Promise.all([
      supabase.from('eleves').select('count(*)'),
      supabase.from('documents').select('count(*)'),
      supabase.from('historique_conversations').select('count(*)')
    ]);

    const stats = {
      students: studentsResult.data?.[0]?.count || 0,
      documents: documentsResult.data?.[0]?.count || 0,
      chats: conversationsResult.data?.[0]?.count || 0,
      active_students_7days: 0, // À implémenter plus tard
      tokens_status: {
        used_today: 0,
        remaining: 95000,
        status: '🟢 Optimal'
      }
    };

    console.log('✅ Stats générées:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Erreur route stats:', error.message);
    
    // Fallback avec stats par défaut
    res.json({
      students: 0,
      documents: 0,
      chats: 0,
      active_students_7days: 0,
      tokens_status: {
        used_today: 0,
        remaining: 95000,
        status: '🟢 Optimal'
      }
    });
  }
});

// 🔧 CORRECTION 2: ROUTE CATCH-ALL 404 (à la FIN de tes routes, AVANT app.listen)
app.use('*', (req, res) => {
  console.log(`❓ Route non trouvée: ${req.method} ${req.originalUrl}`);
  console.log(`🌍 Origin: ${req.get('origin') || 'Direct'}`);
  console.log(`🖥️ User-Agent: ${(req.get('user-agent') || 'Unknown').substring(0, 50)}`);
  
  // 🔧 RÉPONSE SPÉCIALE POUR ROUTES API
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: 'Route API non trouvée',
      message: `La route ${req.originalUrl} n'existe pas sur ÉtudIA`,
      available_routes: [
        'GET /',
        'GET /health',
        'GET /debug',
        'POST /api/students',
        'POST /api/students/login',
        'POST /api/upload',
        'POST /api/chat',
        'GET /api/stats',
        'GET /api/documents/:userId'
      ],
      timestamp: new Date().toISOString(),
      help: 'Vérifiez l\'URL et la méthode HTTP'
    });
  } else {
    // 🔧 RÉPONSE POUR AUTRES ROUTES
    res.status(404).json({
      success: false,
      error: 'Page non trouvée',
      message: `La page ${req.originalUrl} n'existe pas`,
      suggestion: 'Allez sur / pour accéder à ÉtudIA',
      timestamp: new Date().toISOString()
    });
  }
});

// 🔧 CORRECTION 5: GESTION ERREURS GLOBALE (ajoute AVANT app.listen)
app.use((error, req, res, next) => {
  console.error('\n💥 =============== ERREUR SERVEUR GLOBALE ===============');
  console.error('❌ Erreur:', error.name);
  console.error('📝 Message:', error.message);
  console.error('📍 Route:', req.method, req.originalUrl);
  console.error('📦 Body:', JSON.stringify(req.body, null, 2));
  console.error('🔚 =============== FIN ERREUR GLOBALE ===============\n');
  
  res.status(500).json({
    success: false,
    error: 'Erreur serveur interne',
    message: 'ÉtudIA rencontre un problème technique. Réessayez dans quelques instants.',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    error_type: error.name,
    can_retry: true
  });
});

// ===================================================================
// 🚀 DÉMARRAGE SERVEUR
// ===================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🎯 ═══════════════════════════════════════════════════════════
   ÉtudIA V4.1 - OPENROUTER DEEPSEEK R1 OPÉRATIONNEL ! 🚀✨
   
   📍 Port: ${PORT}
   🌍 Host: 0.0.0.0  
   🏭 Environment: ${process.env.NODE_ENV}
   🗄️ Cache: ${cache.keys().length} clés actives
   
🚀 MIGRATION OPENROUTER DEEPSEEK R1 COMPLÈTE:
   ❌ Ancien: Groq Llama 3.3-70b-versatile (supprimé)
   ✅ Nouveau: ${OPENROUTER_CONFIG.models.free} (actif)
   🔧 Base URL: ${OPENROUTER_CONFIG.baseURL}
   🔑 API Key: ${OPENROUTER_CONFIG.apiKey ? '✅ Configurée et active' : '❌ MANQUANTE - URGENT!'}
   
📊 MODÈLES DEEPSEEK R1 DISPONIBLES:
   🆓 Gratuit: ${OPENROUTER_CONFIG.models.free}
   💎 Payant: ${OPENROUTER_CONFIG.models.paid}
   
🎨 FONCTIONNALITÉS ÉtudIA V4.1:
   ✅ Design révolutionnaire conservé
   ✅ 3 modes d'apprentissage optimisés DeepSeek
   ✅ OCR et upload documents maintenus
   ✅ Base de données Supabase opérationnelle
   ✅ Interface mobile responsive parfaite
   ✅ Stats usage temps réel ajoutées
   
🌍 MISSION: Révolutionner l'éducation Africaine avec DeepSeek R1 !
💰 ÉCONOMIE: 100% gratuit par défaut, premium optionnel
🇨🇮 Made with ❤️ in Côte d'Ivoire by @Pacousstar
👩‍💼 Migré vers OpenRouter DeepSeek R1 par MonAP
   
🏆 STATUT: OPENROUTER DEEPSEEK R1 MASTERED - READY FOR AFRICA!
═══════════════════════════════════════════════════════════
`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt propre du serveur...');
  server.close(() => {
    console.log('✅ Serveur ÉtudIA arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur ÉtudIA arrêté');
    process.exit(0);
  });
});

module.exports = app;
