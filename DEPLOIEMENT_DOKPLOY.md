# 🚀 Guide de Déploiement TECHNOVA avec Dokploy sur Hostinger

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Configuration Hostinger VPS](#configuration-hostinger-vps)
3. [Installation de Dokploy](#installation-de-dokploy)
4. [Déploiement de TECHNOVA](#déploiement-de-technova)
5. [Configuration DNS](#configuration-dns)
6. [SSL/HTTPS](#ssl-https)
7. [Monitoring & Logs](#monitoring--logs)
8. [Backup](#backup)

---

## 🎯 Prérequis

### **1. Compte Hostinger VPS**
- VPS actif avec minimum 2GB RAM
- Ubuntu 20.04 ou 22.04
- Accès root SSH

### **2. Nom de Domaine**
- Domaine configuré chez Hostinger ou autre registrar
- Accès aux DNS records

### **3. Outils Locaux**
- Git installé
- SSH client (PuTTY sur Windows ou terminal)
- Compte GitHub avec le projet INVEST-SARL

---

## 🖥️ Configuration Hostinger VPS

### **Étape 1: Commander un VPS Hostinger**

1. Allez sur [Hostinger VPS](https://www.hostinger.com/vps-hosting)
2. Choisissez un plan (recommandé: VPS 2 minimum)
   - **VPS 1**: 1GB RAM, 20GB SSD (pour test)
   - **VPS 2**: 2GB RAM, 40GB SSD (recommandé) ✅
   - **VPS 3**: 3GB RAM, 60GB SSD (production)

3. Sélectionnez Ubuntu 22.04 comme OS
4. Configurez le hostname: `technova-prod`

### **Étape 2: Connexion SSH au VPS**

```bash
# Depuis Windows PowerShell ou CMD
ssh root@VOTRE_IP_VPS

# Exemple:
ssh root@185.123.45.67
```

Entrez le mot de passe root fourni par Hostinger.

### **Étape 3: Mise à Jour du Système**

```bash
# Une fois connecté au VPS
apt update && apt upgrade -y
```

### **Étape 4: Installation des Prérequis**

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Vérifier l'installation
docker --version

# Installer Docker Compose
apt install docker-compose -y

# Vérifier
docker-compose --version
```

---

## 🐳 Installation de Dokploy

### **Méthode 1: Installation Automatique (Recommandée)**

```bash
# Installation en une commande
curl -sSL https://dokploy.com/install.sh | sh
```

Cette commande va:
- ✅ Installer Docker (si pas déjà installé)
- ✅ Installer Dokploy
- ✅ Configurer le reverse proxy (Traefik)
- ✅ Démarrer l'interface web sur le port 3000

### **Méthode 2: Installation Manuelle**

```bash
# Cloner le repo Dokploy
git clone https://github.com/Dokploy/dokploy.git
cd dokploy

# Lancer l'installation
./install.sh
```

### **Accès à l'Interface Dokploy**

Une fois installé:
1. Ouvrez votre navigateur
2. Allez sur `http://VOTRE_IP_VPS:3000`
3. Créez votre compte administrateur

**⚠️ IMPORTANT:** Changez le port de Dokploy si votre app utilise aussi le 3000!

```bash
# Modifier le port de Dokploy (optionnel)
nano /opt/dokploy/.env

# Changer PORT=3000 en PORT=8080
# Sauvegarder: Ctrl+O, Enter, Ctrl+X

# Redémarrer Dokploy
docker-compose -f /opt/dokploy/docker-compose.yml restart
```

Maintenant accédez à `http://VOTRE_IP_VPS:8080`

---

## 🚀 Déploiement de TECHNOVA

### **Étape 1: Créer un Projet dans Dokploy**

1. Connectez-vous à Dokploy (`http://VOTRE_IP:8080`)
2. Cliquez sur **"New Project"**
3. Nom du projet: `technova-production`
4. Cliquez sur **"Create"**

### **Étape 2: Ajouter une Application**

1. Dans le projet, cliquez sur **"New Application"**
2. Sélectionnez **"From Git Repository"**
3. Configurez:
   ```
   Name: technova-app
   Git URL: https://github.com/onguiba/INVEST-SARL.git
   Branch: main
   ```

### **Étape 3: Configuration Build**

Dans l'onglet **Build**:

```yaml
Build Type: Dockerfile
Dockerfile Path: ./Dockerfile
Context: .
```

### **Étape 4: Configuration Environment**

Dans l'onglet **Environment**, ajoutez:

```env
NODE_ENV=production
PORT=3000
TECHNOVA_SECRET=VOTRE_CLE_SECRETE_ALEATOIRE_TRES_LONGUE
```

**⚠️ Générer une clé secrète sécurisée:**
```bash
openssl rand -hex 32
```

### **Étape 5: Configuration Ports**

Dans l'onglet **Ports**:

```
Container Port: 3000
Host Port: 3000
Protocol: HTTP
```

### **Étape 6: Configuration Volumes (Persistance Base de Données)**

Dans l'onglet **Volumes**:

```
Host Path: /opt/technova/database
Container Path: /app/database
```

### **Étape 7: Lancer le Déploiement**

1. Cliquez sur **"Deploy"**
2. Suivez les logs en temps réel
3. Attendez le message de succès

**Vérification:**
```bash
# Depuis le VPS
docker ps

# Vous devriez voir technova-app en cours d'exécution
```

---

## 🌐 Configuration DNS

### **Méthode 1: Via Hostinger DNS Manager**

1. Connectez-vous à votre compte Hostinger
2. Allez dans **Domaines** → Votre domaine
3. Cliquez sur **DNS / Name Servers**
4. Ajoutez un enregistrement **A**:

```
Type: A
Name: @ (ou www)
Points to: VOTRE_IP_VPS
TTL: 3600
```

5. Ajoutez un sous-domaine (optionnel):

```
Type: A
Name: app
Points to: VOTRE_IP_VPS
TTL: 3600
```

Maintenant accessible via:
- `http://votredomaine.com`
- `http://app.votredomaine.com`

### **Méthode 2: Via Dokploy (Reverse Proxy)**

1. Dans Dokploy, allez dans votre application
2. Onglet **Domains**
3. Ajoutez votre domaine:

```
Domain: technova.votredomaine.com
```

4. Dokploy configurera automatiquement Traefik (reverse proxy)

---

## 🔒 SSL/HTTPS avec Let's Encrypt

### **Méthode Automatique (Dokploy + Traefik)**

Dokploy configure automatiquement SSL si vous utilisez un domaine:

1. Dans Dokploy → Onglet **Domains**
2. Cochez **"Enable SSL"**
3. Dokploy utilisera Let's Encrypt automatiquement

**✅ Votre site sera accessible via HTTPS en quelques minutes!**

### **Méthode Manuelle (Certbot)**

Si vous n'utilisez pas Dokploy pour les domaines:

```bash
# Installer Certbot
apt install certbot python3-certbot-nginx -y

# Obtenir le certificat
certbot --nginx -d technova.votredomaine.com

# Suivez les instructions
# Le certificat sera auto-renouvelé
```

---

## 📊 Monitoring & Logs

### **Voir les Logs de l'Application**

**Via Dokploy:**
1. Allez dans votre application
2. Onglet **Logs**
3. Logs en temps réel visibles

**Via SSH:**
```bash
# Logs du container
docker logs technova-app -f

# Logs Docker Compose (si utilisé)
docker-compose -f /opt/dokploy/apps/technova/docker-compose.yml logs -f
```

### **Monitoring des Ressources**

```bash
# Stats en temps réel
docker stats technova-app

# Voir tous les containers
docker ps -a

# Utilisation disque
df -h

# Utilisation mémoire
free -h
```

### **Healthcheck de l'Application**

```bash
# Test depuis le VPS
curl http://localhost:3000/api/health

# Réponse attendue:
{
  "status": "UP",
  "app": "TECHNOVA API",
  "company": "AFRICAN BUSINESS INVEST SARL",
  ...
}
```

---

## 💾 Backup & Restauration

### **Backup Automatique de la Base de Données**

Créer un script de backup:

```bash
# Créer le script
nano /root/backup-technova.sh
```

Contenu du script:

```bash
#!/bin/bash
# Backup TECHNOVA Database

BACKUP_DIR="/root/backups/technova"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/opt/technova/database/technova.sqlite"

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

# Copier la base de données
cp $DB_PATH $BACKUP_DIR/technova_$DATE.sqlite

# Garder seulement les 30 derniers backups
cd $BACKUP_DIR
ls -t | tail -n +31 | xargs rm -f

echo "Backup créé: technova_$DATE.sqlite"
```

Rendre le script exécutable:

```bash
chmod +x /root/backup-technova.sh
```

**Automatiser avec Cron:**

```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne (backup tous les jours à 3h du matin)
0 3 * * * /root/backup-technova.sh >> /var/log/technova-backup.log 2>&1
```

### **Restaurer un Backup**

```bash
# Arrêter l'application
docker stop technova-app

# Restaurer la base de données
cp /root/backups/technova/technova_YYYYMMDD_HHMMSS.sqlite /opt/technova/database/technova.sqlite

# Redémarrer l'application
docker start technova-app
```

---

## 🔄 Mise à Jour de l'Application

### **Via Dokploy (Recommandé)**

1. Poussez vos changements sur GitHub:
   ```bash
   git add .
   git commit -m "Update: nouvelle fonctionnalité"
   git push
   ```

2. Dans Dokploy:
   - Allez dans votre application
   - Cliquez sur **"Redeploy"**
   - Dokploy pull les changements et rebuild automatiquement

### **Via SSH Manuel**

```bash
# Se connecter au VPS
ssh root@VOTRE_IP_VPS

# Aller dans le dossier de l'app
cd /opt/dokploy/apps/technova

# Pull les changements
git pull

# Rebuild le container
docker-compose up -d --build
```

---

## 🛠️ Dépannage

### **Problème: Application ne démarre pas**

```bash
# Vérifier les logs
docker logs technova-app --tail 100

# Vérifier si le port est occupé
netstat -tulpn | grep 3000

# Redémarrer le container
docker restart technova-app
```

### **Problème: Erreur de base de données**

```bash
# Vérifier les permissions
ls -la /opt/technova/database/

# Donner les permissions
chmod -R 755 /opt/technova/database/

# Recréer la base de données (ATTENTION: efface les données)
docker exec -it technova-app rm /app/database/technova.sqlite
docker restart technova-app
```

### **Problème: SSL ne fonctionne pas**

```bash
# Vérifier Traefik (reverse proxy de Dokploy)
docker logs traefik

# Forcer le renouvellement SSL
certbot renew --force-renewal
```

### **Problème: Mémoire insuffisante**

```bash
# Vérifier l'utilisation mémoire
free -h

# Ajouter du swap (si nécessaire)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 📞 Support & Ressources

### **Documentation Officielle**
- [Dokploy Docs](https://docs.dokploy.com)
- [Hostinger VPS Guide](https://www.hostinger.com/tutorials/vps)
- [Docker Docs](https://docs.docker.com)

### **Commandes Utiles**

```bash
# Redémarrer Dokploy
systemctl restart dokploy

# Voir tous les containers
docker ps -a

# Nettoyer Docker (libérer de l'espace)
docker system prune -a

# Voir l'utilisation des volumes
docker volume ls
docker volume inspect technova_database

# Accéder au shell du container
docker exec -it technova-app sh
```

---

## ✅ Checklist de Déploiement

Avant de mettre en production, vérifiez:

- [ ] VPS Hostinger configuré et accessible
- [ ] Docker installé et fonctionnel
- [ ] Dokploy installé et accessible
- [ ] Projet GitHub à jour avec Dockerfile
- [ ] Variables d'environnement configurées (SECRET changé!)
- [ ] Base de données persistante (volume configuré)
- [ ] DNS configuré et propagé (24-48h)
- [ ] SSL/HTTPS activé
- [ ] Backup automatique configuré
- [ ] Healthcheck fonctionne
- [ ] Application accessible publiquement
- [ ] Tests de connexion réussis (4 rôles)

---

## 🎉 Félicitations !

Votre application TECHNOVA est maintenant déployée en production sur Hostinger avec Dokploy ! 🚀

**URL de production:** `https://technova.votredomaine.com`

---

**Date de création:** 2026-11-04  
**Version:** 1.0.0 - Dokploy Deployment Guide  
**Auteur:** African Business Invest SARL
