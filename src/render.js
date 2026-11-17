export function render(ctx, state) {
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = '#ccc';
  for (const c of state.comets) ctx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);

  const p = state.paddle;
  ctx.fillStyle = '#999';
  ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText('score ' + state.score, 8, 18);
}
