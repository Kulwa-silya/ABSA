FROM python:3.9

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . .

# Run migrations
CMD python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000