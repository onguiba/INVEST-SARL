/**
 * TECHNOVA - Module de Sécurité & Authentification (RBAC)
 * Chiffrement des mots de passe (PBKDF2 / scrypt) et gestion des jetons signés
 */
const crypto = require('node:crypto');
const db = require('../database/db');

const SECRET_KEY = process.env.TECHNOVA_SECRET || 'TECHNOVA_SECURE_KEY_AFRICAN_BUSINESS_INVEST_2026_@!';

/**
 * Hashe un mot de passe en utilisant scrypt et un sel cryptographique unique
 */
function hashPassword(password, existingSalt = null) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Vérifie un mot de passe soumis contre le hash et le sel stockés
 */
function verifyPassword(password, storedHash, salt) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

/**
 * Génère un jeton sécurisé signé (Token HMAC-SHA256)
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Valide et décode un jeton
 */
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null; // Expiré
    return payload;
  } catch {
    return null;
  }
}

/**
 * Middleware Express d'authentification obligatoire
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès refusé : Jeton d’authentification manquant.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Accès refusé : Jeton invalide ou expiré.' });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès non autorisé pour le rôle [${req.user.role}]. Rôles requis : ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  requireRoles
};

