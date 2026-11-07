/**
 * TECHNOVA - Peuplement de la Base de Données (Seed)
 * Données réelles & cohérentes pour AFRICAN BUSINESS INVEST SARL
 */
const db = require('./db');
const { hashPassword } = require('../src/auth');

function seedDatabase() {
  console.log('🔄 Initialisation et peuplement de la base de données TECHNOVA...');

  // ================================================================
  // GARANTIE ADMIN — Toujours s'assurer que l'admin existe avec
  // les bons identifiants, même si la BDD a déjà des utilisateurs
  // ================================================================
  const adminPass = hashPassword('123456');
  db.db.prepare(`
    INSERT INTO users (full_name, email, password_hash, salt, role, department, phone, avatar_url, status)
    VALUES (?, ?, ?, ?, 'ADMIN', ?, ?, ?, 'ACTIVE')
    ON CONFLICT(email) DO UPDATE SET
      full_name     = excluded.full_name,
      password_hash = excluded.password_hash,
      salt          = excluded.salt,
      role          = excluded.role,
      status        = 'ACTIVE'
  `).run(
    'Administrateur',
    'ndamdieujo@gmail.com',
    adminPass.hash, adminPass.salt,
    'Direction Générale & Systèmes',
    '+237 690 00 01 01',
    './assets/images/image-administrateur.jpeg'
  );
  console.log('🔑 Admin garanti : ndamdieujo@gmail.com / 123456');

  // 1. Autres utilisateurs (seulement si la BDD est vide)
  const existingUsers = db.get('SELECT COUNT(*) as count FROM users');
  if (existingUsers.count <= 1) {
    const insertUser = db.db.prepare(`
      INSERT OR IGNORE INTO users (full_name, email, password_hash, salt, role, department, phone, avatar_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);

    const respPass   = hashPassword('resp123');
    const techPass   = hashPassword('tech123');
    const clientPass = hashPassword('client123');

    insertUser.run(
      'Michel Ndongo',
      'michel@africanbusiness.cm',
      respPass.hash, respPass.salt,
      'RESP_TECH',
      'Supervision Maintenance & Travaux',
      '+237 690 00 02 02',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    );

    insertUser.run(
      'Jean Mbarga',
      'jean@africanbusiness.cm',
      techPass.hash, techPass.salt,
      'TECHNICIEN',
      'Maintenance Systèmes & Réseaux',
      '+237 690 00 03 03',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    );

    insertUser.run(
      'Paul Nguema',
      'paul.nguema@african-invest.cm',
      techPass.hash, techPass.salt,
      'TECHNICIEN',
      'Génie Climatique & Froid',
      '+237 690 00 04 04',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    );

    insertUser.run(
      'Marie Tchinda',
      'marie.tchinda@african-invest.cm',
      techPass.hash, techPass.salt,
      'TECHNICIEN',
      'Télécom & Câblage Réseau',
      '+237 690 00 05 05',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
    );

    insertUser.run(
      'Direction Financière ABI',
      'client@africanbusiness.cm',
      clientPass.hash, clientPass.salt,
      'CLIENT',
      'Département Finance & Comptabilité',
      '+237 690 00 06 06',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
    );

    console.log('✅ Autres utilisateurs créés:');
    console.log('   - RESP_TECH: michel@africanbusiness.cm / resp123');
    console.log('   - TECHNICIEN: jean@africanbusiness.cm / tech123');
    console.log('   - CLIENT: client@africanbusiness.cm / client123');
  }

  // 2. Équipements
  const existingEquip = db.get('SELECT COUNT(*) as count FROM equipments');
  if (existingEquip.count === 0) {
    const insertEquip = db.db.prepare(`
      INSERT INTO equipments (code, name, category, location, health_score, status, last_maintenance_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertEquip.run('EQP-SRV-01', 'Serveur Principal Dell EMC PowerEdge', 'Informatique', 'Salle Serveurs RDC', 98, 'OPERATIONNEL', '2025-10-27');
    insertEquip.run('EQP-CLM-04', 'Climatisation Centrale Bureaux', 'Climatisation', 'Toit Bâtiment Principal', 91, 'OPERATIONNEL', '2025-10-26');
    insertEquip.run('EQP-NET-09', 'Switch Core Fibre Cisco Catalyst', 'Réseaux', 'Étage 2 - DSI', 99, 'OPERATIONNEL', '2025-10-26');
    insertEquip.run('EQP-GEN-02', 'Groupe Électrogène Cummins 150kVA', 'Électrotechnique', 'Zone Technique Sud', 85, 'OPERATIONNEL', '2025-10-25');
    insertEquip.run('EQP-ASC-03', 'Ascenseur Principal Bâtiment A', 'Autre', 'Hall Central', 95, 'OPERATIONNEL', '2025-10-20');

    console.log('✅ 5 équipements enregistrés au parc technique');
  }

  // 3. Interventions initiales
  const existingInterventions = db.get('SELECT COUNT(*) as count FROM interventions');
  if (existingInterventions.count === 0) {
    const insertIntervention = db.db.prepare(`
      INSERT INTO interventions (reference, title, description, priority, status, equipment_id, requester_id, technician_id, scheduled_at, started_at, resolved_at, duration_minutes, observations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // INT-2025-001 (En Cours)
    insertIntervention.run(
      'INT-2025-001',
      'Alerte température Serveur Principal',
      'Surchauffe signalée dans la baie B1. Remplacement d’un ventilateur châssis et nettoyage filtres anti-poussière.',
      'Haute',
      'En Cours',
      1, // EQP-SRV-01
      1, // Admin requester
      3, // Jean Mbarga
      '2025-10-27 09:00:00',
      '2025-10-27 09:30:00',
      null,
      45,
      'Ventilateur de rechange posé, test de charge thermique en cours.'
    );

    // INT-2025-002 (Résolue)
    insertIntervention.run(
      'INT-2025-002',
      'Maintenance Climatisation Bureaux',
      'Recharge de fluide frigorigène R410A et désinfection des gaines d’aération.',
      'Moyenne',
      'Résolue',
      2, // EQP-CLM-04
      6, // Client Direction Finance
      4, // Paul Nguema
      '2025-10-26 14:00:00',
      '2025-10-26 14:30:00',
      '2025-10-26 16:45:00',
      135,
      'Pression rétablie, débit d’air normalisé dans tous les bureaux.'
    );

    // INT-2025-003 (En Attente)
    insertIntervention.run(
      'INT-2025-003',
      'Câblage réseau bureau comptabilité',
      'Création de 2 prises réseau RJ45 Cat6 blindées pour le pôle facturation.',
      'Basse',
      'En Attente',
      3, // EQP-NET-09
      6, // Client Direction Finance
      5, // Marie Tchinda
      '2025-10-28 10:00:00',
      null,
      null,
      0,
      'En attente de réception des cordons de brassage.'
    );

    // INT-2025-004 (Planifiée)
    insertIntervention.run(
      'INT-2025-004',
      'Vidange et test de charge Groupe Électrogène',
      'Maintenance préventive trimestrielle : vidange huile moteur, filtres gazole et contrôle batterie.',
      'Haute',
      'Planifiée',
      4, // EQP-GEN-02
      2, // Michel Ndongo
      3, // Jean Mbarga
      '2025-10-30 08:30:00',
      null,
      null,
      0,
      'Coupure programmée de 15 minutes validée avec la direction.'
    );

    console.log('✅ 4 interventions principales initialisées');
  }

  // 4. Notifications initiales
  const existingNotifs = db.get('SELECT COUNT(*) as count FROM notifications');
  if (existingNotifs.count === 0) {
    const insertNotif = db.db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, related_reference)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertNotif.run(1, 'Intervention en cours', 'Jean Mbarga a démarré l’intervention sur le Serveur Principal.', 'INFO', 'INT-2025-001');
    insertNotif.run(1, 'Intervention terminée', 'Paul Nguema a clôturé avec succès la maintenance Climatisation.', 'SUCCESS', 'INT-2025-002');
    insertNotif.run(1, 'Nouvelle demande', 'La Direction Financière a soumis une demande d’extension réseau.', 'WARNING', 'INT-2025-003');

    console.log('✅ 3 notifications initiales créées');
  }

  console.log('🎉 Base de données TECHNOVA prête et fonctionnelle.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

