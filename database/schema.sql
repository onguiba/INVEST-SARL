-- ============================================================
-- TECHNOVA DATABASE SCHEMA - AFRICAN BUSINESS INVEST SARL
-- Architecture relationnelle normalisée et sécurisée
-- ============================================================

-- Table des utilisateurs (Administrateur, Responsable Tech, Technicien, Client)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMIN', 'RESP_TECH', 'TECHNICIEN', 'CLIENT')),
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des équipements du parc technique d'AFRICAN BUSINESS INVEST SARL
CREATE TABLE IF NOT EXISTS equipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('Informatique', 'Climatisation', 'Électrotechnique', 'Réseaux', 'Sécurité', 'Autre')),
  location TEXT NOT NULL,
  health_score INTEGER DEFAULT 100 CHECK(health_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'OPERATIONNEL' CHECK(status IN ('OPERATIONNEL', 'EN_PANNE', 'EN_MAINTENANCE', 'REFORME')),
  assigned_tech_id INTEGER REFERENCES users(id),
  last_maintenance_date DATE,
  specifications TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des interventions techniques (Le cœur du système TECHNOVA)
CREATE TABLE IF NOT EXISTS interventions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('Basse', 'Moyenne', 'Haute', 'Critique')),
  status TEXT NOT NULL CHECK(status IN ('En Attente', 'Affectée', 'En Cours', 'Résolue', 'Clôturée', 'Planifiée')),
  equipment_id INTEGER NOT NULL REFERENCES equipments(id),
  requester_id INTEGER NOT NULL REFERENCES users(id),
  technician_id INTEGER REFERENCES users(id),
  scheduled_at DATETIME,
  started_at DATETIME,
  resolved_at DATETIME,
  duration_minutes INTEGER DEFAULT 0,
  observations TEXT,
  solution_applied TEXT,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  client_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table d'audit des actions et historique des transitions
CREATE TABLE IF NOT EXISTS intervention_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intervention_id INTEGER NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications utilisateurs
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO' CHECK(type IN ('INFO', 'WARNING', 'SUCCESS', 'ALERT')),
  is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
  related_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_tech ON interventions(technician_id);
CREATE INDEX IF NOT EXISTS idx_interventions_requester ON interventions(requester_id);
CREATE INDEX IF NOT EXISTS idx_equipments_code ON equipments(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

