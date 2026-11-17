// Serves the repo, opens the game in demo mode and checks it runs and scores.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  let path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (path.endsWith('/')) path = join(path, 'index.html');
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(0);
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:${port}/?demo=1`);
await page.waitForTimeout(6000);
const score = await page.evaluate(() => window.__game.score);
await browser.close();
server.close();

if (errors.length) { console.error('page errors:', errors); process.exit(1); }
if (!(score > 0)) { console.error('demo mode never scored, score =', score); process.exit(1); }
console.log('smoke ok, demo score', score);
