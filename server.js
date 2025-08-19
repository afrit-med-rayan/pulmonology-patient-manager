const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'patients.json');
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize data files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
}

// MIME types for different file extensions
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

// Helper function to read JSON file safely
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return filePath === DATA_FILE ? [] : {};
    }
}

// Helper function to write JSON file safely
function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// Handle API requests
function handleAPI(req, res, pathname, query) {
    // Set CORS headers
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
            // Get all patients
            const patients = readJSONFile(DATA_FILE);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(patients));
        } else if (req.method === 'POST') {
            // Save patients data
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
                        res.end(JSON.stringify({ error: 'Failed to save data' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
        }
    } else if (pathname === '/api/sessions') {
        if (req.method === 'GET') {
            // Get session data
            const sessionId = query.sessionId;
            if (sessionId) {
                const sessions = readJSONFile(SESSIONS_FILE);
                const session = sessions[sessionId];
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(session || null));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Session ID required' }));
            }
        } else if (req.method === 'POST') {
            // Save session data
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
                        res.end(JSON.stringify({ error: 'Failed to save session' }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
        } else if (req.method === 'DELETE') {
            // Delete session
            const sessionId = query.sessionId;
            if (sessionId) {
                const sessions = readJSONFile(SESSIONS_FILE);
                delete sessions[sessionId];

                if (writeJSONFile(SESSIONS_FILE, sessions)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to delete session' }));
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Session ID required' }));
            }
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// Serve static files
function serveStaticFile(req, res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`${req.method} ${pathname}`);

    // Handle API requests
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname, query);
        return;
    }

    // Handle static file requests
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    serveStaticFile(req, res, filePath);
});

// Start server
server.listen(PORT, 'localhost', () => {
    console.log(`🚀 Patient Management System Server running at http://localhost:${PORT}`);
    console.log(`📁 Data stored in: ${dataDir}`);
    console.log(`🔒 Sessions file: ${SESSIONS_FILE}`);
    console.log(`👥 Patients file: ${DATA_FILE}`);
    console.log('\n📋 Available endpoints:');
    console.log('   GET  /                     - Main application');
    console.log('   GET  /login.html           - Login page');
    console.log('   GET  /complete-patient-system.html - Patient management');
    console.log('   GET  /api/patients         - Get all patients');
    console.log('   POST /api/patients         - Save patients data');
    console.log('   GET  /api/sessions?sessionId=X - Get session');
    console.log('   POST /api/sessions         - Save session');
    console.log('   DELETE /api/sessions?sessionId=X - Delete session');
    console.log('\n🌐 Access from any browser at: http://localhost:3000');
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});