# scripts/backup-db.sh
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Create backup
docker compose exec db pg_dump -U postgres qa_form > "$BACKUP_DIR/dump_$TIMESTAMP.sql"

echo "Backup created: $BACKUP_DIR/dump_$TIMESTAMP.sql"
