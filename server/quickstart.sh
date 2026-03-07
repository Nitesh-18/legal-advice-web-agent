#!/bin/bash

# Quick Start Script for Legal Backend

echo "========================================="
echo "Legal Advice Backend - Quick Setup"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✓ Python 3 found"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and update MODEL_API_URL with your model endpoint"
fi

# Run migrations
echo ""
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Prompt for superuser creation
echo ""
read -p "Do you want to create an admin user? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    python manage.py createsuperuser
fi

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env and set your MODEL_API_URL"
echo "2. Run: python manage.py runserver"
echo "3. Access API at: http://localhost:8000"
echo "4. Access Admin at: http://localhost:8000/admin"
echo ""
echo "To activate the virtual environment in future:"
echo "  source venv/bin/activate"
echo ""
