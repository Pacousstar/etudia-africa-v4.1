// ===================================================================
// 📱 COMPOSANT REACT POUR SURVEILLER LES CLÉS GROQ
// Fichier: src/components/GroqKeyMonitor.js
// ===================================================================

import React, { useState, useEffect } from 'react';

const GroqKeyMonitor = ({ groqService }) => {
  const [stats, setStats] = useState([]);
  const [detailedStatus, setDetailedStatus] = useState(null);
  const [showMonitor, setShowMonitor] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mise à jour automatique des statistiques
  useEffect(() => {
    const updateStats = () => {
      if (groqService) {
        setStats(groqService.getStatistics());
        setDetailedStatus(groqService.getDetailedStatus());
        setLastUpdate(new Date());
      }
    };

    // Mise à jour immédiate
    updateStats();

    // Mise à jour toutes les 10 secondes
    const interval = setInterval(updateStats, 10000);

    return () => clearInterval(interval);
  }, [groqService]);

  // Actions
  const resetAllKeys = () => {
    if (groqService) {
      groqService.resetKeys();
      setStats(groqService.getStatistics());
      setDetailedStatus(groqService.getDetailedStatus());
    }
  };

  const resetSingleKey = (keyIndex) => {
    if (groqService) {
      groqService.resetKey(keyIndex);
      setStats(groqService.getStatistics());
      setDetailedStatus(groqService.getDetailedStatus());
    }
  };

  // Formatage des dates
  const formatDate = (date) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleTimeString('fr-FR');
  };

  const formatDateLong = (date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleString('fr-FR');
  };

  // Calcul du temps restant de blocage
  const getTimeUntilUnblock = (blockedUntil) => {
    if (!blockedUntil) return null;
    
    const now = new Date();
    const until = new Date(blockedUntil);
    const diff = until - now;
    
    if (diff <= 0) return 'Déblocage imminent';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`;
    }
    return `${minutes}min`;
  };

  // Bouton flottant pour ouvrir le moniteur
  if (!showMonitor) {
    return (
      <button 
        onClick={() => setShowMonitor(true)}
        className="monitor-toggle-btn"
        title="Surveiller les clés API Groq"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: detailedStatus?.availableKeys > 0 ? '#4CAF50' : '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        🔑
        {detailedStatus && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: detailedStatus.availableKeys > 0 ? '#4CAF50' : '#f44336',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {detailedStatus.availableKeys}
          </div>
        )}
      </button>
    );
  }

  // Interface complète du moniteur
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #4CAF50',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '450px',
      maxHeight: '70vh',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#4CAF50', fontSize: '18px' }}>
          🔑 Moniteur Clés Groq
        </h3>
        <button 
          onClick={() => setShowMonitor(false)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '20px', 
            cursor: 'pointer',
            color: '#666'
          }}
          title="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Statistiques globales */}
      {detailedStatus && (
        <div style={{
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Total clés:</strong> {detailedStatus.totalKeys}</span>
            <span><strong>Disponibles:</strong> {detailedStatus.availableKeys}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Clé active:</strong> {detailedStatus.currentKeyIndex}</span>
            <span><strong>Dernière MAJ:</strong> {formatDate(lastUpdate)}</span>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{ 
        marginBottom: '15px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={resetAllKeys}
          style={{
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          title="Réinitialiser toutes les clés"
        >
          🔄 Reset tout
        </button>
        
        <button 
          onClick={() => {
            setStats(groqService.getStatistics());
            setDetailedStatus(groqService.getDetailedStatus());
            setLastUpdate(new Date());
          }}
          style={{
            background: '#6366F1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          title="Actualiser les données"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Liste des clés */}
      <div style={{ fontSize: '14px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
          État des clés API
        </h4>
        
        {stats.map((key, index) => (
          <div key={key.keyId} style={{
            padding: '12px',
            margin: '8px 0',
            background: key.isBlocked ? '#ffebee' : '#e8f5e8',
            borderRadius: '8px',
            border: `2px solid ${key.isBlocked ? '#f44336' : '#4CAF50'}`,
            position: 'relative'
          }}>
            {/* En-tête de la clé */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: key.isBlocked ? '#f44336' : '#4CAF50',
                fontSize: '15px'
              }}>
                🔑 Clé {key.keyId} {key.isBlocked ? '🚫' : '✅'}
              </div>
              
              {key.isBlocked && (
                <button
                  onClick={() => resetSingleKey(index)}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Débloquer cette clé"
                >
                  🔓 Débloquer
                </button>
              )}
            </div>

            {/* Statistiques de la clé */}
            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>📊 Requêtes: <strong>{key.requestCount}</strong></span>
                <span>❌ Erreurs: <strong>{key.errorCount}</strong></span>
              </div>
              
              <div style={{ marginBottom: '4px' }}>
                <span>🕐 Dernière utilisation: <strong>{formatDate(key.lastUsed)}</strong></span>
              </div>
              
              {key.isBlocked && key.blockedUntil && (
                <div style={{ 
                  color: '#f44336', 
                  fontWeight: 'bold',
                  marginTop: '6px',
                  padding: '6px',
                  background: 'rgba(244, 67, 54, 0.1)',
                  borderRadius: '4px'
                }}>
                  🚫 Bloquée jusqu'à: {formatDateLong(key.blockedUntil)}
                  <br />
                  ⏰ Temps restant: {getTimeUntilUnblock(key.blockedUntil)}
                </div>
              )}
              
              {!key.isBlocked && key.errorCount > 0 && (
                <div style={{ 
                  color: '#ff9800', 
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  ⚠️ Attention: {key.errorCount} erreur(s) récente(s)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pied de page avec informations */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#f0f0f0',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>💡 <strong>Info:</strong> Les clés se débloquent automatiquement</div>
        <div>🔄 Rotation automatique en cas d'erreur</div>
        <div>📈 Mise à jour toutes les 10 secondes</div>
      </div>
    </div>
  );
};

export default GroqKeyMonitor;
