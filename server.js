const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'patients.json');
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');

// S'assurer que le répertoire de données existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialiser les fichiers de données s'ils n'existent pas
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
}

// Types MIME pour différentes extensions de fichiers
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Fonction utilitaire pour lire un fichier JSON en toute sécurité
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return filePath === DATA_FILE ? [] : {};
    }
}

// Fonction utilitaire pour écrire un fichier JSON en toute sécurité
function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// Gérer les requêtes API
function handleAPI(req, res, pathname, query) {
    // Définir les en-têtes CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname === '/api/patients') {
        if (req.method === 'GET') {
            // Obtenir tous les patients
            const patients = readJSONFile(DATA_FILE);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(patients));
        } else if (req.method === 'POST') {
            // Sauvegarder les données des patients
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const patients = JSON.parse(body);
                    if (writeJSONFile(DATA_FILE, patients)) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Échec de la sauvegarde des données' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Données JSON invalides' }));
                }
            });
        }
    } else if (pathname === '/api/sessions') {
        if (req.method === 'GET') {
            // Obtenir les données de session
            const sessionId = query.sessionId;
            if (sessionId) {
                const sessions = readJSONFile(SESSIONS_FILE);
                const session = sessions[sessionId];
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(session || null));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'ID de session requis' }));
            }
        } else if (req.method === 'POST') {
            // Sauvegarder les données de session
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const { sessionId, sessionData } = JSON.parse(body);
                    const sessions = readJSONFile(SESSIONS_FILE);
                    sessions[sessionId] = sessionData;

                    if (writeJSONFile(SESSIONS_FILE, sessions)) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Échec de la sauvegarde de la session' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Données JSON invalides' }));
                }
            });
        } else if (req.method === 'DELETE') {
            // Supprimer la session
            const sessionId = query.sessionId;
            if (sessionId) {
                const sessions = readJSONFile(SESSIONS_FILE);
                delete sessions[sessionId];

                if (writeJSONFile(SESSIONS_FILE, sessions)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Échec de la suppression de la session' }));
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'ID de session requis' }));
            }
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Point de terminaison API introuvable' }));
    }
}

// Servir les fichiers statiques
function serveStaticFile(req, res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Fichier introuvable');
            } else {
                res.writeHead(500);
                res.end('Erreur du serveur');
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// Créer le serveur HTTP
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`${req.method} ${pathname}`);

    // Gérer les requêtes API
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname, query);
        return;
    }

    // Gérer les requêtes de fichiers statiques
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Vérification de sécurité - empêcher la traversée de répertoires
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Interdit');
        return;
    }

    serveStaticFile(req, res, filePath);
});

// Démarrer le serveur
server.listen(PORT, 'localhost', () => {
    console.log(`🚀 Serveur du Système de Gestion des Patients en cours d'exécution sur http://localhost:${PORT}`);
    console.log(`📁 Données stockées dans : ${dataDir}`);
    console.log(`🔒 Fichier de sessions : ${SESSIONS_FILE}`);
    console.log(`👥 Fichier des patients : ${DATA_FILE}`);
    console.log('\n📋 Points de terminaison disponibles :');
    console.log('   GET  /                     - Application principale');
    console.log('   GET  /login.html           - Page de connexion');
    console.log('   GET  /complete-patient-system.html - Gestion des patients');
    console.log('   GET  /api/patients         - Obtenir tous les patients');
    console.log('   POST /api/patients         - Sauvegarder les données des patients');
    console.log('   GET  /api/sessions?sessionId=X - Obtenir la session');
    console.log('   POST /api/sessions         - Sauvegarder la session');
    console.log('   DELETE /api/sessions?sessionId=X - Supprimer la session');
    console.log('\n🌐 Accès depuis n\'importe quel navigateur à : http://localhost:3000');
});

// Gérer l'arrêt du serveur de manière élégante
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur en cours...');
    server.close(() => {
        console.log('✅ Serveur fermé avec succès');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur en cours...');
    server.close(() => {
        console.log('✅ Serveur fermé avec succès');
        process.exit(0);
    });
});