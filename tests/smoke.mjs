// Serves the repo, opens the game in demo mode and checks it runs and scores.
import assert from 'node:assert/strict';
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
const page = await browser.newPage({ hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:${port}/?demo=1`);
await page.waitForTimeout(6000);
const score = await page.evaluate(() => window.__game.score);
const gameOver = await page.waitForFunction(() => window.__game.lives === 0 && window.__game.score);
assert.ok(await gameOver.jsonValue());
await page.waitForFunction(() => {
  const { lives, score, demo } = window.__game;
  return demo && lives === 3 && score === 0;
});

await page.goto(`http://localhost:${port}/`);
await page.waitForFunction(() => window.__game?.lives === 3);
async function missComet(lives) {
  await page.evaluate(() => {
    const game = window.__game;
    game.comets.push({ x: 10, y: game.height - 8, r: 8, vy: 0 });
  });
  await page.waitForFunction((remaining) => window.__game.lives === remaining, lives);
}
await missComet(2);
await missComet(1);
await missComet(0);
const stoppedTime = await page.evaluate(() => window.__game.time);
await page.waitForFunction(() => window.__game.gameOverTime > 0.1);
assert.equal(await page.evaluate(() => window.__game.time), stoppedTime);
await page.keyboard.press('Space');
await page.waitForFunction(() => window.__game.lives === 3 && window.__game.score === 0);
await missComet(2);
await missComet(1);
await missComet(0);
await page.locator('canvas').tap();
await page.waitForFunction(() => window.__game.lives === 3 && window.__game.score === 0);
console.log('lives, game over, and restart checks ok');
await browser.close();
server.close();

if (errors.length) { console.error('page errors:', errors); process.exit(1); }
if (!(score > 0)) { console.error('demo mode never scored, score =', score); process.exit(1); }
console.log('smoke ok, demo score', score);
