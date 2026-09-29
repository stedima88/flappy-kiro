'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cfg = require('../../src/config.js');
const { circleIntersectsRect, hitsPair } = require('../../src/collision.js');
const walls = require('../../src/walls.js');

const rect = { x: 100, y: 100, w: 50, h: 50 };

test('circle overlapping a rectangle collides', () => {
  assert.equal(circleIntersectsRect(125, 125, 5, rect), true);
  assert.equal(circleIntersectsRect(95, 125, 10, rect), true);
});

test('circle just outside a rectangle does not collide', () => {
  assert.equal(circleIntersectsRect(80, 125, 10, rect), false);
  // corner: distance to (100,100) is sqrt(200) ~ 14.1 > 10
  assert.equal(circleIntersectsRect(90, 90, 10, rect), false);
});

test('empty rectangles never collide', () => {
  assert.equal(circleIntersectsRect(0, 0, 10, { x: 0, y: 0, w: 0, h: 10 }), false);
});

test('Ghosty in the middle of the gap passes, touching a cap hits (FR-6.1)', () => {
  const pair = walls.createPair(1, cfg.ghosty.x - 30, 275, 150);
  assert.equal(hitsPair({ x: cfg.ghosty.x, y: 275 }, pair, cfg), false);
  assert.equal(hitsPair({ x: cfg.ghosty.x, y: 200 + cfg.ghosty.hitRadius - 1 }, pair, cfg), true);
  assert.equal(hitsPair({ x: cfg.ghosty.x, y: 350 - cfg.ghosty.hitRadius + 1 }, pair, cfg), true);
});
