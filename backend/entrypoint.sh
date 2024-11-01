#!/bin/bash

# Wait for database to be ready
echo "Waiting for postgres..."

while ! nc -z $POSTGRES_HOST 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

# Make migrations if needed
python manage.py makemigrations

# Try to detect if this is a fresh database
python manage.py showmigrations --plan | grep "\[ \]" > /dev/null
NEEDS_MIGRATE=$?

if [ $NEEDS_MIGRATE -eq 0 ]; then
    echo "Running migrations..."
    python manage.py migrate
else
    echo "Checking migrations..."
    # Apply any pending migrations safely
    python manage.py migrate --plan | grep "\[ \]" > /dev/null
    if [ $? -eq 0 ]; then
        echo "Applying pending migrations..."
        python manage.py migrate
    else
        echo "No pending migrations"
    fi
fi

# Create superuser if needed
if [ "$DJANGO_SUPERUSER_USERNAME" ]; then
    python manage.py createsuperuser \
        --noinput \
        --username $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL || true
fi

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
