#!/bin/bash
# Script de déploiement automatique pour TECHNOVA
# Usage: ./scripts/deploy.sh [environment]
# Environnements: development, staging, production

set -e

ENVIRONMENT=${1:-production}
APP_NAME="technova"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "🚀 TECHNOVA Deployment Script"
echo "=========================================="
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
log_info "Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

log_info "✓ Docker et Docker Compose sont installés"

# Vérifier le fichier .env
if [ ! -f .env ]; then
    log_warn "Fichier .env non trouvé. Création à partir de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        log_warn "⚠️  IMPORTANT: Configurez le fichier .env avant de continuer!"
        exit 1
    else
        log_error "Fichier .env.example non trouvé"
        exit 1
    fi
fi

log_info "✓ Fichier .env trouvé"

# Créer le backup de la base de données si elle existe
if [ -f database/technova.sqlite ]; then
    log_info "Création d'un backup de la base de données..."
    mkdir -p backups
    cp database/technova.sqlite "backups/technova_backup_$TIMESTAMP.sqlite"
    log_info "✓ Backup créé: backups/technova_backup_$TIMESTAMP.sqlite"
fi

# Arrêter les containers existants
log_info "Arrêt des containers existants..."
docker-compose down || log_warn "Aucun container à arrêter"

# Pull les dernières modifications (si git est configuré)
if [ -d .git ]; then
    log_info "Pull des dernières modifications depuis Git..."
    git pull || log_warn "Impossible de pull depuis Git"
fi

# Build l'image Docker
log_info "Build de l'image Docker..."
docker-compose build --no-cache

# Démarrer les containers
log_info "Démarrage des containers..."
docker-compose up -d

# Attendre que l'application soit prête
log_info "Attente du démarrage de l'application (30 secondes)..."
sleep 30

# Vérifier le healthcheck
log_info "Vérification du healthcheck..."
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' ${APP_NAME}-app 2>/dev/null || echo "none")

if [ "$HEALTH_STATUS" = "healthy" ] || [ "$HEALTH_STATUS" = "none" ]; then
    # Test HTTP direct si pas de healthcheck
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "✓ Application démarrée avec succès!"
    else
        log_error "✗ L'application ne répond pas"
        docker-compose logs --tail=50
        exit 1
    fi
else
    log_error "✗ L'application n'est pas healthy"
    docker-compose logs --tail=50
    exit 1
fi

# Afficher les informations de déploiement
echo ""
echo "=========================================="
echo "✅ DÉPLOIEMENT RÉUSSI"
echo "=========================================="
echo "Application: TECHNOVA"
echo "Environment: $ENVIRONMENT"
echo "URL: http://localhost:3000"
echo "Health: http://localhost:3000/api/health"
echo ""
echo "Commandes utiles:"
echo "  docker-compose logs -f      # Voir les logs"
echo "  docker-compose ps           # Voir les containers"
echo "  docker-compose down         # Arrêter l'application"
echo "  docker-compose restart      # Redémarrer l'application"
echo "=========================================="
