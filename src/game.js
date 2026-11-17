export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const STARTING_LIVES = 3;
const DEMO_RESTART_DELAY = 2;
const LEVEL_DURATION = 15;
const LEVEL_UP_DURATION = 1.6;
const BASE_FALL_SPEED = 140;
const FALL_SPEED_PER_LEVEL = 20;
const MAX_FALL_SPEED = 280;
const BASE_SPAWN_INTERVAL = 1;
const SPAWN_INTERVAL_STEP = 0.08;
const MIN_SPAWN_INTERVAL = 0.45;

function bestScoreKey(demo) {
  return demo ? 'comet-catcher:demo-best' : 'comet-catcher:best';
}

export function createState(width, height, { demo = false, seed = 1, bestScore = 0 } = {}) {
  try {
    const saved = Number(globalThis.localStorage.getItem(bestScoreKey(demo)));
    if (Number.isSafeInteger(saved) && saved >= 0) bestScore = Math.max(bestScore, saved);
  } catch {}
  return {
    width, height, demo, seed,
    random: rng(seed),
    paddle: { x: width / 2 - 50, y: height - 30, w: 100, h: 12, speed: 420 },
    comets: [],
    spawnTimer: 0,
    score: 0,
    bestScore,
    newBest: false,
    lives: STARTING_LIVES,
    gameOverTime: 0,
    combo: 1,
    streak: 0,
    particles: [],
    floatingScores: [],
    time: 0,
    level: 1,
    levelUpUntil: 0,
  };
}

function spawnComet(state) {
  const vy = Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED + (state.level - 1) * FALL_SPEED_PER_LEVEL);
  state.comets.push({ x: 10 + state.random() * (state.width - 20), y: -10, r: 8, vy });
}

function demoSteer(state) {
  const target = state.comets.reduce((best, c) => (!best || c.y > best.y ? c : best), null);
  const center = state.paddle.x + state.paddle.w / 2;
  if (!target) return { left: false, right: false };
  const resolved = state.score + STARTING_LIVES - state.lives;
  if (resolved % 3 === 2) {
    return { left: target.x > state.width / 2, right: target.x <= state.width / 2 };
  }
  return { left: target.x < center - 8, right: target.x > center + 8 };
}

export function update(state, input, dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 180 * dt;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  for (const text of state.floatingScores) {
    text.y -= 40 * dt;
    text.life -= dt;
  }
  state.floatingScores = state.floatingScores.filter((text) => text.life > 0);
  if (state.lives === 0) {
    state.gameOverTime += dt;
    if (state.demo ? state.gameOverTime >= DEMO_RESTART_DELAY : input.restart) {
      Object.assign(state, createState(state.width, state.height, state));
    }
    return;
  }

  state.time += dt;
  const level = Math.floor(state.time / LEVEL_DURATION) + 1;
  if (level > state.level) {
    state.level = level;
    state.levelUpUntil = state.time + LEVEL_UP_DURATION;
  }
  const controls = state.demo ? demoSteer(state) : input;
  const p = state.paddle;
  if (controls.left) p.x -= p.speed * dt;
  if (controls.right) p.x += p.speed * dt;
  p.x = Math.max(0, Math.min(state.width - p.w, p.x));

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnComet(state);
    state.spawnTimer = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - (level - 1) * SPAWN_INTERVAL_STEP);
  }

  for (const c of state.comets) c.y += c.vy * dt;
  state.comets = state.comets.filter((c) => {
    const caught = c.y + c.r >= p.y && c.x >= p.x && c.x <= p.x + p.w && c.y < p.y + p.h;
    if (caught) {
      state.streak += 1;
      state.combo = Math.min(state.streak, 5);
      state.score += state.combo;
      if (state.score > state.bestScore) {
        state.bestScore = state.score;
        state.newBest = true;
        try {
          globalThis.localStorage.setItem(bestScoreKey(state.demo), String(state.bestScore));
        } catch {}
      }
      state.floatingScores.push({ x: c.x, y: p.y - 12, value: state.combo, life: 1 });
      for (let i = 0; i < 16; i++) {
        const angle = i * Math.PI * 2 / 16;
        const speed = 70 + (i % 3) * 25;
        state.particles.push({ x: c.x, y: p.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60, life: 0.7 });
      }
      return false;
    }
    if (c.y + c.r >= state.height) {
      state.lives = Math.max(0, state.lives - 1);
      state.streak = 0;
      state.combo = 1;
      return false;
    }
    return true;
  });
}
