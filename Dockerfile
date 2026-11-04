# Dockerfile pour TECHNOVA - Application Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production

# Copier tout le code source
COPY . .

# Créer le répertoire database s'il n'existe pas
RUN mkdir -p database

# Exposer le port 3000
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck pour vérifier que l'app fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande de démarrage
CMD ["node", "server.js"]
