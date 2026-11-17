const hudFont = 'ui-monospace, "SFMono-Regular", Consolas, monospace';
const starLayers = [
  { count: 104, speed: 2, size: 1, color: 'rgba(154, 175, 247, 0.32)' },
  { count: 36, speed: 6, size: 1.5, color: 'rgba(167, 217, 255, 0.63)' },
].map((layer, depth) => ({
  ...layer,
  stars: Array.from({ length: layer.count }, (_, i) => [
    ((i * 2 + depth) * 0.61803398875) % 1,
    ((i * 2 + depth) * 0.41421356237) % 1,
  ]),
}));

const backgrounds = new WeakMap();
function drawSpace(ctx, width, height, time) {
  let sky = backgrounds.get(ctx);
  if (!sky || sky.width !== width || sky.height !== height) {
    const gradient = ctx.createRadialGradient(width * 0.52, height * 0.62, 0,
      width * 0.52, height * 0.62, width * 0.66);
    gradient.addColorStop(0, '#181839');
    gradient.addColorStop(0.62, '#0e1129');
    gradient.addColorStop(1, '#060812');
    sky = { width, height, gradient };
    backgrounds.set(ctx, sky);
  }
  ctx.fillStyle = sky.gradient;
  ctx.fillRect(0, 0, width, height);

  for (const { stars, speed, size, color } of starLayers) {
    const dx = time * speed % width;
    const dy = time * speed * 0.4 % height;
    ctx.fillStyle = color;
    for (const [x, y] of stars) {
      ctx.fillRect(Math.floor((x * width + dx) % width),
        Math.floor((y * height + dy) % height), size, size);
    }
  }
}

function drawComet(ctx, { x, y, r }) {
  const tip = y - r * 6;
  const tail = ctx.createLinearGradient(x, tip, x, y);
  tail.addColorStop(0, 'rgba(167, 83, 255, 0)');
  tail.addColorStop(0.6, 'rgba(175, 88, 255, 0.5)');
  tail.addColorStop(1, '#ff83ec');
  ctx.fillStyle = tail;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.quadraticCurveTo(x + r * 0.42, y - r * 2, x + r * 0.85, y);
  ctx.lineTo(x - r * 0.85, y);
  ctx.quadraticCurveTo(x - r * 0.42, y - r * 2, x, tip);
  ctx.fill();

  const halo = ctx.createRadialGradient(x, y, r * 0.65, x, y, r * 2.5);
  halo.addColorStop(0, 'rgba(255, 99, 224, 0.8)');
  halo.addColorStop(1, 'rgba(255, 99, 224, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);
  const core = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, 0, x, y, r);
  core.addColorStop(0, '#fff8ff');
  core.addColorStop(0.55, '#ffc5fa');
  core.addColorStop(1, '#fb65dc');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function render(ctx, state, time = performance.now() / 1000) {
  drawSpace(ctx, state.width, state.height, time);

  for (const c of state.comets) drawComet(ctx, c);

  ctx.save();
  const p = state.paddle;
  ctx.shadowColor = '#1eeaff';
  ctx.shadowBlur = 16;
  const paddle = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
  paddle.addColorStop(0, '#daffff');
  paddle.addColorStop(0.32, '#62f7ff');
  paddle.addColorStop(1, '#0da8e9');
  ctx.fillStyle = paddle;
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, p.h / 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#ffe0fc';
  ctx.shadowColor = '#ff63e0';
  ctx.shadowBlur = 12;
  for (const particle of state.particles) {
    ctx.globalAlpha = particle.life / 0.7;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffedb0';
  ctx.shadowColor = '#ff9944';
  ctx.font = '700 22px ' + hudFont;
  ctx.textAlign = 'center';
  for (const text of state.floatingScores) {
    ctx.globalAlpha = text.life;
    ctx.fillText('+' + text.value, Math.max(20, Math.min(state.width - 20, text.x)), text.y);
  }
  ctx.restore();

  ctx.save();
  ctx.font = '700 16px ' + hudFont;
  ctx.fillStyle = '#86f6ff';
  ctx.fillText('SCORE  ' + state.score, 24, 33);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffedb0';
  ctx.fillText('COMBO  ×' + state.combo, state.width / 2, 33);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f8a8fe';
  ctx.fillText('LIVES  ' + state.lives, state.width - 24, 33);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffedb0';
  ctx.shadowColor = '#ff9944';
  ctx.shadowBlur = 10;
  ctx.fillText('BEST  ' + (state.bestScore ?? 0), 24, 70);
  if (state.newBest) {
    ctx.textAlign = 'right';
    ctx.fillText('NEW BEST!', state.width - 24, 70);
  }
  ctx.fillStyle = 'rgba(127, 169, 247, 0.24)';
  ctx.fillRect(24, 45, state.width - 48, 1);
  ctx.restore();

  if (state.lives === 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, state.width, state.height);

    const x = state.width / 2;
    const y = state.height / 2;
    ctx.save();
    ctx.fillStyle = '#86f6ff';
    ctx.textAlign = 'center';
    ctx.font = '700 32px ' + hudFont;
    ctx.fillText('Game over', x, y - 52);
    ctx.fillStyle = '#e3ddff';
    ctx.font = '18px ' + hudFont;
    ctx.fillText('Final score: ' + state.score, x, y - 20);
    ctx.fillStyle = '#ffedb0';
    ctx.fillText('BEST  ' + (state.bestScore ?? 0), x, y + 12);
    if (state.newBest) {
      ctx.shadowColor = '#ff9944';
      ctx.shadowBlur = 14;
      ctx.font = '700 20px ' + hudFont;
      ctx.fillText('NEW BEST!', x, y + 44);
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#e3ddff';
    ctx.font = '18px ' + hudFont;
    ctx.fillText('Press Space / tap to restart', x, y + 80);
    ctx.restore();
  }
}
