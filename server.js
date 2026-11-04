/**
 * ============================================================
 * TECHNOVA - BACKEND API & SERVEUR WEB SÉCURISÉ
 * AFRICAN BUSINESS INVEST SARL
 * ============================================================
 */
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const db = require('./database/db');
const { seedDatabase } = require('./database/seed');

// Initialisation et vérification des tables
seedDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Journalisation légère des requêtes (Audit)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Distribution des fichiers statiques (Frontend TECHNOVA)
app.use(express.static(path.join(__dirname)));

// Endpoint de santé du serveur
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.get('SELECT COUNT(*) as count FROM users').count;
    res.json({
      status: 'UP',
      app: 'TECHNOVA API',
      company: 'AFRICAN BUSINESS INVEST SARL',
      database: 'SQLite 3 (node:sqlite native WAL mode)',
      total_users: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Enregistrement des routes de l'API
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/interventions', require('./src/routes/interventions.routes'));
app.use('/api/equipments', require('./src/routes/equipments.routes'));
app.use('/api/technicians', require('./src/routes/technicians.routes'));
app.use('/api/stats', require('./src/routes/stats.routes'));
app.use('/api/notifications', require('./src/routes/notifications.routes'));

// Gestion des routes 404
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Route API introuvable : ${req.method} ${req.path}` });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`
  ==============================================================
   🚀 TECHNOVA - SERVEUR API & BASE DE DONNÉES EN LIGNE !
   🏢 Entreprise : AFRICAN BUSINESS INVEST SARL
   📍 URL Application Web : http://localhost:${PORT}
   🔌 API Base URL        : http://localhost:${PORT}/api
   🩺 Health Check        : http://localhost:${PORT}/api/health
  ==============================================================
  `);
});

module.exports = { app, server };

