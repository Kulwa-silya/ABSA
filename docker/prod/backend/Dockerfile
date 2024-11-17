# docker/prod/backend/Dockerfile
FROM python:3.9

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project
COPY . .

# Create and set proper permissions for media and static directories
RUN mkdir -p /app/media /app/staticfiles \
    && chown -R 1000:1000 /app/media /app/staticfiles

# Set environment variables
ENV DJANGO_ENV=production
ENV PYTHONUNBUFFERED=1

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Start Gunicorn
CMD ["gunicorn", "--config", "docker/prod/backend/gunicorn.conf.py", "config.wsgi:application"]
