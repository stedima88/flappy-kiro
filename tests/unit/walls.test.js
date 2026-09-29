'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cfg = require('../../src/config.js');
const walls = require('../../src/walls.js');

test('gap bounds keep the gap inside the play area with margins (FR-3.3)', () => {
  const { min, max } = walls.gapBounds(170, cfg);
  assert.equal(min, cfg.walls.gapMargin + 85);
  assert.equal(max, cfg.playHeight - cfg.walls.gapMargin - 85);
});

test('first gap uses the whole range, later gaps move at most maxGapDelta (FR-3.3, FR-3.4)', () => {
  const { min, max } = walls.gapBounds(170, cfg);
  assert.equal(walls.nextGapCenter(null, 170, () => 0, cfg), min);
  assert.equal(walls.nextGapCenter(300, 170, () => 0.999999, cfg) <= 300 + cfg.walls.maxGapDelta, true);
  assert.equal(walls.nextGapCenter(max, 170, () => 1 - 1e-9, cfg), max);
  assert.equal(walls.nextGapCenter(min, 170, () => 0, cfg), min);
});

test('rectangles surround the gap exactly (FR-3.1)', () => {
  const pair = walls.createPair(1, 400, 275, 150);
  const [topBody, topCap, bottomCap, bottomBody] = walls.rectsFor(pair, cfg);
  assert.equal(topCap.y + topCap.h, 200);
  assert.equal(bottomCap.y, 350);
  assert.equal(topBody.y, 0);
  assert.equal(bottomBody.y + bottomBody.h, cfg.playHeight);
  assert.ok(topCap.w > topBody.w);
});

test('first pair spawns at the right edge, the next after the spacing (FR-3.5)', () => {
  assert.equal(walls.nextSpawnX([], cfg), cfg.width);
  const p = walls.createPair(1, cfg.width, 275, 150);
  assert.equal(walls.nextSpawnX([p], cfg), null);
  const moved = { ...p, x: cfg.width - cfg.walls.spacing };
  assert.equal(walls.nextSpawnX([moved], cfg), cfg.width);
});

test('pairs move left and are removed once fully off screen (FR-3.5, NFR-2.4)', () => {
  const pairs = [walls.createPair(1, 10, 275, 150), walls.createPair(2, 300, 275, 150)];
  const moved = walls.advance(pairs, 100, cfg);
  assert.deepEqual(moved.map((p) => p.id), [2]);
  assert.equal(moved[0].x, 200);
});
