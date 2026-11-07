/**
 * TECHNOVA - Routes de Gestion des Interventions Techniques
 */
const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { requireAuth, requireRoles } = require('../auth');
const {
  notifyNewInterventionFromClient,
  notifyTechnicianAssignment,
  notifyStatusChange,
  notifyAllStakeholders
} = require('../notificationHelper');

/**
 * GET /api/interventions
 * Liste des interventions avec filtrage selon le rôle :
 * - ADMIN / RESP_TECH : voient toutes les interventions
 * - TECHNICIEN : voit ses propres interventions affectées
 * - CLIENT : voit uniquement ses demandes créées
 */
router.get('/', requireAuth, (req, res) => {
  const { status, priority, search } = req.query;
  let sql = `
    SELECT 
      i.id, i.reference, i.title, i.description, i.priority, i.status,
      i.scheduled_at, i.started_at, i.resolved_at, i.duration_minutes, i.observations,
      i.created_at,
      e.id as equipment_id, e.code as equipment_code, e.name as equipment_name, e.location as equipment_location,
      t.id as tech_id, t.full_name as tech_name, t.avatar_url as tech_avatar,
      r.id as requester_id, r.full_name as requester_name
    FROM interventions i
    JOIN equipments e ON i.equipment_id = e.id
    JOIN users r ON i.requester_id = r.id
    LEFT JOIN users t ON i.technician_id = t.id
    WHERE 1=1
  `;
  const params = [];

  // Filtrage selon le rôle
  if (req.user.role === 'TECHNICIEN') {
    sql += ' AND i.technician_id = ?';
    params.push(req.user.id);
  } else if (req.user.role === 'CLIENT') {
    sql += ' AND i.requester_id = ?';
    params.push(req.user.id);
  }

  // Filtres optionnels
  if (status && status !== 'ALL') {
    sql += ' AND i.status = ?';
    params.push(status);
  }
  if (priority && priority !== 'ALL') {
    sql += ' AND i.priority = ?';
    params.push(priority);
  }
  if (search) {
    sql += ' AND (i.reference LIKE ? OR i.title LIKE ? OR e.name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY i.id DESC';

  const rows = db.all(sql, params);
  res.json({ success: true, count: rows.length, interventions: rows });
});

/**
 * GET /api/interventions/:id
 * Détails complets d'une intervention avec historique des logs
 */
router.get('/:id', requireAuth, (req, res) => {
  const intervention = db.get(`
    SELECT 
      i.*,
      e.code as equipment_code, e.name as equipment_name, e.location as equipment_location,
      t.full_name as tech_name, t.phone as tech_phone, t.avatar_url as tech_avatar,
      r.full_name as requester_name, r.department as requester_department
    FROM interventions i
    JOIN equipments e ON i.equipment_id = e.id
    JOIN users r ON i.requester_id = r.id
    LEFT JOIN users t ON i.technician_id = t.id
    WHERE i.id = ? OR i.reference = ?
  `, [req.params.id, req.params.id]);

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.' });
  }

  const logs = db.all(`
    SELECT l.*, u.full_name as author_name
    FROM intervention_logs l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.intervention_id = ?
    ORDER BY l.id ASC
  `, [intervention.id]);

  res.json({ success: true, intervention, logs });
});

/**
 * POST /api/interventions
 * Création d'une nouvelle demande ou intervention
 */
