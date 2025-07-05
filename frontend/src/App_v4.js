import React, { useState, useEffect } from 'react';
import './App.css';
import UploadDocument from './components/UploadDocument';
import ChatIA from './components/ChatIA';

// 🚀 API Configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://etudia-africa-backend.railway.app'
  : '';

console.log('🔗 API_URL:', API_URL || 'PROXY ACTIVÉ');

function App() {
  const [activeTab, setActiveTab] = useState('inscription');
  const [student, setStudent] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({ students: 0, documents: 0, chats: 0 });
  const [currentStep, setCurrentStep] = useState(1);
  const [documentContext, setDocumentContext] = useState('');
  
  // ✅ NOUVEAU STATE POUR MESSAGES TEMPORAIRES
  const [connectionMessage, setConnectionMessage] = useState({
    show: false,
    text: '',
    type: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class_level: '',
    school: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const schools = [
    'Lycée Classique d\'Abidjan',
    'Lycée Technique d\'Abidjan',
    'Collège Notre-Dame d\'Afrique',
    'Lycée Sainte-Marie de Cocody',
    'Institution Sainte-Marie de Cocody',
    'Cours Secondaire Catholique',
    'Lycée Municipal',
    'Groupe Scolaire Les Genies',
    'École Internationale WASCAL',
    'Autre'
  ];

  const classLevels = [
    '6ème', '5ème', '4ème', '3ème',
    'Seconde', 'Première', 'Terminale'
  ];

  // ✅ FONCTION MESSAGE TEMPORAIRE (10 SECONDES)
  const showTemporaryMessage = (text, type = 'success', duration = 10000) => {
    setConnectionMessage({
      show: true,
      text: text,
      type: type
    });
    
    // Disparaît automatiquement après 10 secondes
    setTimeout(() => {
      setConnectionMessage(prev => ({ ...prev, show: false }));
    }, duration);
  };

  // ✅ VÉRIFICATION BACKEND SIMPLIFIÉE
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBackendStatus('online');
          
          // ✅ MESSAGE TEMPORAIRE SEULEMENT AU PREMIER SUCCÈS
          if (backendStatus !== 'online') {
            showTemporaryMessage('🎉 Connexion réussie ! ✅');
          }
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
        if (backendStatus === 'online') {
          showTemporaryMessage('❌ Serveur hors ligne', 'error', 5000);
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Vérifie toutes les 30s
    return () => clearInterval(interval);
  }, [backendStatus]);

  // ✅ RÉCUPÉRATION STATS
  useEffect(() => {
    const fetchStats = async () => {
      if (backendStatus !== 'online') return;
      
      try {
        const response = await fetch('/api/stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            students: data.students || 0,
            documents: data.documents || 0,
            chats: data.chats || 0
          });
        }
      } catch (error) {
        console.warn('📊 Erreur stats:', error.message);
        setStats({ students: 0, documents: 0, chats: 0 });
      }
    };

    fetchStats();
  }, [backendStatus]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ INSCRIPTION AMÉLIORÉE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
        setMessage({ type: 'success', text: data.message });
        setCurrentStep(2);
        setBackendStatus('online');
        
        showTemporaryMessage(`🎉 Bienvenue ${data.student.nom} ! Inscription réussie !`);
        
        setTimeout(() => {
          setActiveTab('upload');
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || data.error || `Erreur: ${response.status}`
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erreur de connexion: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ LOGIN AMÉLIORÉ
  const handleLogin = async (email) => {
    try {
      const response = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
        setMessage({ type: 'success', text: data.message });
        setCurrentStep(2);
        setActiveTab('upload');
        setBackendStatus('online');
        
        showTemporaryMessage(`🎉 Connexion réussie ! Bonjour ${data.student.nom} !`);
      } else {
        setMessage({ type: 'error', text: data.error || data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  const handleDocumentProcessed = (extractedText) => {
    setDocumentContext(extractedText);
    setCurrentStep(3);
    showTemporaryMessage('📄 Document analysé avec succès !');
    setTimeout(() => {
      setActiveTab('chat');
    }, 1500);
  };

  const TabButton = ({ id, label, icon, isActive, onClick, disabled = false }) => (
    <button
      className={`tab-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
    >
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
      {currentStep > getStepNumber(id) && <span className="tab-check">✓</span>}
    </button>
  );

  const getStepNumber = (tabId) => {
    switch (tabId) {
      case 'inscription': return 1;
      case 'upload': return 2;
      case 'chat': return 3;
      default: return 1;
    }
  };

  return (
    <div className="app">
      {/* ✅ MESSAGE TEMPORAIRE FLOTTANT */}
      {connectionMessage.show && (
        <div className={`floating-message ${connectionMessage.type}`}>
          {connectionMessage.text}
        </div>
      )}

      {/* Header with cosmic background */}
      <header className="app-header">
        <div className="cosmic-bg"></div>
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">
              <span className="title-main">Étud</span>
              <span className="title-accent">IA</span>
              <span className="title-version">4.0</span>
            </h1>
            <p className="app-subtitle">L'Assistant IA Révolutionnaire pour l'Éducation Africaine</p>
            <div className="made-in-ci">
              <span className="flag">🇨🇮</span>
              <span>Made with ❤️ in Côte d'Ivoire by @Pacousstar</span>
            </div>
          </div>
          
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">{stats.students.toLocaleString()}+</span>
              <span className="stat-label">Élèves aidés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.documents.toLocaleString()}+</span>
              <span className="stat-label">Documents analysés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Taux de réussite</span>
            </div>
          </div>

          
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
        </div>
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>1. Inscription</div>
          <div className={`step ${currentStep >= 2 ? 'completed' : ''}`}>2. Upload Document</div>
          <div className={`step ${currentStep >= 3 ? 'completed' : ''}`}>3. Chat IA</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="tab-navigation">
        <TabButton
          id="inscription"
          label="Inscription"
          icon="👤"
          isActive={activeTab === 'inscription'}
          onClick={setActiveTab}
        />
        <TabButton
          id="upload"
          label="Upload OCR"
          icon="📸"
          isActive={activeTab === 'upload'}
          onClick={setActiveTab}
          disabled={!student}
        />
        <TabButton
          id="chat"
          label="Chat IA"
          icon="🤖"
          isActive={activeTab === 'chat'}
          onClick={setActiveTab}
          disabled={!student}
        />
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Inscription Tab */}
        {activeTab === 'inscription' && (
          <div className="tab-content inscription-tab">
            <div className="content-header">
              <h2>🎓 Rejoignez la Révolution Éducative !</h2>
              <p>Inscrivez-vous en moins de 2 minutes et transformez votre façon d'apprendre</p>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                <strong>{message.type === 'error' ? '❌ ' : '✅ '}</strong>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="inscription-form">
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre nom et prénom"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="votre.email@exemple.com"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="class_level">Classe *</label>
                  <select
                    id="class_level"
                    name="class_level"
                    value={formData.class_level}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Sélectionnez votre classe</option>
                    {classLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="school">École</label>
                  <select
                    id="school"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Sélectionnez votre école</option>
                    {schools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || backendStatus !== 'online'}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Inscription en cours...
                  </>
                ) : backendStatus !== 'online' ? (
                  <>
                    ⏳ Attente du serveur...
                  </>
                ) : (
                  <>
                    🚀 Rejoindre ÉtudIA
                  </>
                )}
              </button>
            </form>

            <div className="login-section">
              <p>Déjà inscrit ? Connectez-vous rapidement :</p>
              <div className="quick-login">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="login-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value && backendStatus === 'online') {
                      handleLogin(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const email = e.target.previousSibling.value;
                    if (email && backendStatus === 'online') handleLogin(email);
                  }}
                  className="login-button"
                  disabled={backendStatus !== 'online'}
                >
                  Connexion
                </button>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">📸</span>
                <h3>OCR Révolutionnaire</h3>
                <p>Photographiez vos devoirs, ÉtudIA extrait le texte instantanément</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🤖</span>
                <h3>IA Tutrice Experte</h3>
                <p>Llama 3.3 70B vous aide à comprendre tous vos cours</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🎯</span>
                <h3>Adaptation Intelligente</h3>
                <p>S'adapte à votre niveau, de la 6ème à la Terminale</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🇨🇮</span>
                <h3>Made in Côte d'Ivoire</h3>
                <p>Conçu spécialement pour les élèves africains</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && student && (
          <UploadDocument
            student={student}
            apiUrl={API_URL}
            onDocumentProcessed={handleDocumentProcessed}
          />
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && student && (
          <ChatIA
            student={student}
            apiUrl={API_URL}
            documentContext={documentContext}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 ÉtudIA v4.0 - Révolutionnons l'éducation africaine ensemble ! 🌍</p>
          <p>Développé avec ❤️ par <strong>@Pacousstar</strong> - Pionnier de l'IA éducative en Côte d'Ivoire</p>
          <div className="footer-stats">
            <span>🚀 {stats.students}+ élèves aidés</span>
            <span>📚 {stats.documents}+ documents analysés</span>
            <span>💬 {stats.chats}+ conversations</span>
          </div>
        </div>
      </footer>

      {/* ✅ STYLES CSS POUR MESSAGE TEMPORAIRE */}
      <style jsx>{`
        .floating-message {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          animation: slideInOut 10s ease-in-out forwards;
          max-width: 350px;
          text-align: center;
        }

        .floating-message.success {
          background: linear-gradient(135deg, #10B981, #059669);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .floating-message.error {
          background: linear-gradient(135deg, #EF4444, #DC2626);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-dot {
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }

        .backend-status {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-indicator.online .status-dot {
          animation: pulse 2s infinite;
        }

        .status-indicator.offline .status-dot {
          animation: pulse-red 1s infinite;
        }

        @keyframes slideInOut {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          10%, 90% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default App;