/**
 * TECHNOVA - Routes de Notifications en temps réel
 */
const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { requireAuth } = require('../auth');

/**
 * GET /api/notifications
 * Notifications de l'utilisateur connecté (dernières 20)
 */
router.get('/', requireAuth, (req, res) => {
  const notifications = db.all(`
    SELECT id, title, message, type, is_read, related_reference, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 20
  `, [req.user.id]);

  const unread = notifications.filter(n => !n.is_read).length;

  res.json({ success: true, notifications, unread_count: unread });
});

/**
 * PATCH /api/notifications/:id/read
 * Marquer une notification comme lue
 */
router.patch('/:id/read', requireAuth, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

/**
 * PATCH /api/notifications/read-all
 * Marquer toutes les notifications comme lues
 */
router.patch('/read-all', requireAuth, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ success: true, message: 'Toutes les notifications marquées comme lues.' });
});

module.exports = router;

