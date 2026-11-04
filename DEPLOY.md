# Guide de Déploiement TECHNOVA

## Variables d'environnement requises

Lors du déploiement, configurez ces 3 variables:

| Clé | Valeur |
|-----|--------|
| NODE_ENV | production |
| PORT | 3000 |
| TECHNOVA_SECRET | TECHNOVA_SECURE_KEY_AFRICAN_BUSINESS_INVEST_2026_@! |

## Configuration des Ports

Container Port: 3000
Published Port: 3000 (ou autre selon votre configuration)

## Configuration des Volumes

Pour persister la base de données:

Name: database
Host Path: /var/lib/volumes/technova-db
Mount Path: /app/database

## Après le déploiement

Testez l'application:
```
http://VOTRE_IP:3000
```

Vérifiez la santé:
```
http://VOTRE_IP:3000/api/health
```

## Identifiants de connexion

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| ADMIN | daniel@africanbusiness.cm | admin123 |
| RESP_TECH | michel@africanbusiness.cm | resp123 |
| TECHNICIEN | jean@africanbusiness.cm | tech123 |
| CLIENT | client@africanbusiness.cm | client123 |
