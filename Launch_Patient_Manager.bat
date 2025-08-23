@echo off
title Système de Gestion des Patients - Dr. S. Sahboub
color 0A

echo ================================================================
echo    🏥 SYSTÈME DE GESTION DES PATIENTS - Dr. S. Sahboub
echo ================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python n'est pas installé ou n'est pas dans le PATH
    echo 📋 Veuillez installer Python depuis https://python.org
    echo.
    pause
    exit /b 1
)

REM Check if the HTML file exists
if not exist "complete-patient-system.html" (
    echo ❌ Fichier du système de gestion non trouvé!
    echo 📁 Recherche de: complete-patient-system.html
    echo 📋 Assurez-vous que ce lanceur est dans le même dossier que les fichiers HTML.
    echo.
    pause
    exit /b 1
)

echo ✅ Python trouvé
echo ✅ Système de gestion des patients trouvé
echo.
echo 🔄 Démarrage du serveur local...
echo 🌐 Le navigateur s'ouvrira automatiquement
echo ⏹️  Appuyez sur Ctrl+C pour arrêter le serveur
echo.

REM Start the server and open browser
start "" "http://localhost:8000/complete-patient-system.html"
python -m http.server 8000

echo.
echo 👋 Serveur arrêté. Au revoir!
pause