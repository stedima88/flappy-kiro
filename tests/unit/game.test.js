'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cfg = require('../../src/config.js');
const { createRng } = require('../../src/rng.js');
const G = require('../../src/game.js');
const walls = require('../../src/walls.js');

const { STATES: S, EVENTS: E } = G;
const newGame = (highScore = 0) => G.createGame({ cfg, rng: createRng(42), highScore });
const types = (effects) => effects.map((e) => e.name || e.type);

test('starts on the start screen (FR-7.1)', () => {
  assert.equal(newGame().state, S.START);
});

test('the first flap starts the game and is also a flap (FR-7.1)', () => {
  const g = newGame();
  const fx = G.dispatch(g, E.FLAP);
  assert.equal(g.state, S.PLAYING);
  assert.equal(g.ghosty.vy, cfg.flapVelocity);
  assert.deepEqual(types(fx), ['jump']);
});

test('P / Esc pause and resume, a hidden tab pauses (FR-7.3, NFR-6.4)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  G.dispatch(g, E.PAUSE);
  assert.equal(g.state, S.PAUSED);
  G.dispatch(g, E.ESC);
  assert.equal(g.state, S.PLAYING);
  G.dispatch(g, E.HIDDEN);
  assert.equal(g.state, S.PAUSED);
});

test('the simulation is frozen while paused (FR-7.3)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  G.dispatch(g, E.PAUSE);
  const before = JSON.stringify(g.ghosty);
  G.update(g, 1 / 60);
  G.dispatch(g, E.FLAP);
  assert.equal(JSON.stringify(g.ghosty), before);
});

test('falling to the ground ends the game at once, with sound (FR-6.2, FR-6.5)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  const all = [];
  for (let i = 0; i < 600 && g.state === S.PLAYING; i++) all.push(...G.update(g, 1 / 60));
  assert.equal(g.state, S.GAME_OVER);
  assert.ok(types(all).includes('gameOver'));
});

test('hitting a wall ends the game (FR-6.1)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  g.pairs = [walls.createPair(99, cfg.ghosty.x - 20, 100, 125)]; // gap far above Ghosty
  g.ghosty = { ...g.ghosty, y: 400, vy: 0 };
  G.update(g, 1 / 60);
  assert.equal(g.state, S.GAME_OVER);
});

test('passing a pair scores one point (FR-4.1)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  g.pairs = [walls.createPair(99, cfg.ghosty.x - cfg.walls.bodyWidth - 0.5, g.ghosty.y, 170)];
  const fx = G.update(g, 1 / 60);
  assert.equal(g.score, 1);
  assert.ok(types(fx).includes('scored'));
});

test('a new high score is saved at game over (FR-5.2)', () => {
  const g = newGame(2);
  G.dispatch(g, E.FLAP);
  g.score = 5;
  g.ghosty = { ...g.ghosty, y: cfg.playHeight };
  const fx = G.update(g, 1 / 60);
  assert.equal(g.highScore, 5);
  assert.equal(g.newHigh, true);
  assert.deepEqual(fx.find((f) => f.type === 'saveHighScore'), { type: 'saveHighScore', value: 5 });
});

test('a lower score does not replace the high score', () => {
  const g = newGame(10);
  G.dispatch(g, E.FLAP);
  g.score = 3;
  g.ghosty = { ...g.ghosty, y: cfg.playHeight };
  const fx = G.update(g, 1 / 60);
  assert.equal(g.highScore, 10);
  assert.equal(g.newHigh, false);
  assert.equal(fx.some((f) => f.type === 'saveHighScore'), false);
});

test('restart waits for the cooldown and resets the run (FR-7.4, FR-7.5)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  g.score = 4;
  g.ghosty = { ...g.ghosty, y: cfg.playHeight };
  G.update(g, 1 / 60);
  assert.equal(g.state, S.GAME_OVER);
  G.dispatch(g, E.FLAP);
  assert.equal(g.state, S.GAME_OVER, 'flap during cooldown is ignored');
  G.update(g, cfg.maxFrameDt);
  for (let t = 0; t < cfg.gameOverCooldown; t += cfg.maxFrameDt) G.update(g, cfg.maxFrameDt);
  G.dispatch(g, E.FLAP);
  assert.equal(g.state, S.PLAYING);
  assert.equal(g.score, 0);
  assert.deepEqual(g.pairs, []);
  assert.equal(g.highScore, 4);
});

test('Esc on game over returns to the start screen and clears the run', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  g.score = 3;
  g.ghosty = { ...g.ghosty, y: cfg.playHeight };
  G.update(g, 1 / 60);
  G.dispatch(g, E.ESC);
  assert.equal(g.state, S.START);
  assert.equal(g.score, 0);
  assert.equal(g.highScore, 3);
});

test('settings open from start and pause and return to where they came from (FR-12.1)', () => {
  const g = newGame();
  G.dispatch(g, E.OPEN_SETTINGS);
  assert.equal(g.state, S.SETTINGS);
  G.dispatch(g, E.CLOSE_SETTINGS);
  assert.equal(g.state, S.START);
  G.dispatch(g, E.FLAP);
  G.dispatch(g, E.OPEN_SETTINGS);
  assert.equal(g.state, S.PLAYING, 'settings cannot open during play');
  G.dispatch(g, E.PAUSE);
  G.dispatch(g, E.OPEN_SETTINGS);
  G.dispatch(g, E.ESC);
  assert.equal(g.state, S.PAUSED);
});

test('reset high score only works inside settings (FR-12.2)', () => {
  const g = newGame(9);
  G.dispatch(g, E.RESET_HIGH_SCORE);
  assert.equal(g.highScore, 9);
  G.dispatch(g, E.OPEN_SETTINGS);
  const fx = G.dispatch(g, E.RESET_HIGH_SCORE);
  assert.equal(g.highScore, 0);
  assert.deepEqual(fx, [{ type: 'saveHighScore', value: 0 }]);
});

test('the first wall pair appears at the right edge once play starts (FR-3.5)', () => {
  const g = newGame();
  G.dispatch(g, E.FLAP);
  G.update(g, 1 / 60);
  assert.equal(g.pairs.length, 1);
  assert.ok(g.pairs[0].x > cfg.width - 10);
});
