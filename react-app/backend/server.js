const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'ÉtudIA V4.1 Backend API',
    status: 'active',
    version: '4.1.0'
  });
});

// Route health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 ÉtudIA V4.1 API running on port ${PORT}`);
});
