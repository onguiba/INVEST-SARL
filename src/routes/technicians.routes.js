/**
 * TECHNOVA - Routes Gestion & Disponibilité des Techniciens
 */
const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { requireAuth } = require('../auth');

/**
 * GET /api/technicians
 * Liste des techniciens avec taux d'occupation, missions actives et statut temps réel
 */
router.get('/', requireAuth, (req, res) => {
  const techs = db.all(`
    SELECT 
      u.id, u.full_name, u.email, u.phone, u.avatar_url, u.department,
      (SELECT COUNT(*) FROM interventions WHERE technician_id = u.id AND status = 'En Cours') as in_progress_count,
      (SELECT COUNT(*) FROM interventions WHERE technician_id = u.id AND status = 'Résolue') as resolved_count,
      (SELECT COUNT(*) FROM interventions WHERE technician_id = u.id) as total_count
    FROM users u
    WHERE u.role = 'TECHNICIEN' AND u.status = 'ACTIVE'
    ORDER BY u.full_name ASC
  `);

  // Calcul du taux d'occupation et disponibilité
  const enriched = techs.map(t => {
    const isBusy = t.in_progress_count > 0;
    const availabilityRate = isBusy ? 75 : 100;
    const statusLabel = isBusy ? 'En intervention' : 'Disponible';

    return {
      ...t,
      availability_rate: availabilityRate,
      status_label: statusLabel,
      is_available: !isBusy
    };
  });

  res.json({ success: true, count: enriched.length, technicians: enriched });
});

module.exports = router;

