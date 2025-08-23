# Pulmonology Patient Manager Launcher
# Dr. S. Sahboub - PowerShell launcher for the patient management system

# Set console properties
$Host.UI.RawUI.WindowTitle = "Système de Gestion des Patients - Dr. S. Sahboub"

Write-Host "================================================================" -ForegroundColor Green
Write-Host "   🏥 SYSTÈME DE GESTION DES PATIENTS - Dr. S. Sahboub" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Function to find a free port
function Find-FreePort {
    param([int]$StartPort = 8000, [int]$EndPort = 8100)
    
    for ($port = $StartPort; $port -le $EndPort; $port++) {
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
            $listener.Start()
            $listener.Stop()
            return $port
        }
        catch {
            continue
        }
    }
    return $null
}

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
}
catch {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "📋 Veuillez installer Python depuis https://python.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Check if the HTML file exists
$htmlFile = "complete-patient-system.html"
if (-not (Test-Path $htmlFile)) {
    Write-Host "❌ Fichier du système de gestion non trouvé!" -ForegroundColor Red
    Write-Host "📁 Recherche de: $htmlFile" -ForegroundColor Yellow
    Write-Host "📋 Assurez-vous que ce lanceur est dans le même dossier que les fichiers HTML." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "✅ Système de gestion des patients trouvé" -ForegroundColor Green

# Find a free port
$port = Find-FreePort
if ($null -eq $port) {
    Write-Host "❌ Aucun port libre disponible (8000-8100)" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

$url = "http://localhost:$port/$htmlFile"

Write-Host ""
Write-Host "🔄 Démarrage du serveur local sur le port $port..." -ForegroundColor Yellow
Write-Host "🌐 URL: $url" -ForegroundColor Cyan
Write-Host "⏹️  Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

# Start browser after a delay
Start-Job -ScriptBlock {
    param($url)
    Start-Sleep -Seconds 3
    Start-Process $url
} -ArgumentList $url | Out-Null

# Start the Python HTTP server
try {
    python -m http.server $port
}
catch {
    Write-Host ""
    Write-Host "❌ Erreur lors du démarrage du serveur: $_" -ForegroundColor Red
}
finally {
    Write-Host ""
    Write-Host "👋 Serveur arrêté. Au revoir!" -ForegroundColor Green
    Read-Host "Appuyez sur Entrée pour quitter"
}