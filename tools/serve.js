#!/usr/bin/env node
/*
 * serve.js — 零依赖静态文件服务器 (trình chạy web cục bộ, không cần npm install)
 * Tiny dependency-free static server to preview the HTML/JS course projects
 * (坦克大战 / 植物大战僵尸 / 反应力小游戏 / 贪吃蛇 / web 实验程序) in a browser
 * or in the Antigravity preview pane.
 *
 * Usage:
 *   node tools/serve.js [port] [root]
 *   port default: 8000 | root default: 选修课/web程序设计
 *
 * Examples:
 *   npm run serve                       -> http://localhost:8000
 *   node tools/serve.js 3000 "模拟电子技术"
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2] || process.env.PORT || '8000', 10);
const ROOT = path.resolve(process.argv[3] || path.join(__dirname, '..', '选修课', 'web程序设计'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

function send(res, code, body, type = 'text/html; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function listing(res, relDir) {
  const dir = path.join(ROOT, relDir);
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return send(res, 404, '404 Not Found', 'text/plain; charset=utf-8');
  }
  const items = entries
    .filter((e) => !e.name.startsWith('.'))
    .sort((a, b) => {
      const da = a.isDirectory() ? 0 : 1, db = b.isDirectory() ? 0 : 1;
      return da - db || a.name.localeCompare(b.name, 'zh');
    })
    .map((e) => {
      const name = e.name;
      const href = path.posix.join('/', relDir, name) + (e.isDirectory() ? '/' : '');
      const icon = e.isDirectory() ? '📁' : (/\.(html?|js|css)$/i.test(name) ? '🌐' : '📄');
      return `<li>${icon} <a href="${href.split('/').map(encodeURIComponent).join('/')}">${name}</a></li>`;
    })
    .join('\n');
  const body = `<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8">
<title>Index of /${relDir}</title>
<style>body{font-family:system-ui,sans-serif;margin:2em auto;max-width:52em;padding:0 1em;color:#222}
a{text-decoration:none;color:#0b62c4}a:hover{text-decoration:underline}
li{margin:.35em 0;list-style:none}h1{font-size:1.3em;border-bottom:1px solid #ddd;padding-bottom:.3em}
hr{border:none;border-top:1px solid #ddd}</style>
</head><body><h1>📂 /${relDir || ''}</h1><ul>${items || '<li>(empty)</li>'}</ul>
<hr><small>served by tools/serve.js — root: ${path.basename(ROOT)}</small></body></html>`;
  send(res, 200, body);
}

const server = http.createServer((req, res) => {
  let rel;
  try {
    rel = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    return send(res, 400, 'Bad request', 'text/plain');
  }
  // normalize and keep the request inside ROOT (no traversal)
  let target = path.normalize(path.join(ROOT, rel));
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Forbidden', 'text/plain');
  }
  fs.stat(target, (err, st) => {
    if (err) return send(res, 404, '404 Not Found: ' + rel, 'text/plain; charset=utf-8');
    if (st.isDirectory()) {
      const index = path.join(target, 'index.html');
      if (fs.existsSync(index)) {
        rel = '/' + path.relative(ROOT, index).split(path.sep).join('/');
        target = index;
      } else {
        return listing(res, path.relative(ROOT, target).split(path.sep).join('/'));
      }
    }
    const ext = path.extname(target).toLowerCase();
    fs.readFile(target, (e, data) => {
      if (e) return send(res, 500, '500: ' + e.message, 'text/plain');
      send(res, 200, data, MIME[ext] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serving ${ROOT}`);
  console.log(`→ http://localhost:${PORT}/`);
});
