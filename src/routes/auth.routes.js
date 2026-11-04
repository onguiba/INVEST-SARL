/**
 * TECHNOVA - Routes d'Authentification & Gestion des Profils
 */
const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { hashPassword, verifyPassword, generateToken, requireAuth, requireRoles } = require('../auth');

/**
 * POST /api/auth/register-client
 * Inscription obligatoire d'un nouveau Client / Demandeur
 */
router.post('/register-client', (req, res) => {
  const { full_name, email, password, department, phone } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nom complet, email et mot de passe requis.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Vérification du format email simple
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return res.status(400).json({ success: false, message: 'Format d\'adresse email invalide.' });
  }

  // Vérification de la longueur du mot de passe
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  // Vérification de l'unicité de l'email
  const existing = db.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Un compte avec cette adresse email existe déjà. Veuillez vous connecter.' });
  }

  const { hash, salt } = hashPassword(password);
  const avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  const result = db.run(`
    INSERT INTO users (full_name, email, password_hash, salt, role, department, phone, avatar_url, status)
    VALUES (?, ?, ?, ?, 'CLIENT', ?, ?, ?, 'ACTIVE')
  `, [
    full_name.trim(),
    cleanEmail,
    hash,
    salt,
    department ? department.trim() : 'Client Demandeur ABI',
    phone ? phone.trim() : '+237 600 00 00 00',
    avatarUrl
  ]);

  const newUser = {
    id: result.lastInsertRowid,
    full_name: full_name.trim(),
    email: cleanEmail,
    role: 'CLIENT',
    department: department ? department.trim() : 'Client Demandeur ABI',
    phone: phone ? phone.trim() : '',
    avatar_url: avatarUrl
  };

  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Compte client créé avec succès ! Bienvenue sur TECHNOVA.',
    token,
    user: newUser
  });
});

/**
 * POST /api/auth/login
 * Authentification sécurisée par email + mot de passe
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
  }

  const user = db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, message: 'Compte désactivé ou suspendu.' });
  }

  const isMatch = verifyPassword(password, user.password_hash, user.salt);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Authentification réussie.',
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar_url: user.avatar_url
    }
  });
});

/**
 * GET /api/auth/me
 * Profil de l'utilisateur connecté
 */
router.get('/me', requireAuth, (req, res) => {
  const user = db.get('SELECT id, full_name, email, role, department, phone, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  }
  res.json({ success: true, user });
});

/**
 * GET /api/auth/users
 * Liste des utilisateurs (Réservé aux Administrateurs et Responsables Techniques)
 */
router.get('/users', requireAuth, requireRoles('ADMIN', 'RESP_TECH'), (req, res) => {
  const users = db.all('SELECT id, full_name, email, role, department, phone, avatar_url, status, created_at FROM users ORDER BY id ASC');
  res.json({ success: true, count: users.length, users });
});

module.exports = router;

