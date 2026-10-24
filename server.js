const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const INITIAL_PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8'
};

function getNetworkIPv4() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

function createServer(port) {
  const server = http.createServer((req, res) => {
    // Add CORS headers for local multi-device and asset testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const parsedUrl = new URL(req.url, `http://localhost:${port}`);
      let reqPath = decodeURIComponent(parsedUrl.pathname);

      if (reqPath === '/') {
        reqPath = '/index.html';
      }

      let filePath = path.normalize(path.join(ROOT_DIR, reqPath));

      // Security: Disallow directory traversal
      if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
      }

      fs.stat(filePath, (err, stats) => {
        if (err) {
          // Fallback to index.html for client-side routing if requested file not found
          const fallbackPath = path.join(ROOT_DIR, 'index.html');
          if (fs.existsSync(fallbackPath) && !path.extname(reqPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            fs.createReadStream(fallbackPath).pipe(res);
            return;
          }
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(`<h1>404 Not Found</h1><p>The requested file <code>${reqPath}</code> was not found.</p>`);
          return;
        }

        if (stats.isDirectory()) {
          const indexInside = path.join(filePath, 'index.html');
          if (fs.existsSync(indexInside)) {
            filePath = indexInside;
          } else {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Directory listing is not allowed.');
            return;
          }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stats.size,
          'Cache-Control': 'no-cache'
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error: ' + e.message);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      createServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    const networkIp = getNetworkIPv4();
    console.log('\n======================================================');
    console.log('       EGS QUIZ ARENA - LOCAL HOST SERVER RUNNING      ');
    console.log('======================================================');
    console.log(` > Local:            http://localhost:${port}/`);
    if (networkIp) {
      console.log(` > On Your Network:  http://${networkIp}:${port}/`);
    }
    console.log('======================================================\n');
  });
}

createServer(INITIAL_PORT);
