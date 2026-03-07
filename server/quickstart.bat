@echo off
echo =========================================
echo Legal Advice Backend - Quick Setup
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo X Python is not installed. Please install Python 3.9+ first.
    pause
    exit /b 1
)

echo + Python found

REM Create virtual environment
echo.
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo Creating .env file from template...
    copy .env.example .env
    echo ! Please edit .env file and update MODEL_API_URL with your model endpoint
)

REM Run migrations
echo.
echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Prompt for superuser creation
echo.
set /p CREATE_ADMIN="Do you want to create an admin user? (y/n): "
if /i "%CREATE_ADMIN%"=="y" (
    python manage.py createsuperuser
)

echo.
echo =========================================
echo + Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Edit .env and set your MODEL_API_URL
echo 2. Run: python manage.py runserver
echo 3. Access API at: http://localhost:8000
echo 4. Access Admin at: http://localhost:8000/admin
echo.
echo To activate the virtual environment in future:
echo   venv\Scripts\activate.bat
echo.
pause
