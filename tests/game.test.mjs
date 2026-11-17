import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, update } from '../src/game.js';

test('catches award capped combo points and create temporary feedback', () => {
  const state = createState(640, 480);
  state.spawnTimer = 100;
  for (let i = 1; i <= 7; i++) {
    state.comets = [{ x: 320, y: 444, r: 8, vy: 0 }];
    update(state, {}, 0);
    assert.equal(state.combo, Math.min(i, 5));
    assert.equal(state.floatingScores.at(-1).value, state.combo);
    assert.equal(state.particles.at(-1).x, 320);
    assert.equal(state.particles.at(-1).y, state.paddle.y);
  }
  assert.equal(state.score, 25);
  assert.equal(state.particles.length, 112);
  update(state, {}, 1.1);
  assert.deepEqual(state.particles, []);
  assert.deepEqual(state.floatingScores, []);
});

test('a miss resets the combo and the next catch awards one point', () => {
  const state = createState(640, 480);
  state.spawnTimer = 100;
  state.streak = 4;
  state.combo = 4;
  state.comets = [{ x: 10, y: 472, r: 8, vy: 0 }];
  update(state, {}, 0);
  assert.equal(state.combo, 1);
  assert.equal(state.streak, 0);
  assert.equal(state.score, 0);
  assert.equal(state.lives, 2);
  assert.deepEqual(state.particles, []);
  state.comets = [{ x: 320, y: 444, r: 8, vy: 0 }];
  update(state, {}, 0);
  assert.equal(state.score, 1);
});

test('feedback expires during game over and restart clears combo state', () => {
  const state = createState(640, 480);
  state.spawnTimer = 100;
  state.comets = [{ x: 320, y: 444, r: 8, vy: 0 }];
  update(state, {}, 0);
  state.lives = 1;
  state.comets = [{ x: 10, y: 472, r: 8, vy: 0 }];
  update(state, {}, 0);
  assert.equal(state.lives, 0);
  const stoppedTime = state.time;
  update(state, {}, 1.1);
  assert.equal(state.time, stoppedTime);
  assert.deepEqual(state.particles, []);
  assert.deepEqual(state.floatingScores, []);
  update(state, { restart: true }, 0);
  assert.equal(state.lives, 3);
  assert.equal(state.score, 0);
  assert.equal(state.combo, 1);
  assert.equal(state.streak, 0);
});
