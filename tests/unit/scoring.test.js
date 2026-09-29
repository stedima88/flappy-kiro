'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cfg = require('../../src/config.js');
const { scorePairs } = require('../../src/scoring.js');
const walls = require('../../src/walls.js');

test('a pair scores once Ghosty passes its trailing edge (FR-4.1)', () => {
  const pair = walls.createPair(1, cfg.ghosty.x - cfg.walls.bodyWidth - 1, 275, 150);
  const r = scorePairs([pair], cfg.ghosty.x, cfg);
  assert.equal(r.gained, 1);
  assert.equal(r.pairs[0].passed, true);
});

test('a pair is never counted twice (FR-4.1)', () => {
  const pair = walls.createPair(1, 0, 275, 150);
  const once = scorePairs([pair], cfg.ghosty.x, cfg);
  const twice = scorePairs(once.pairs, cfg.ghosty.x, cfg);
  assert.equal(twice.gained, 0);
});

test('a pair Ghosty is still inside does not score', () => {
  const pair = walls.createPair(1, cfg.ghosty.x - 10, 275, 150);
  assert.equal(scorePairs([pair], cfg.ghosty.x, cfg).gained, 0);
});
