/**
 * TECHNOVA - Routes Gestion du Parc des Équipements
 */
const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { requireAuth, requireRoles } = require('../auth');

/**
 * GET /api/equipments
 * Liste complète des équipements avec statistiques de santé
 */
router.get('/', requireAuth, (req, res) => {
  const equipments = db.all(`
    SELECT 
      e.*,
      u.full_name as assigned_tech_name,
      (SELECT COUNT(*) FROM interventions WHERE equipment_id = e.id) as total_interventions,
      (SELECT COUNT(*) FROM interventions WHERE equipment_id = e.id AND status = 'En Cours') as active_interventions
    FROM equipments e
    LEFT JOIN users u ON e.assigned_tech_id = u.id
    ORDER BY e.code ASC
  `);

  res.json({ success: true, count: equipments.length, equipments });
});

/**
 * GET /api/equipments/:id
 * Fiche détaillée d'un équipement avec historique des interventions
 */
router.get('/:id', requireAuth, (req, res) => {
  const equip = db.get('SELECT * FROM equipments WHERE id = ? OR code = ?', [req.params.id, req.params.id]);
  if (!equip) {
    return res.status(404).json({ success: false, message: 'Équipement introuvable.' });
  }

  const history = db.all(`
    SELECT i.reference, i.title, i.priority, i.status, i.resolved_at, i.observations, u.full_name as tech_name
    FROM interventions i
    LEFT JOIN users u ON i.technician_id = u.id
    WHERE i.equipment_id = ?
    ORDER BY i.id DESC
  `, [equip.id]);

  res.json({ success: true, equipment: equip, history });
});

/**
 * POST /api/equipments
 * Ajout d'un nouvel équipement au parc (ADMIN ou RESP_TECH)
 */
router.post('/', requireAuth, requireRoles('ADMIN', 'RESP_TECH'), (req, res) => {
  const { code, name, category, location, health_score, assigned_tech_id } = req.body;

  if (!code || !name || !category || !location) {
    return res.status(400).json({ success: false, message: 'Code, nom, catégorie et lieu requis.' });
  }

  try {
    const result = db.run(`
      INSERT INTO equipments (code, name, category, location, health_score, assigned_tech_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [code, name, category, location, health_score || 100, assigned_tech_id || null]);

    res.status(201).json({ success: true, message: 'Équipement créé avec succès.', id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur création : ' + err.message });
  }
});

module.exports = router;

