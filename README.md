# TECHNOVA - Plateforme de Gestion des Interventions Techniques

## Application Responsive & Sécurisée

TECHNOVA est une plateforme web intelligente et 100% responsive pour la gestion des interventions techniques, développée pour AFRICAN BUSINESS INVEST SARL.

### Fonctionnalités Principales

- Authentification sécurisée (HMAC-SHA256 tokens)
- Multi-rôles (Admin, Responsable Technique, Technicien, Client)
- Dashboard interactif avec statistiques temps réel
- Gestion complète des interventions
- Suivi des équipements
- Système de notifications
- Interface responsive (mobile, tablette, desktop)
- Menu hamburger mobile avec overlay
- Synchronisation automatique (polling 5s)

---

## Démarrage Rapide

### 1. Installation
```bash
# Cloner ou télécharger le projet
cd "INVEST SARL"

# Installer les dépendances
npm install
```

### 2. Démarrer le Serveur
```bash
node server.js
```

Le serveur démarre sur `http://localhost:3000`

### 3. Accéder à l'Application
- Desktop: http://localhost:3000
- Mobile (même WiFi): http://[IP_LOCALE]:3000

---

## Identifiants de Connexion

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| ADMIN | daniel@africanbusiness.cm | admin123 |
| RESP_TECH | michel@africanbusiness.cm | resp123 |
| TECHNICIEN | jean@africanbusiness.cm | tech123 |
| CLIENT | client@africanbusiness.cm | client123 |

---

## Design Responsive

L'application s'adapte automatiquement à tous les écrans :

### Mobile (< 768px)
- Menu hamburger
- Sidebar slide-in avec overlay
- Stats en 1 colonne
- Boutons pleine largeur
- Formulaires iOS-friendly

### Tablette (768px - 1100px)
- Menu hamburger
- Stats en 2 colonnes
- Layout optimisé

### Desktop (> 1100px)
- Sidebar permanente
- Stats en 4 colonnes
- Layout complet

---

## Architecture Technique

### Backend
- Node.js + Express
- SQLite 3 (mode WAL)
- Authentification HMAC-SHA256
- RBAC (Role-Based Access Control)
- API RESTful

### Frontend
- Vanilla JavaScript (pas de framework)
- CSS3 responsive (7 breakpoints)
- Chart.js pour graphiques
- Font Awesome pour icônes

### Sécurité
- Hachage mots de passe (scrypt)
- Tokens signés (24h expiration)
- Validation des rôles
- Protection CORS

---

## Structure du Projet

```
INVEST SARL/
├── database/
│   ├── db.js                  # Configuration SQLite
│   ├── schema.sql             # Schéma base de données
│   ├── seed.js                # Données initiales
│   └── technova.sqlite        # Base de données
├── src/
│   ├── auth.js                # Module authentification
│   └── routes/                # Routes API
│       ├── auth.routes.js
│       ├── interventions.routes.js
│       ├── equipments.routes.js
│       ├── technicians.routes.js
│       ├── stats.routes.js
│       └── notifications.routes.js
├── server.js                  # Serveur Express
├── index.html                 # Page principale
├── technova_dashboard.html    # Dashboard alternatif
├── package.json               # Dépendances npm
└── README.md                  # Ce fichier
```

---

## Technologies Utilisées

### Core
- Node.js v18+
- Express 4.x
- SQLite 3 (better-sqlite3)

### Frontend
- Chart.js 4.x
- Font Awesome 6.5
- Google Fonts (Plus Jakarta Sans, Inter)

### Sécurité
- Node.js Crypto (native)
- CORS
- HMAC-SHA256

---

## Fonctionnalités par Rôle

### ADMIN (Administrateur)
- Vue complète du système
- Gestion des utilisateurs
- Statistiques globales
- Toutes les interventions
- Configuration système

### RESP_TECH (Responsable Technique)
- Affectation des interventions
- Dispatch board (kanban)
- Vue d'ensemble équipe
- Planification
- Statistiques équipe

### TECHNICIEN (Technicien Terrain)
- Interventions assignées
- Interface mobile optimisée
- Timer interventions
- Mise à jour statuts
- Observations terrain

### CLIENT (Demandeur)
- Création de demandes
- Suivi des interventions
- Historique personnel
- Notifications
- Stepper de progression

---

## API Endpoints

### Authentification
```
POST   /api/auth/register-client  # Inscription client
POST   /api/auth/login            # Connexion
GET    /api/auth/me               # Profil utilisateur
GET    /api/auth/users            # Liste utilisateurs (Admin)
```

### Interventions
```
GET    /api/interventions         # Liste (filtrée par rôle)
GET    /api/interventions/:id     # Détails
POST   /api/interventions         # Créer
PATCH  /api/interventions/:id/assign  # Affecter (Admin/Resp)
PATCH  /api/interventions/:id/status  # Changer statut
```

### Statistiques
```
GET    /api/stats/dashboard       # Stats dashboard
GET    /api/stats/technicians     # Performance techniciens
```

### Notifications
```
GET    /api/notifications         # Liste notifications
PATCH  /api/notifications/:id/read  # Marquer lu
```

---

## Dépannage

### Erreurs 401 Unauthorized
Redémarrez le serveur et videz le cache du navigateur

### Menu hamburger ne fonctionne pas
1. Vérifiez la console (F12)
2. Rechargez sans cache (Ctrl + Shift + R)
3. Vérifiez que sidebarOverlay existe dans le DOM

### Zoom automatique iOS
Déjà corrigé: Les inputs ont font-size: 16px

### Base de données verrouillée
```bash
# Arrêter le serveur (Ctrl+C)
# Supprimer les fichiers de lock
del database\technova.sqlite-shm
del database\technova.sqlite-wal
# Redémarrer
node server.js
```

---

## Tests Responsive

### Sur Desktop
```bash
1. F12 (ouvrir DevTools)
2. Ctrl + Shift + M (mode responsive)
3. Sélectionner iPhone / iPad
4. Tester menu hamburger
```

### Sur Mobile Réel
```bash
1. Trouver l'IP locale de votre PC
   > ipconfig (Windows)
   Chercher "IPv4 Address"

2. Sur le smartphone (même WiFi)
   Ouvrir : http://[IP_LOCALE]:3000
   Exemple: http://192.168.1.100:3000
```

---

## Changelog

### v2.0.0 - Responsive Design (2026-11-04)
- Design 100% responsive (mobile, tablette, desktop)
- Menu hamburger avec overlay
- 7 breakpoints professionnels
- Touch-optimized (44px zones tactiles)
- iOS-friendly forms (pas de zoom)
- Tables scrollables
- Modals responsives

### v1.0.1 - Auth Fix (2026-11-04)
- Correction authentification 401/403
- Nouveaux identifiants simplifiés
- Fonction switchActiveRole ajoutée
- Documentation complète

### v1.0.0 - Initial Release (2025-10-27)
- Backend API complet
- Base de données SQLite
- Interface multi-rôles
- Authentification sécurisée
- Dashboard interactif

---

## Support

Pour toute question technique:
- Vérifiez la console navigateur (F12)
- Consultez les logs du serveur
- Redémarrez le serveur en cas de problème

---

## Licence

Propriétaire - AFRICAN BUSINESS INVEST SARL © 2026

---

Développé pour AFRICAN BUSINESS INVEST SARL
Version: 2.0.0 - Full Responsive
Date: 2026-11-04
