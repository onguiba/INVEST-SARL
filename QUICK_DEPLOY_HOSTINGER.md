# ⚡ Déploiement Rapide TECHNOVA sur Hostinger (10 minutes)

Ce guide vous permet de déployer TECHNOVA sur Hostinger VPS avec Dokploy en moins de 10 minutes.

---

## 🎯 Prérequis Rapides

- ✅ VPS Hostinger actif (minimum 2GB RAM)
- ✅ Accès SSH root
- ✅ Projet GitHub: https://github.com/onguiba/INVEST-SARL

---

## 🚀 Déploiement en 5 Étapes

### **ÉTAPE 1: Connexion au VPS (1 min)**

```bash
# Depuis votre PC, connectez-vous au VPS
ssh root@VOTRE_IP_VPS

# Exemple:
ssh root@185.123.45.67
```

Entrez le mot de passe fourni par Hostinger.

---

### **ÉTAPE 2: Installation de Dokploy (3 min)**

```bash
# Une seule commande pour tout installer
curl -sSL https://dokploy.com/install.sh | sh
```

⏳ **Attendez 2-3 minutes...**

Dokploy installe automatiquement:
- Docker
- Docker Compose
- Traefik (reverse proxy)
- Interface web Dokploy

**✅ Installation terminée quand vous voyez:**
```
✓ Dokploy installed successfully!
Access: http://YOUR_SERVER_IP:3000
```

---

### **ÉTAPE 3: Configuration Initiale Dokploy (2 min)**

1. **Ouvrez votre navigateur:**
   ```
   http://VOTRE_IP_VPS:3000
   ```

2. **Créez votre compte admin:**
   - Username: `admin`
   - Email: `votre@email.com`
   - Password: `votremotdepasse`

3. **Cliquez sur "Create Admin Account"**

---

### **ÉTAPE 4: Déployer TECHNOVA (3 min)**

#### **4.1 - Créer un Projet**
1. Cliquez sur **"Create Project"**
2. Nom: `technova-prod`
3. Cliquez sur **"Create"**

#### **4.2 - Ajouter l'Application**
1. Dans le projet, cliquez sur **"Create Service"**
2. Sélectionnez **"Application"**
3. Type: **"Git"**

#### **4.3 - Configuration Git**
```
Name: technova-app
Repository: https://github.com/onguiba/INVEST-SARL.git
Branch: main
Build Type: Dockerfile
```

#### **4.4 - Variables d'Environnement**
Cliquez sur **"Environment"** et ajoutez:

```env
NODE_ENV=production
PORT=3000
TECHNOVA_SECRET=changez_cette_cle_secrete_12345
```

💡 **Générer une clé sécurisée:**
```bash
openssl rand -hex 32
```

#### **4.5 - Configuration Ports**
```
Container Port: 3000
Published Port: 3000
```

#### **4.6 - Volumes (Base de Données)**
Ajoutez un volume pour persister la base de données:
```
Name: database
Host Path: /var/lib/dokploy/volumes/technova-db
Mount Path: /app/database
```

#### **4.7 - Déployer**
1. Cliquez sur **"Deploy"**
2. Suivez les logs de build en temps réel
3. **Attendez 2-3 minutes...**

**✅ Déploiement réussi quand vous voyez:**
```
✓ Application deployed successfully
```

---

### **ÉTAPE 5: Vérification (1 min)**

**Tester l'application:**
```bash
# Depuis le VPS
curl http://localhost:3000/api/health

# Depuis votre PC
curl http://VOTRE_IP_VPS:3000/api/health
```

**Réponse attendue:**
```json
{
  "status": "UP",
  "app": "TECHNOVA API",
  "company": "AFRICAN BUSINESS INVEST SARL",
  "database": "SQLite 3",
  "total_users": 6
}
```

**Accès Web:**
```
http://VOTRE_IP_VPS:3000
```

---

## 🌐 Configuration Domaine (Optionnel - 5 min)

### **Si vous avez un nom de domaine:**

#### **1. Configurer le DNS**

Dans votre gestionnaire DNS (Hostinger ou autre):

```
Type: A
Name: @ (ou technova)
Value: VOTRE_IP_VPS
TTL: 3600
```

**Exemples de configuration:**
```
@ → VOTRE_IP           (accès via votredomaine.com)
technova → VOTRE_IP    (accès via technova.votredomaine.com)
app → VOTRE_IP         (accès via app.votredomaine.com)
```

⏳ **Attendre 5-30 minutes** pour la propagation DNS.

#### **2. Configurer dans Dokploy**

1. Dans votre application, onglet **"Domains"**
2. Ajoutez votre domaine:
   ```
   technova.votredomaine.com
   ```
