/**
 * TECHNOVA - Connexion & Gestion de la Base de Données SQLite
 * AFRICAN BUSINESS INVEST SARL
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = path.join(__dirname, 'technova.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Initialisation de la base SQLite
const db = new DatabaseSync(DB_PATH);

// Activation des clés étrangères et du mode WAL pour les performances
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialisation du schéma
function initSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
  }
}

initSchema();

module.exports = {
  db,
  // Helper pour exécuter une requête avec retour d'un seul élément
  get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  // Helper pour exécuter une requête retournant une liste
  all(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  // Helper pour insert / update / delete avec retour des métadonnées
  run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }
};

