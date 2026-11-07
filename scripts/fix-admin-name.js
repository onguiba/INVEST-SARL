/**
 * Script pour mettre à jour le nom de l'administrateur en base de données
 */
const db = require('../database/db');

try {
  // Mise à jour dans la base de données SQLite
  const result = db.db.prepare(
    "UPDATE users SET full_name = 'Administrateur', avatar_url = './assets/images/image-administrateur.jpeg' WHERE role = 'ADMIN'"
  ).run();
  
  console.log('✅ Nom administrateur mis à jour:', result.changes, 'utilisateur(s) modifié(s)');
  
  // Vérification
  const admin = db.get("SELECT full_name, email, role FROM users WHERE role = 'ADMIN'");
  console.log('👤 Admin actuel:', admin);
} catch (err) {
  console.error('❌ Erreur:', err.message);
}

