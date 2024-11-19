#!/bin/bash
set -e

# Full paths are required for cron
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="$SCRIPT_DIR/../backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Create backup with size check
BACKUP_FILE="$BACKUP_DIR/dump_$TIMESTAMP.sql"
if docker exec prod-db-1 pg_dump -U postgres qa_form > "$BACKUP_FILE"; then
    # Check if backup file is not empty and greater than 1KB
    if [ -s "$BACKUP_FILE" ] && [ $(stat -f%z "$BACKUP_FILE") -gt 1024 ]; then
        echo "[$(date)] Backup successful: $BACKUP_FILE" >> "$LOG_FILE"
        
        # Delete backups older than 5 days
        find "$BACKUP_DIR" -name "dump_*.sql" -type f -mtime +5 -delete
        echo "[$(date)] Cleaned up old backups" >> "$LOG_FILE"
    else
        echo "[$(date)] Backup failed: Empty or too small file" >> "$LOG_FILE"
        rm "$BACKUP_FILE"
        exit 1
    fi
else
    echo "[$(date)] Backup failed: pg_dump error" >> "$LOG_FILE"
    exit 1
fi