router.post('/', requireAuth, (req, res) => {
  const { equipment_id, title, description, priority, scheduled_at, technician_id } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Le titre ou motif de la demande est obligatoire.' });
  }

  // Résolution intelligente de l'équipement
  let equipId = equipment_id;
  if (!equipId || isNaN(parseInt(equipId))) {
    const searchName = equipment_id ? String(equipment_id).trim() : title;
    const found = db.get('SELECT id FROM equipments WHERE name LIKE ? OR code LIKE ? LIMIT 1', [`%${searchName}%`, `%${searchName}%`]);
    equipId = found ? found.id : 1;
  }

  // Génération automatique de la référence (ex: INT-2025-005)
  const last = db.get('SELECT id FROM interventions ORDER BY id DESC LIMIT 1');
  const nextId = (last ? last.id : 0) + 1;
  const reference = `INT-2025-${String(nextId).padStart(3, '0')}`;

  const prio = priority || 'Moyenne';
  const initialStatus = technician_id ? 'Affectée' : 'En Attente';

  let techId = technician_id || null;
  if (techId && isNaN(parseInt(techId))) {
    const foundTech = db.get('SELECT id FROM users WHERE full_name LIKE ? AND role = "TECHNICIEN" LIMIT 1', [`%${technician_id}%`]);
    techId = foundTech ? foundTech.id : null;
  }

  const result = db.run(`
    INSERT INTO interventions (reference, title, description, priority, status, equipment_id, requester_id, technician_id, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    reference,
    title,
    description || title,
    prio,
    initialStatus,
    equipId,
    req.user.id,
    techId,
    scheduled_at || null
  ]);

  // Log de création
  db.run(`
    INSERT INTO intervention_logs (intervention_id, user_id, action, new_status, comment)
    VALUES (?, ?, 'CREATION', ?, 'Création de la demande d’intervention')
  `, [result.lastInsertRowid, req.user.id, initialStatus]);

  // Notification pour les responsables si soumise par un client
  if (req.user.role === 'CLIENT') {
    notifyNewInterventionFromClient(result.lastInsertRowid, req.user.full_name, title);
  } else if (techId) {
    // Si affectée immédiatement, notifier le technicien
    notifyTechnicianAssignment(result.lastInsertRowid, techId, req.user.full_name);
  }

  res.status(201).json({
    success: true,
    message: 'Intervention enregistrée avec succès dans la base de données.',
    reference,
    id: result.lastInsertRowid
  });
});

/**
 * PATCH /api/interventions/:id/assign
 * Affectation d'un technicien (RESP_TECH ou ADMIN)
 */
router.patch('/:id/assign', requireAuth, requireRoles('ADMIN', 'RESP_TECH'), (req, res) => {
  const { technician_id, scheduled_at, comment } = req.body;

  if (!technician_id) {
    return res.status(400).json({ success: false, message: 'Identifiant du technicien requis.' });
  }

  const intervention = db.get('SELECT * FROM interventions WHERE id = ? OR reference = ?', [req.params.id, req.params.id]);
  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.' });
  }

  let techId = technician_id;
  if (isNaN(parseInt(techId))) {
    const foundTech = db.get('SELECT id FROM users WHERE full_name LIKE ? AND role = "TECHNICIEN" LIMIT 1', [`%${technician_id}%`]);
    techId = foundTech ? foundTech.id : 3;
  }

  const tech = db.get('SELECT id, full_name FROM users WHERE id = ?', [techId]);

  db.run(`
    UPDATE interventions
    SET technician_id = ?, status = 'Affectée', scheduled_at = COALESCE(?, scheduled_at), updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [techId, scheduled_at || new Date().toISOString(), intervention.id]);

  // Log d'audit
  db.run(`
    INSERT INTO intervention_logs (intervention_id, user_id, action, previous_status, new_status, comment)
    VALUES (?, ?, 'AFFECTATION', ?, 'Affectée', ?)
  `, [intervention.id, req.user.id, intervention.status, comment || `Affecté à ${tech ? tech.full_name : techId}`]);

  // Notification pour le technicien et le demandeur
  notifyTechnicianAssignment(intervention.id, techId, req.user.full_name);

  res.json({
    success: true,
    message: `Mission ${intervention.reference} affectée avec succès à ${tech ? tech.full_name : 'Technicien'}.`,
    intervention_id: intervention.id,
    technician_name: tech ? tech.full_name : ''
  });
});

/**
 * PATCH /api/interventions/:id/status
 * Mise à jour de l'état (TECHNICIEN, RESP_TECH ou ADMIN)
 */
router.patch('/:id/status', requireAuth, (req, res) => {
  const { status, observations, duration_minutes } = req.body;

  const validStatuses = ['En Attente', 'Affectée', 'En Cours', 'Résolue', 'Clôturée', 'Planifiée'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide.' });
  }

  const intervention = db.get('SELECT * FROM interventions WHERE id = ? OR reference = ?', [req.params.id, req.params.id]);
  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.' });
  }

  let started_at = intervention.started_at;
  let resolved_at = intervention.resolved_at;

  if (status === 'En Cours' && !started_at) {
    started_at = new Date().toISOString();
  }
  if (status === 'Résolue' && !resolved_at) {
    resolved_at = new Date().toISOString();
  }

  const obsVal = (observations !== undefined && observations !== null) ? observations : null;
  const durVal = (duration_minutes !== undefined && duration_minutes !== null) ? parseInt(duration_minutes) : null;

  db.run(`
    UPDATE interventions
    SET status = ?,
        observations = CASE WHEN ? IS NOT NULL THEN ? ELSE observations END,
        duration_minutes = CASE WHEN ? IS NOT NULL THEN ? ELSE duration_minutes END,
        started_at = CASE WHEN ? IS NOT NULL THEN ? ELSE started_at END,
        resolved_at = CASE WHEN ? IS NOT NULL THEN ? ELSE resolved_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    status,
    obsVal, obsVal,
    durVal, durVal,
    started_at || null, started_at || null,
    resolved_at || null, resolved_at || null,
    intervention.id
  ]);

  db.run(`
    INSERT INTO intervention_logs (intervention_id, user_id, action, previous_status, new_status, comment)
    VALUES (?, ?, 'STATUT_CHANGE', ?, ?, ?)
  `, [intervention.id, req.user.id, intervention.status, status, observations || 'Changement de statut']);

  // Notifier tous les acteurs concernés
  notifyStatusChange(intervention.id, intervention.status, status, req.user.id);

  res.json({
    success: true,
    message: `Statut de ${intervention.reference} passé à [${status}] dans la base de données.`,
    status
  });
});

module.exports = router;

