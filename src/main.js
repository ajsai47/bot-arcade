// Comet Catcher: move the paddle and catch falling comets.
// Controls: arrow keys or A/D. Add ?demo=1 to let the game play itself.
import { createState, update } from './game.js';
import { render } from './render.js';
import { attachInput } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const state = createState(canvas.width, canvas.height, { demo: params.has('demo'), seed: Number(params.get('seed') || 1) });
const input = attachInput(window);

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || state.lives !== 0) return;
  event.preventDefault();
  if (!event.repeat) input.restart = true;
});
canvas.addEventListener('pointerdown', () => {
  if (state.lives === 0) input.restart = true;
});

window.__game = state;

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(state, input, dt);
  input.restart = false;
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
