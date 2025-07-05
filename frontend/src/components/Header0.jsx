  // Header.jsx - CORRIGÉ pour affichage propre
import React, { useState, useEffect } from 'react';

const Header = ({ currentStudent, onLogout }) => {
  const [serverStatus, setServerStatus] = useState('checking');
  const [stats, setStats] = useState({ students: 0, documents: 0, chats: 0 });

  // Vérifier le statut du serveur
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setServerStatus('online');
        // Récupérer les stats si le serveur est en ligne
        fetchStats();
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.log('Serveur backend non accessible:', error);
      setServerStatus('offline');
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log('Erreur récupération stats:', error);
    }
  };

  useEffect(() => {
    checkServerStatus();
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'online': return '#10B981'; // Vert
      case 'offline': return '#EF4444'; // Rouge
      default: return '#F59E0B'; // Orange
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'online': return '🟢 Serveur en ligne';
      case 'offline': return '🔴 Serveur hors ligne';
      default: return '🟡 Vérification...';
    }
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Section Gauche - Logo et Titre */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{
            fontSize: '2rem',
            marginRight: '1rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}>
            🎓
          </div>
          
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ÉtudIA 4.0
            </h1>
            
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.9rem',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              L'Assistant IA Révolutionnaire pour l'Éducation Africaine
            </p>
            
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              🇨🇮 Made with ❤️ in Côte d'Ivoire by @Pacousstar
            </p>
          </div>
        </div>

        {/* Section Centre - Statistiques (uniquement si serveur en ligne) */}
        {serverStatus === 'online' && (
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#FFD700'
              }}>
                {stats.students}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Élèves
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#FFD700'
              }}>
                {stats.documents}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Documents
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#FFD700'
              }}>
                {stats.chats}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Conversations
              </div>
            </div>
          </div>
        )}

        {/* Section Droite - Statut et Utilisateur */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          
          {/* Statut Serveur - Design amélioré */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${getStatusColor()}`,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              marginRight: '0.5rem',
              boxShadow: `0 0 10px ${getStatusColor()}`
            }}></div>
            <span style={{ 
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {serverStatus === 'online' ? 'Backend connecté' : 
               serverStatus === 'offline' ? 'Backend déconnecté' : 'Connexion...'}
            </span>
          </div>

          {/* Informations Utilisateur */}
          {currentStudent && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#667eea'
              }}>
                {currentStudent.nom?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  lineHeight: 1
                }}>
                  {currentStudent.nom}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  opacity: 0.8,
                  lineHeight: 1.2
                }}>
                  {currentStudent.classe} • {currentStudent.ecole}
                </div>
              </div>
              
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FEE2E2',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginLeft: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;