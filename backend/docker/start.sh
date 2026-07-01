#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-10000}"
export APACHE_PORT="$PORT"

sed "s/\${APACHE_PORT}/${APACHE_PORT}/g" /etc/apache2/sites-available/000-default.conf.template > /etc/apache2/sites-available/000-default.conf
sed -i "s/Listen 80/Listen ${APACHE_PORT}/" /etc/apache2/ports.conf

php artisan storage:link || true
php artisan migrate --force
php artisan db:seed --class=RoleSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan config:cache
php artisan route:cache
php artisan view:cache || true

apache2-foreground
