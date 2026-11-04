# 🔄 Instructions de Réinitialisation - TECHNOVA

## ⚠️ Action Requise

Les fichiers d'authentification ont été corrigés, mais vous devez **réinitialiser la base de données** pour que les nouveaux identifiants de connexion soient créés.

---

## 📋 Étapes à Suivre

### **1. Arrêter le Serveur**
Si le serveur est en cours d'exécution, arrêtez-le:
- Appuyez sur `Ctrl + C` dans le terminal où le serveur tourne
- Attendez que le message "Serveur arrêté" apparaisse

### **2. Supprimer l'Ancienne Base de Données**
Supprimez les 3 fichiers suivants dans le dossier `database/`:
```
database/technova.sqlite
database/technova.sqlite-shm
database/technova.sqlite-wal
```

**Sur Windows PowerShell:**
```powershell
Remove-Item "database\technova.sqlite"
Remove-Item "database\technova.sqlite-shm"
Remove-Item "database\technova.sqlite-wal"
```

**Sur Windows CMD:**
```cmd
del database\technova.sqlite
del database\technova.sqlite-shm
del database\technova.sqlite-wal
```

**OU** supprimez-les manuellement via l'Explorateur Windows.

### **3. Redémarrer le Serveur**
```bash
node server.js
```

La nouvelle base de données sera automatiquement créée avec les nouveaux identifiants.

### **4. Accéder à l'Application**
Ouvrez votre navigateur: `http://localhost:3000`

---

## ✅ Nouveaux Identifiants de Connexion

Après la réinitialisation, vous pouvez vous connecter avec:

### 👑 **ADMIN (Administrateur)**
- **Email:** `daniel@africanbusiness.cm`
- **Mot de passe:** `admin123`

### 🎧 **RESP_TECH (Responsable Technique)**
- **Email:** `michel@africanbusiness.cm`
- **Mot de passe:** `resp123`

### 🔧 **TECHNICIEN (Technicien de Terrain)**
- **Email:** `jean@africanbusiness.cm`
- **Mot de passe:** `tech123`

### 🏢 **CLIENT (Client/Demandeur)**
- **Email:** `client@africanbusiness.cm`
- **Mot de passe:** `client123`

---

## 🎯 Test de Connexion Rapide

Une fois le serveur redémarré:

1. Allez sur `http://localhost:3000`
2. Cliquez sur **"Connexion"**
3. Entrez:
   - Email: `daniel@africanbusiness.cm`
   - Mot de passe: `admin123`
4. Cliquez sur **"Se connecter"**

✅ Vous devriez être connecté sans erreur 401 !

---

## 🚀 Changer de Rôle Rapidement

Une fois connecté:
1. Cliquez sur **"Démo rôles ▾"** en haut à droite
2. Sélectionnez le rôle désiré (Admin, Resp. Tech, Technicien, Client)
3. Le système vous connectera automatiquement avec ce rôle

---

## 🔍 Vérification des Erreurs

### **Si vous voyez encore des erreurs 401:**
1. Ouvrez la Console du navigateur (F12)
2. Vérifiez si le token est stocké:
   ```javascript
   console.log(localStorage.getItem('technova_token'));
   ```
3. Si `null`, reconnectez-vous manuellement

### **Si les erreurs persistent:**
1. Videz le cache du navigateur: `Ctrl + Shift + Delete`
2. Supprimez les données localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Rechargez la page: `F5`

---

## 📝 Modifications Apportées

### **Fichiers Modifiés:**
1. ✅ `database/seed.js` - Nouveaux identifiants simplifiés
2. ✅ `index.html` - Fonction `quickSwitchDemo()` avec login API réel
3. ✅ `technova_dashboard.html` - Fonction `quickSwitchDemo()` avec login API réel

### **Problèmes Résolus:**
- ✅ Erreurs 401 Unauthorized sur toutes les routes API
- ✅ Erreur 403 Forbidden sur assignation d'interventions
- ✅ Erreur "switchActiveRole is not defined"
- ✅ Sessions utilisateur sans tokens valides

---

## 💡 Rappel Important

**Les anciens identifiants ne fonctionnent plus:**
- ❌ `onguiba.daniel@african-invest.cm` / `Password123!`
- ❌ `michel.ndongo@african-invest.cm` / `Password123!`
- ❌ `jean.mbarga@african-invest.cm` / `Password123!`
- ❌ `direction.finance@african-invest.cm` / `Password123!`

**Utilisez les nouveaux identifiants simplifiés:**
- ✅ `@africanbusiness.cm` (domaine simplifié)
- ✅ `admin123`, `resp123`, `tech123`, `client123` (mots de passe simples)

---

## 🆘 Support

En cas de problème, consultez le fichier `FIX_AUTHENTICATION_README.md` pour plus de détails techniques.

---

**Date:** 2026-11-04  
**Version:** 1.0.1 - Credentials Update
