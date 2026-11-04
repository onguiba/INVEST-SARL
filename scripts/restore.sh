#!/bin/bash
# Script de restauration pour TECHNOVA
# Usage: ./scripts/restore.sh <backup_file>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore.sh <backup_file>"
    echo ""
    echo "Backups disponibles:"
    ls -lh backups/*.tar.gz 2>/dev/null || echo "Aucun backup trouvé"
    exit 1
fi

BACKUP_FILE=$1
DB_DIR="database"
TEMP_DIR="temp_restore"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=========================================="
echo "♻️  TECHNOVA Restore Script"
echo "=========================================="

# Vérifier que le fichier de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Fichier de backup non trouvé: $BACKUP_FILE"
    exit 1
fi

log_info "Fichier de backup: $BACKUP_FILE"

# Demander confirmation
read -p "⚠️  Cette opération va écraser la base de données actuelle. Continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "Restauration annulée"
    exit 0
fi

# Arrêter l'application
log_info "Arrêt de l'application..."
docker-compose down || log_warn "Application déjà arrêtée"

# Créer un backup de sécurité de la base actuelle
if [ -f "$DB_DIR/technova.sqlite" ]; then
    log_info "Création d'un backup de sécurité..."
    SAFETY_BACKUP="$DB_DIR/technova_before_restore_$(date +%Y%m%d_%H%M%S).sqlite"
    cp "$DB_DIR/technova.sqlite" "$SAFETY_BACKUP"
    log_info "✓ Backup de sécurité: $SAFETY_BACKUP"
fi

# Créer un dossier temporaire
mkdir -p $TEMP_DIR

# Extraire le backup
log_info "Extraction du backup..."
tar -xzf "$BACKUP_FILE" -C $TEMP_DIR

# Restaurer la base de données
log_info "Restauration de la base de données..."
cp "$TEMP_DIR/technova.sqlite" "$DB_DIR/technova.sqlite"

# Nettoyer
rm -rf $TEMP_DIR

# Redémarrer l'application
log_info "Redémarrage de l'application..."
docker-compose up -d

# Attendre le démarrage
sleep 10

# Vérifier
log_info "Vérification..."
if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
    log_info "✓ Application redémarrée avec succès!"
else
    log_error "✗ Problème lors du redémarrage"
    log_warn "Restauration du backup de sécurité recommandée"
    exit 1
fi

echo "=========================================="
echo "✅ RESTAURATION TERMINÉE"
echo "=========================================="
