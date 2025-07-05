import React, { useState, useEffect, useRef } from 'react';

const ChatIA = ({ student, apiUrl, documentContext = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  const [learningProfile, setLearningProfile] = useState(null);
  
  // 🎯 NOUVEAUX ÉTATS RÉVOLUTIONNAIRES
  const [chatMode, setChatMode] = useState('normal'); // normal, step_by_step, direct_solution
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(4);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Récupération sécurisée du prénom
  const prenomEleve = student?.nom?.split(' ')[0] || student?.name?.split(' ')[0] || 'Élève';
  const classeEleve = student?.classe || student?.class_level || 'votre classe';

  // Suggestions intelligentes selon le profil
  const getSuggestions = () => {
    const baseSuggestions = [
      "Explique-moi ce document en détail",
      "Quels sont les points clés à retenir ?",
      "Aide-moi avec cet exercice",
      "Comment réviser efficacement cette leçon ?"
    ];

    if (learningProfile?.style === 'interactif') {
      return [
        "Pose-moi des questions sur ce chapitre",
        "Créons un quiz ensemble",
        "Vérifie ma compréhension",
        "Débattons de ce sujet"
      ];
    } else if (learningProfile?.style === 'pratique') {
      return [
        "Montrons avec des exemples concrets",
        "Faisons des exercices pratiques",
        "Applications dans la vie réelle",
        "Exercices étape par étape"
      ];
    }

    return baseSuggestions;
  };

  // ✅ FONCTION MESSAGE D'ACCUEIL RÉVOLUTIONNAIRE
  const triggerWelcomeMessage = async () => {
    if (welcomeMessageSent) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Connexion',
          user_id: student.id,
          document_context: documentContext,
          is_welcome: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const welcomeMessage = {
          id: Date.now(),
          type: 'ai',
          content: data.response,
          timestamp: data.timestamp,
          tokens: data.tokens_used || 0,
          model: data.model,
          hasContext: data.has_context,
          isWelcome: true
        };

        setMessages([welcomeMessage]);
        setWelcomeMessageSent(true);
        setTotalTokens(data.tokens_used || 0);
        setLearningProfile(data.learning_profile);
      }
    } catch (error) {
      console.error('❌ Erreur message d\'accueil:', error);
      
      const fallbackWelcome = {
        id: Date.now(),
        type: 'ai',
        content: `Salut ${prenomEleve} ! 🎓

Je suis ÉtudIA, ton tuteur IA révolutionnaire ! 🤖✨

Mode hors ligne activé. Reconnecte-toi pour l'expérience complète !`,
        timestamp: new Date().toISOString(),
        tokens: 0,
        isWelcome: true,
        isOffline: true
      };

      setMessages([fallbackWelcome]);
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

  // 🎯 FONCTION ENVOI MESSAGE RÉVOLUTIONNAIRE
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

    try {
      // Construire payload selon le mode
      const payload = {
        message: messageText.trim(),
        user_id: student.id,
        document_context: documentContext,
        mode: mode
      };

      // Ajouter info étapes si mode step_by_step
      if (mode === 'step_by_step') {
        payload.step_info = {
          current_step: currentStep,
          total_steps: totalSteps
        };
      }

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          timestamp: data.timestamp,
          tokens: data.tokens_used || 0,
          model: data.model,
          hasContext: data.has_context,
          mode: mode,
          nextStep: data.next_step
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationCount(prev => prev + 1);
        setTotalTokens(prev => prev + (data.tokens_used || 0));

        // Gérer progression étapes
        if (mode === 'step_by_step' && data.next_step?.next) {
          setCurrentStep(data.next_step.next);
        }

        // Synthèse vocale si mode audio
        if (isAudioMode) {
          speakResponse(data.response);
        }

      } else {
        throw new Error(data.error || 'Erreur communication IA');
      }
    } catch (error) {
      console.error('❌ Erreur chat:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Désolé ${prenomEleve}, je rencontre des difficultés techniques ! 😅

Veuillez réessayer dans quelques instants.

🤖 ÉtudIA sera bientôt de retour pour t'aider !`,
        timestamp: new Date().toISOString(),
        tokens: 0,
        isError: true
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

Pose ta question et nous procéderons étape par étape ! 📊`;

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

Quel exercice veux-tu que je résolve ? 🎯`;

    const systemMessage = {
      id: Date.now(),
      type: 'system', 
      content: confirmMessage,
      timestamp: new Date().toISOString(),
      mode: 'direct_solution'
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  // 🎤 MODE AUDIO (préparatoire)
  const toggleAudioMode = () => {
    setIsAudioMode(!isAudioMode);
    
    if (!isAudioMode) {
      // Activer audio
      const audioMessage = {
        id: Date.now(),
        type: 'system',
        content: `🎤 Mode Audio activé !

Tu peux maintenant parler à ÉtudIA et entendre mes réponses !

(Fonctionnalité en cours de développement)`,
        timestamp: new Date().toISOString(),
        mode: 'audio'
      };
      setMessages(prev => [...prev, audioMessage]);
    }
  };

  // Synthèse vocale (basique)
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Reconnaissance vocale (basique)
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };
      recognition.start();
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

${prenomEleve}, nous reprenons la conversation normale. Tu peux à nouveau choisir tes modes d'apprentissage !`,
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
      case 'step_by_step': return '#3B82F6';
      case 'direct_solution': return '#10B981'; 
      case 'audio': return '#F59E0B';
      default: return '#6366F1';
    }
  };

  return (
    <div className={`tab-content chat-tab ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="content-header">
        <h2>🤖 Chat Révolutionnaire avec ÉtudIA</h2>
        <p>Votre tuteur IA personnel avec mémoire et modes d'apprentissage adaptatifs !</p>
        
        {/* Informations élève et profil */}
        <div className="student-profile-header">
          <div className="student-info">
            <span>👤 {prenomEleve} • 🎓 {classeEleve}</span>
            {learningProfile && (
              <span className="learning-style">
                🧠 Style: {learningProfile.style || 'adaptatif'}
              </span>
            )}
            {documentContext && <span>📄 Document analysé</span>}
          </div>
          
          {/* Mode actuel */}
          <div className="current-mode" style={{ color: getModeColor(chatMode) }}>
            <span>Mode: {
              chatMode === 'step_by_step' ? '🔁 Étape par Étape' :
              chatMode === 'direct_solution' ? '✅ Solution Directe' :
              chatMode === 'audio' ? '🎤 Audio' : '💬 Normal'
            }</span>
            {chatMode === 'step_by_step' && (
              <span className="step-counter">📊 Étape {currentStep}/{totalSteps}</span>
            )}
          </div>
        </div>
      </div>

      <div className="chat-container">
        {/* Header avec contrôles révolutionnaires */}
        <div className="chat-header revolutionary">
          <div className="chat-title">
            <span>💬</span>
            <span>ÉtudIA - Tuteur IA Révolutionnaire</span>
          </div>
          
          {/* Boutons de contrôle */}
          <div className="chat-controls">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="control-button"
              title="Mode sombre"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button
              onClick={toggleAudioMode}
              className={`control-button ${isAudioMode ? 'active' : ''}`}
              title="Mode audio"
            >
              🎤
            </button>
            
            <div className="status-indicator">
              <div className={`status-dot ${isLoading ? 'loading' : 'online'}`}></div>
              <span>{isLoading ? 'IA réfléchit...' : 'IA en ligne'}</span>
            </div>
          </div>
        </div>

        {/* 🚀 BOUTONS RÉVOLUTIONNAIRES MAGIQUES */}
        {chatMode === 'normal' && (
          <div className="revolutionary-buttons">
            <div className="mode-buttons-header">
              <h3>🎯 Choisis ton mode d'apprentissage, {prenomEleve} !</h3>
            </div>
            
            <div className="mode-buttons-grid">
              <button
                onClick={activateStepByStepMode}
                className="mode-button step-by-step"
                disabled={isLoading}
              >
                <div className="mode-icon">🔁</div>
                <div className="mode-title">Explication Étape par Étape</div>
                <div className="mode-description">
                  Je te guide progressivement à travers chaque étape de résolution
                </div>
                <div className="mode-benefit">✨ Compréhension garantie</div>
              </button>

              <button
                onClick={activateDirectSolutionMode}
                className="mode-button direct-solution"
                disabled={isLoading}
              >
                <div className="mode-icon">✅</div>
                <div className="mode-title">Solution Finale</div>
                <div className="mode-description">
                  Je donne directement toutes les solutions complètes de tes exercices
                </div>
                <div className="mode-benefit">⚡ Résultats immédiats</div>
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

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${message.type} ${message.mode ? `mode-${message.mode}` : ''}`}
            >
              <div className="message-content">
                {formatMessage(message.content)}
              </div>
              <div className="message-meta">
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
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
                </div>
              </div>
            </div>
          ))}

          {/* Indicateur de chargement révolutionnaire */}
          {isLoading && (
            <div className="message-bubble ai loading">
              <div className="message-content">
                <div className="ai-thinking">
                  <div className="thinking-animation">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <span>ÉtudIA analyse ta question...</span>
                  {chatMode === 'step_by_step' && (
                    <div className="step-info">📊 Préparation étape {currentStep}/{totalSteps}</div>
                  )}
                  {chatMode === 'direct_solution' && (
                    <div className="step-info">✅ Résolution complète en cours...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Section d'entrée */}
        <div className="chat-input-container">
          {/* Suggestions intelligentes */}
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

          {/* Zone de saisie révolutionnaire */}
          <div className="chat-input-wrapper revolutionary">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chatMode === 'step_by_step' ? `${prenomEleve}, pose ta question pour l'étape ${currentStep}...` :
                chatMode === 'direct_solution' ? `${prenomEleve}, quel exercice résoudre directement ?` :
                isAudioMode ? `${prenomEleve}, parle ou écris à ÉtudIA...` :
                `${prenomEleve}, pose une question à ton tuteur IA...`
              }
              disabled={isLoading}
              rows={1}
              style={{
                resize: 'none',
                minHeight: '50px',
                maxHeight: '120px',
                overflowY: inputMessage.split('\n').length > 2 ? 'auto' : 'hidden',
                borderColor: getModeColor(chatMode)
              }}
            />
            
            {/* Boutons d'envoi et audio */}
            <div className="input-buttons">
              {isAudioMode && (
                <button
                  className="voice-button"
                  onClick={startVoiceRecognition}
                  disabled={isLoading}
                  title="Parler à ÉtudIA"
                >
                  🎙️
                </button>
              )}
              
              <button
                className="send-button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                style={{ backgroundColor: getModeColor(chatMode) }}
              >
                <span className="send-icon">
                  {isLoading ? '⏳' : 
                   chatMode === 'step_by_step' ? '📊' :
                   chatMode === 'direct_solution' ? '✅' : '🚀'}
                </span>
              </button>
            </div>
          </div>

          {/* Conseils contextuels */}
          <div className="input-hints">
            {chatMode === 'normal' && (
              <span>💡 Conseil : Choisis un mode d'apprentissage pour une expérience optimisée</span>
            )}
            {chatMode === 'step_by_step' && (
              <span>📊 Mode Étape par Étape : Je te guide progressivement vers la solution</span>
            )}
            {chatMode === 'direct_solution' && (
              <span>✅ Mode Solution Directe : Je résous complètement tes exercices</span>
            )}
            {isAudioMode && (
              <span>🎤 Mode Audio : Tu peux parler ou écrire à ÉtudIA</span>
            )}
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
                <span className="mode-badge">🔁 Étape par Étape</span>
                <span className="mode-badge">✅ Solution Directe</span>
              </div>
            </div>
            
            <div className="feature-card adaptive">
              <span className="feature-icon">📈</span>
              <h4>Adaptation Intelligente</h4>
              <p>L'IA s'adapte à ton niveau ({classeEleve}) et à tes difficultés</p>
              {learningProfile?.difficulties?.length > 0 && (
                <div className="difficulties-info">
                  Focus: {learningProfile.difficulties.join(', ')}
                </div>
              )}
            </div>
            
            <div className="feature-card audio">
              <span className="feature-icon">🎤</span>
              <h4>Mode Audio (Beta)</h4>
              <p>Parle à ÉtudIA et écoute ses réponses vocalement</p>
              <div className="audio-status">
                {isAudioMode ? '🟢 Activé' : '⚪ Disponible'}
              </div>
            </div>
          </div>

          {/* Statistiques personnelles */}
          <div className="personal-stats">
            <h4>📊 Tes Statistiques, {prenomEleve}</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{conversationCount}</span>
                <span className="stat-label">Conversations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{totalTokens.toLocaleString()}</span>
                <span className="stat-label">Tokens utilisés</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {documentContext ? '1+' : '0'}
                </span>
                <span className="stat-label">Documents analysés</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {learningProfile?.level || 'N/A'}
                </span>
                <span className="stat-label">Niveau IA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS révolutionnaires */}
      <style jsx>{`
        .revolutionary-buttons {
          margin: 1rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1));
          border-radius: 1rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .mode-buttons-header h3 {
          text-align: center;
          color: #6366F1;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .mode-buttons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .mode-button {
          padding: 1.5rem;
          border: 2px solid transparent;
          border-radius: 1rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .mode-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .mode-button.step-by-step {
          border-color: #3B82F6;
        }

        .mode-button.step-by-step:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
        }

        .mode-button.direct-solution {
          border-color: #10B981;
        }

        .mode-button.direct-solution:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
        }

        .mode-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .mode-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1F2937;
        }

        .mode-description {
          font-size: 0.9rem;
          color: #6B7280;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .mode-benefit {
          font-size: 0.8rem;
          font-weight: 500;
          color: #059669;
        }

        .mode-reset {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }

        .reset-button {
          padding: 0.5rem 1rem;
          background: #6B7280;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-button:hover {
          background: #4B5563;
        }

        .student-profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .student-info span {
          margin-right: 1rem;
          font-weight: 500;
        }

        .learning-style {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
        }

        .current-mode {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-counter {
          background: rgba(59, 130, 246, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
        }

        .chat-header.revolutionary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          border-radius: 1rem 1rem 0 0;
        }

        .chat-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-button:hover, .control-button.active {
          background: rgba(255, 255, 255, 0.3);
        }

        .thinking-animation {
          display: flex;
          gap: 0.25rem;
          margin-right: 0.5rem;
        }

        .thinking-animation .dot {
          width: 6px;
          height: 6px;
          background: #6366F1;
          border-radius: 50%;
          animation: thinking 1.4s infinite ease-in-out;
        }

        .thinking-animation .dot:nth-child(1) { animation-delay: -0.32s; }
        .thinking-animation .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes thinking {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .ai-thinking {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 0.5rem;
        }

        .step-info {
          font-size: 0.8rem;
          color: #6B7280;
          font-style: italic;
        }

        .chat-input-wrapper.revolutionary {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .input-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .voice-button {
          background: #F59E0B;
          border: none;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .voice-button:hover {
          background: #D97706;
        }

        .message-tag {
          font-size: 0.7rem;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          color: white;
          margin: 0 0.25rem;
        }

        .message-tag.welcome { background: #10B981; }
        .message-tag.context { background: #6366F1; }
        .message-tag.error { background: #EF4444; }
        .message-tag.mode { font-weight: 500; }

        .features-showcase {
          margin-top: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(16, 185, 129, 0.05));
          border-radius: 1rem;
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .features-grid.revolutionary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 1.5rem 0;
        }

        .feature-card {
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .feature-card.memory { background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(139, 69, 19, 0.05)); }
        .feature-card.modes { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); }
        .feature-card.adaptive { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); }
        .feature-card.audio { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05)); }

        .mode-badges {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .mode-badge {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .personal-stats {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 1rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1));
          border-radius: 0.5rem;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #6366F1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6B7280;
          margin-top: 0.25rem;
        }

        .dark-mode {
          background: #1F2937;
          color: white;
        }

        .dark-mode .mode-button {
          background: #374151;
          color: white;
        }

        .dark-mode .feature-card {
          background: #374151;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ChatIA;