# 🔧 Correction des Erreurs d'Authentification - TECHNOVA

## ✅ Problèmes Résolus

### 1. **Erreur 401 (Unauthorized) - API Calls**
**Symptôme:** Toutes les requêtes API retournaient une erreur 401 Unauthorized.

**Cause:** La fonction `quickSwitchDemo()` créait des sessions utilisateur factices **sans générer de token d'authentification valide**. Quand l'application tentait d'appeler les API, aucun token Bearer valide n'était envoyé, ce qui causait le rejet par le middleware `requireAuth`.

**Solution:** 
- La fonction `quickSwitchDemo()` effectue maintenant une vraie connexion via l'API `/api/auth/login`
- Un token valide est généré et stocké dans `localStorage.technova_token`
- Toutes les requêtes API incluent désormais le token Bearer valide

### 2. **Erreur 403 (Forbidden) - Assignation d'Intervention**
**Symptôme:** L'assignation d'intervention retournait une erreur 403 Forbidden.

**Cause:** L'endpoint `/api/interventions/:id/assign` nécessite le rôle `ADMIN` ou `RESP_TECH`. Sans token valide, le rôle ne pouvait pas être vérifié correctement.

**Solution:** Avec le token valide, le rôle est maintenant correctement transmis et vérifié.

### 3. **Erreur "switchActiveRole is not defined"**
**Symptôme:** Console JavaScript montrait "ReferenceError: switchActiveRole is not defined"

**Cause:** Certains boutons HTML appelaient `switchActiveRole()` mais cette fonction n'existait pas dans le code.

**Solution:** Ajout de la fonction `switchActiveRole()` comme alias vers `quickSwitchDemo()`.

---

## 🎯 Comment Utiliser l'Application

### **Étape 1: Démarrer le Serveur**
```bash
node server.js
```

Le serveur démarre sur `http://localhost:3000`

### **Étape 2: Accéder à l'Application**
Ouvrez votre navigateur et allez sur: `http://localhost:3000`

### **Étape 3: Connexion avec Rôles de Démonstration**

L'application dispose de 4 rôles pré-configurés avec des utilisateurs de test:

#### 👑 **ADMIN** (Administrateur)
- **Email:** `daniel@africanbusiness.cm`
- **Mot de passe:** `admin123`
- **Accès:** Toutes les fonctionnalités

#### 🎧 **RESP_TECH** (Responsable Technique)
- **Email:** `michel@africanbusiness.cm`
- **Mot de passe:** `resp123`
- **Accès:** Gestion et affectation des interventions

#### 🔧 **TECHNICIEN** (Technicien de Terrain)
- **Email:** `jean@africanbusiness.cm`
- **Mot de passe:** `tech123`
- **Accès:** Interventions assignées uniquement

#### 🏢 **CLIENT** (Client/Demandeur)
- **Email:** `client@africanbusiness.cm`
- **Mot de passe:** `client123`
- **Accès:** Création et suivi de ses propres demandes

### **Étape 4: Changer de Rôle Rapidement (Mode Démo)**

Une fois connecté, vous pouvez changer de rôle via:
1. Cliquez sur **"Démo rôles ▾"** dans la barre supérieure
2. Sélectionnez le rôle souhaité
3. L'application se connectera automatiquement avec ce rôle

---

## 🔐 Architecture d'Authentification

### **Flow d'Authentification:**
```
1. Login → /api/auth/login (POST)
2. Serveur valide le mot de passe avec scrypt
3. Serveur génère un token JWT-like (HMAC-SHA256)
4. Token stocké dans localStorage.technova_token
5. Chaque requête API inclut: Authorization: Bearer {token}
6. Middleware requireAuth vérifie le token
7. Middleware requireRoles vérifie les permissions
```

### **Middlewares de Sécurité:**

#### `requireAuth`
- Vérifie la présence du token Bearer
- Valide la signature HMAC
- Vérifie l'expiration (24h)
- Attache `req.user` aux requêtes

#### `requireRoles(...roles)`
- Vérifie que l'utilisateur authentifié a le rôle requis
- Retourne 403 Forbidden si non autorisé

---

## 📝 Structure des Tokens

Les tokens sont générés avec:
- **Payload:** `{ id, email, role, full_name, exp }`
- **Signature:** HMAC-SHA256 avec clé secrète
- **Format:** `{payload_base64url}.{signature_base64url}`
- **Durée de vie:** 24 heures

---

## 🚨 Codes d'Erreur HTTP

| Code | Signification | Cause Commune |
|------|---------------|---------------|
| **401** | Unauthorized | Token manquant, invalide ou expiré |
| **403** | Forbidden | Rôle insuffisant pour l'action |
| **404** | Not Found | Ressource inexistante |
| **409** | Conflict | Email déjà utilisé (inscription) |

---

## 🛠️ Fichiers Modifiés

### `technova_dashboard.html`
- ✅ Fonction `quickSwitchDemo()` réécrite pour login API réel
- ✅ Ajout de la fonction `switchActiveRole()`

### `index.html`
- ✅ Fonction `quickSwitchDemo()` réécrite pour login API réel
- ✅ Ajout de la fonction `switchActiveRole()`

---

## 🧪 Tester l'Authentification

### **Via Console Browser (F12):**
```javascript
// Vérifier le token actuel
console.log(localStorage.getItem('technova_token'));

// Vérifier l'utilisateur connecté
console.log(JSON.parse(localStorage.getItem('technova_session')));

// Tester une requête API manuelle
fetch('/api/interventions', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('technova_token')}`
  }
})
.then(r => r.json())
.then(console.log);
```

---

## ✨ Fonctionnalités Maintenant Opérationnelles

- ✅ **Connexion/Déconnexion** avec tokens valides
- ✅ **Changement de rôle démo** sans erreurs 401
- ✅ **API Dashboard** (`/api/stats/dashboard`)
- ✅ **API Interventions** (`/api/interventions`)
- ✅ **API Notifications** (`/api/notifications`)
- ✅ **Assignation Techniciens** (`/api/interventions/:id/assign`)
- ✅ **Mise à jour statuts** (`/api/interventions/:id/status`)
- ✅ **Synchronisation temps réel** (polling toutes les 5s)

---

## 🔗 Routes API Principales

| Endpoint | Méthode | Auth | Rôles | Description |
|----------|---------|------|-------|-------------|
| `/api/auth/login` | POST | ❌ | Tous | Connexion |
| `/api/auth/register-client` | POST | ❌ | - | Inscription client |
| `/api/auth/me` | GET | ✅ | Tous | Profil utilisateur |
| `/api/interventions` | GET | ✅ | Tous | Liste interventions |
| `/api/interventions/:id/assign` | PATCH | ✅ | ADMIN, RESP_TECH | Affecter technicien |
| `/api/interventions/:id/status` | PATCH | ✅ | Tous | Changer statut |
| `/api/stats/dashboard` | GET | ✅ | ADMIN, RESP_TECH | Statistiques |
| `/api/notifications` | GET | ✅ | Tous | Notifications |

---

## 📞 Support

Pour toute question technique:
- **Développeur:** African Business Invest SARL
- **Système:** TECHNOVA - Gestion Interventions Techniques

---

**Date de correction:** 2026-11-04  
**Version:** 1.0.1 - Fix Authentication & Authorization
