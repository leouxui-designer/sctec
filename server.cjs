const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { readConfig } = require('./config.cjs');

const config = readConfig();
const PORT = config.port;
const ROOT = __dirname;
const ALLOWED_MANIFEST_ORIGINS = new Set(config.parentOrigins);
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function manifestForEnvironment() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'prototype-manifest.json'), 'utf8'));
  manifest.entryUrl = `${config.viewerOrigin}/viewer.html`;
  return JSON.stringify(manifest, null, 2);
}

function runtimeConfigScript() {
  return `window.__SCTEC_VIEWER_CONFIG__=${JSON.stringify({ trustedParentOrigins: config.parentOrigins })};\n`;
}

function securityHeaders() {
  const ancestors = ["'self'", ...config.parentOrigins].join(' ');
  return {
    'Content-Security-Policy': `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-ancestors ${ancestors}`,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  };
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const requestOrigin = req.headers.origin;
  if (pathname === '/prototype-manifest.json' && requestOrigin &&
      !ALLOWED_MANIFEST_ORIGINS.has(requestOrigin)) {
    res.writeHead(403, { 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' });
    res.end('Forbidden');
    return;
  }

  const relativePath = pathname === '/favicon.ico'
    ? path.join('assets', 'bandeira-sc.png')
    : pathname.replace(/^[/\\]+/u, '') || 'index.html';
  if (pathname === '/runtime-config.js') {
    const headers = { 'Content-Type': 'application/javascript; charset=utf-8', ...securityHeaders() };
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : runtimeConfigScript());
    return;
  }
  const filePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, filePath);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500);
      res.end(error.code === 'ENOENT' || error.code === 'EISDIR' ? 'Not Found' : 'Server Error');
      return;
    }

    const headers = { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream', ...securityHeaders() };
    if (pathname === '/prototype-manifest.json') data = Buffer.from(manifestForEnvironment());
    if (pathname === '/prototype-manifest.json' && requestOrigin &&
        ALLOWED_MANIFEST_ORIGINS.has(requestOrigin)) {
      headers['Access-Control-Allow-Origin'] = requestOrigin;
      headers['Vary'] = 'Origin';
    }
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('SCTEC isolated prototype at http://127.0.0.1:' + PORT);
});
