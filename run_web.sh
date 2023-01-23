#!/bin/sh

# prepare init migration

python manage.py makemigrations DataVisualization
echo "Created migrations"

# migrate db, so we have the latest db schema

python manage.py migrate
echo "Migrated DB to latest version"