3. Cochez **"Generate SSL Certificate"**
4. Cliquez sur **"Add Domain"**

**✅ SSL automatiquement configuré avec Let's Encrypt!**

**Accès sécurisé:**
```
https://technova.votredomaine.com
```

---

## 🔐 Identifiants de Connexion TECHNOVA

Une fois déployé, connectez-vous avec:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | daniel@africanbusiness.cm | admin123 |
| **Resp. Tech** | michel@africanbusiness.cm | resp123 |
| **Technicien** | jean@africanbusiness.cm | tech123 |
| **Client** | client@africanbusiness.cm | client123 |

---

## 🛠️ Commandes Utiles

### **Voir les Logs**
```bash
# Dans Dokploy: Onglet "Logs" de votre application

# Via SSH:
docker logs technova-app -f
```

### **Redémarrer l'Application**
Dans Dokploy: Cliquez sur **"Restart"**

### **Mise à Jour**
1. Poussez vos changements sur GitHub:
   ```bash
   git push
   ```
2. Dans Dokploy: Cliquez sur **"Redeploy"**

### **Backup Base de Données**
```bash
# Se connecter au VPS
ssh root@VOTRE_IP_VPS

# Backup
docker exec technova-app cp /app/database/technova.sqlite /tmp/
docker cp technova-app:/tmp/technova.sqlite ./technova_backup_$(date +%Y%m%d).sqlite
```

---

## 🐛 Dépannage Rapide

### **❌ Application ne démarre pas**
```bash
# Voir les logs
docker logs technova-app --tail 100

# Redémarrer
docker restart technova-app
```

### **❌ Port déjà utilisé**
```bash
# Vérifier quel service utilise le port 3000
netstat -tulpn | grep 3000

# Changer le port de TECHNOVA dans Dokploy
# Onglet Ports: Changer Published Port de 3000 à 8080
```

### **❌ Erreur de mémoire**
```bash
# Vérifier la mémoire disponible
free -h

# Si insuffisant, ajouter du swap
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### **❌ SSL ne fonctionne pas**
1. Vérifiez que le DNS pointe bien vers votre IP
2. Attendre 5-30 minutes pour propagation DNS
3. Dans Dokploy: Regenerate Certificate

---

## ✅ Checklist de Déploiement

- [ ] VPS Hostinger accessible via SSH
- [ ] Dokploy installé (http://IP:3000)
- [ ] Projet créé dans Dokploy
- [ ] Application déployée depuis GitHub
- [ ] Variables d'environnement configurées
- [ ] Base de données persistante (volume configuré)
- [ ] Application accessible (http://IP:3000)
- [ ] Healthcheck OK (/api/health)
- [ ] Connexion avec les 4 rôles testée
- [ ] DNS configuré (si domaine)
- [ ] SSL activé (si domaine)

---

## 📊 Monitoring

### **Vérifier le Status**
```bash
# Via Dokploy: Dashboard → Voir CPU, RAM, Disk

# Via SSH:
docker stats technova-app
```

### **Healthcheck Automatique**
```bash
# Créer un script de monitoring
nano /root/monitor-technova.sh
```

Contenu:
```bash
#!/bin/bash
HEALTH=$(curl -s http://localhost:3000/api/health | grep -o '"status":"UP"')
if [ -z "$HEALTH" ]; then
    echo "ALERT: TECHNOVA is DOWN!"
    docker restart technova-app
fi
```

Automatiser (toutes les 5 minutes):
```bash
chmod +x /root/monitor-technova.sh
crontab -e
# Ajouter:
*/5 * * * * /root/monitor-technova.sh
```

---

## 🎉 Félicitations !

Votre application TECHNOVA est maintenant en production ! 🚀

**Accès:**
- 🌐 Application: `http://VOTRE_IP:3000` ou `https://votredomaine.com`
- 🎛️ Dokploy: `http://VOTRE_IP:3000` (port par défaut de Dokploy)
- 📊 Health: `http://VOTRE_IP:3000/api/health`

**Prochaines étapes:**
1. ✅ Configurez des backups automatiques
2. ✅ Ajoutez un domaine personnalisé
3. ✅ Activez le monitoring
4. ✅ Configurez les notifications par email

---

## 📞 Support

**Documentation complète:** `DEPLOIEMENT_DOKPLOY.md`

**Problèmes courants:** Consultez la section Dépannage

**Dokploy Docs:** https://docs.dokploy.com

---

**Version:** 1.0.0  
**Temps estimé:** 10 minutes  
**Difficulté:** ⭐⭐☆☆☆ (Facile)
