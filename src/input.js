export function attachInput(target) {
  const input = { left: false, right: false };
  const set = (e, down) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.left = down;
    if (e.key === 'ArrowRight' || e.key === 'd') input.right = down;
  };
  target.addEventListener('keydown', (e) => set(e, true));
  target.addEventListener('keyup', (e) => set(e, false));
  return input;
}
