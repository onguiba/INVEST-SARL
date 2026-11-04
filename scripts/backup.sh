#!/bin/bash
# Script de backup pour TECHNOVA
# Usage: ./scripts/backup.sh

set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="database/technova.sqlite"
BACKUP_NAME="technova_backup_$TIMESTAMP"

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
echo "💾 TECHNOVA Backup Script"
echo "=========================================="

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Vérifier si la base de données existe
if [ ! -f $DB_FILE ]; then
    log_error "Base de données non trouvée: $DB_FILE"
    exit 1
fi

# Créer le backup
log_info "Création du backup..."
cp $DB_FILE "$BACKUP_DIR/$BACKUP_NAME.sqlite"

# Créer aussi une archive compressée
log_info "Compression du backup..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C database technova.sqlite

# Calculer la taille
SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)

log_info "✓ Backup créé avec succès!"
echo ""
echo "Fichier: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "Taille: $SIZE"

# Nettoyer les vieux backups (garder les 30 derniers)
log_info "Nettoyage des anciens backups..."
cd $BACKUP_DIR
ls -t *.tar.gz 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
cd ..

BACKUP_COUNT=$(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)
log_info "Nombre de backups conservés: $BACKUP_COUNT"

echo "=========================================="
echo "✅ BACKUP TERMINÉ"
echo "=========================================="
