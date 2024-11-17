# scripts/deploy-prod.sh
#!/bin/bash
set -e

echo "Starting deployment..."

# Navigate to project directory
cd "$(dirname "$0")/.."

# Pull latest changes
git pull origin main

# Build and start production containers
cd docker/prod
docker compose down
docker compose build --no-cache
docker compose up -d

# Run migrations
docker compose exec backend python manage.py migrate

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput

echo "Deployment completed successfully!"
