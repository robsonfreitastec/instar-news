#!/bin/bash

# Exit on error
set -e

echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing commands"

# Install composer dependencies
composer install --no-interaction --optimize-autoloader --no-dev 2>/dev/null || composer install --no-interaction

# Generate application key
php artisan key:generate --force

# Generate JWT secret
php artisan jwt:secret --force

# Run migrations
php artisan migrate --force

# Run seeders (ignore errors if already seeded)
php artisan db:seed --force || true

# Generate Swagger documentation
php artisan l5-swagger:generate

# Clear caches
php artisan config:clear
php artisan cache:clear

echo "Setup completed successfully!"

# Start Laravel server
php artisan serve --host=0.0.0.0 --port=8000

