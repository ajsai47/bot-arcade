export function render(ctx, state) {
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = '#ccc';
  for (const c of state.comets) ctx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);

  const p = state.paddle;
  ctx.fillStyle = '#999';
  ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.save();
  ctx.fillStyle = '#ffd166';
  for (const particle of state.particles) {
    ctx.globalAlpha = particle.life / 0.7;
    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
  }
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  for (const text of state.floatingScores) {
    ctx.globalAlpha = text.life;
    ctx.fillText('+' + text.value, Math.max(20, Math.min(state.width - 20, text.x)), text.y);
  }
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText('score ' + state.score, 8, 18);
  ctx.fillText('lives ' + state.lives, 8, 36);
  ctx.fillText('combo x' + state.combo, 8, 54);

  if (state.lives === 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, state.width, state.height);

    const x = state.width / 2;
    const y = state.height / 2;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('Game over', x, y - 28);
    ctx.font = '18px monospace';
    ctx.fillText('Final score: ' + state.score, x, y + 4);
    ctx.fillText('Press Space / tap to restart', x, y + 36);
    ctx.restore();
  }
}
