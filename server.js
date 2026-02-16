const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;
const root = process.cwd();

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8'
};

function send(res, status, body, type = 'text/plain; charset=UTF-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(reqPath).replace(/^\/+(\.\.\/)+/, '/');
  let filePath = path.join(root, safePath);

  if (safePath === '/' || safePath === '') {
    filePath = path.join(root, 'index.html');
  }

  if (!filePath.startsWith(root)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      return send(res, 404, 'Not Found');
    }

    const finalPath = stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;

    fs.readFile(finalPath, (readErr, data) => {
      if (readErr) {
        return send(res, 404, 'Not Found');
      }

      const ext = path.extname(finalPath).toLowerCase();
      const type = mimeTypes[ext] || 'application/octet-stream';
      send(res, 200, data, type);
    });
  });
});

server.listen(port, () => {
  console.log(`Preview server running at http://127.0.0.1:${port}`);
});
