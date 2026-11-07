/**
 * TECHNOVA - Helper de Notifications
 * Système intelligent de partage d'informations entre rôles
 */
const db = require('../database/db');

/**
 * Crée une notification pour un ou plusieurs utilisateurs
 * @param {number|number[]} userIds - ID(s) du/des destinataire(s)
 * @param {string} title - Titre de la notification
 * @param {string} message - Message détaillé
 * @param {string} type - Type: INFO, SUCCESS, WARNING, ERROR
 * @param {string} relatedRef - Référence associée (ex: INT-2025-001)
 */
function createNotification(userIds, title, message, type = 'INFO', relatedRef = null) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  
  ids.forEach(userId => {
    try {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type, related_reference)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, title, message, type, relatedRef]);
    } catch (error) {
      console.error(`Erreur création notification pour user ${userId}:`, error.message);
    }
  });
}

/**
 * Notifie les responsables techniques et admins
 */
function notifyResponsibles(title, message, type = 'INFO', relatedRef = null) {
  const responsibles = db.all(`
    SELECT id FROM users 
    WHERE role IN ('RESP_TECH', 'ADMIN') AND status = 'ACTIVE'
  `);
  
  const ids = responsibles.map(r => r.id);
  if (ids.length > 0) {
    createNotification(ids, title, message, type, relatedRef);
  }
}

/**
 * Notifie un technicien spécifique
 */
function notifyTechnician(technicianId, title, message, type = 'INFO', relatedRef = null) {
  const tech = db.get('SELECT id FROM users WHERE id = ? AND role = "TECHNICIEN"', [technicianId]);
  if (tech) {
    createNotification(tech.id, title, message, type, relatedRef);
  }
}

/**
 * Notifie le demandeur/client d'une intervention
 */
function notifyRequester(interventionId, title, message, type = 'INFO') {
  const intervention = db.get(`
    SELECT i.reference, i.requester_id, u.full_name as requester_name
    FROM interventions i
    JOIN users u ON i.requester_id = u.id
    WHERE i.id = ?
  `, [interventionId]);
  
  if (intervention) {
    createNotification(
      intervention.requester_id, 
      title, 
      message, 
      type, 
      intervention.reference
    );
  }
}

/**
 * Notifie tous les acteurs d'une intervention (technicien + demandeur + responsables)
 */
function notifyAllStakeholders(interventionId, title, message, type = 'INFO', excludeUserId = null) {
  const intervention = db.get(`
    SELECT i.reference, i.requester_id, i.technician_id
    FROM interventions i
    WHERE i.id = ?
  `, [interventionId]);
  
  if (!intervention) return;
  
  const userIds = new Set();
  
  // Ajouter le demandeur
  if (intervention.requester_id && intervention.requester_id !== excludeUserId) {
    userIds.add(intervention.requester_id);
  }
  
  // Ajouter le technicien
  if (intervention.technician_id && intervention.technician_id !== excludeUserId) {
    userIds.add(intervention.technician_id);
  }
  
  // Ajouter les responsables
  const responsibles = db.all(`
    SELECT id FROM users 
    WHERE role IN ('RESP_TECH', 'ADMIN') AND status = 'ACTIVE'
  `);
  
  responsibles.forEach(r => {
    if (r.id !== excludeUserId) {
      userIds.add(r.id);
    }
  });
  
  if (userIds.size > 0) {
    createNotification(
      Array.from(userIds), 
      title, 
      message, 
      type, 
      intervention.reference
    );
  }
}

/**
 * Notifie en cas de nouvelle intervention créée par un client
 */
function notifyNewInterventionFromClient(interventionId, clientName, interventionTitle) {
  const intervention = db.get('SELECT reference FROM interventions WHERE id = ?', [interventionId]);
  if (!intervention) return;
  
  notifyResponsibles(
    'Nouvelle demande client',
    `${clientName} a créé une nouvelle demande : "${interventionTitle}"`,
    'WARNING',
    intervention.reference
  );
}

/**
 * Notifie l'affectation d'un technicien
 */
function notifyTechnicianAssignment(interventionId, technicianId, assignedBy) {
  const intervention = db.get(`
    SELECT i.reference, i.title, i.requester_id
    FROM interventions i
    WHERE i.id = ?
  `, [interventionId]);
  
  if (!intervention) return;
  
  // Notifier le technicien
  notifyTechnician(
    technicianId,
    'Nouvelle mission affectée',
    `Vous avez été affecté à l'intervention ${intervention.reference} : "${intervention.title}"`,
    'INFO',
    intervention.reference
  );
  
  // Notifier le demandeur
  if (intervention.requester_id) {
    createNotification(
      intervention.requester_id,
      'Technicien affecté à votre demande',
      `Un technicien a été affecté à votre intervention ${intervention.reference}`,
      'SUCCESS',
      intervention.reference
    );
  }
}

/**
 * Notifie le changement de statut d'une intervention
 */
function notifyStatusChange(interventionId, oldStatus, newStatus, userId) {
  const intervention = db.get(`
    SELECT i.reference, i.title, i.requester_id, i.technician_id,
           u.full_name as user_name
    FROM interventions i
    LEFT JOIN users u ON u.id = ?
    WHERE i.id = ?
  `, [userId, interventionId]);
  
  if (!intervention) return;
  
  const statusMessages = {
    'En Attente': 'est en attente d\'affectation',
    'Affectée': 'a été affectée à un technicien',
    'Planifiée': 'est planifiée',
    'En Cours': 'est en cours de traitement',
    'Résolue': 'a été résolue avec succès',
    'Clôturée': 'est clôturée'
  };
  
  const message = `L'intervention ${intervention.reference} ${statusMessages[newStatus] || 'a changé de statut'}`;
  
  // Notifier tous les acteurs sauf celui qui a fait le changement
  notifyAllStakeholders(
    interventionId,
    'Évolution d\'intervention',
    message,
    newStatus === 'Résolue' ? 'SUCCESS' : 'INFO',
    userId
  );
}

/**
 * Notifie l'ajout d'un commentaire ou observation
 */
function notifyNewComment(interventionId, commentAuthorId, commentText) {
  const intervention = db.get(`
    SELECT i.reference, i.title, u.full_name as author_name
    FROM interventions i
    LEFT JOIN users u ON u.id = ?
    WHERE i.id = ?
  `, [commentAuthorId, interventionId]);
  
  if (!intervention) return;
  
  notifyAllStakeholders(
    interventionId,
    'Nouveau commentaire',
    `${intervention.author_name || 'Un utilisateur'} a ajouté un commentaire sur ${intervention.reference}`,
    'INFO',
    commentAuthorId
  );
}

module.exports = {
  createNotification,
  notifyResponsibles,
  notifyTechnician,
  notifyRequester,
  notifyAllStakeholders,
  notifyNewInterventionFromClient,
  notifyTechnicianAssignment,
  notifyStatusChange,
  notifyNewComment
};
