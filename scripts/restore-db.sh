# scripts/restore-db.sh
#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh <backup_file>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Restore backup
docker compose exec -T db psql -U postgres qa_form < "$BACKUP_FILE"

echo "Database restored from $BACKUP_FILE"
