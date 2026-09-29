'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cfg = require('../../src/config.js');
const { speedFor, gapFor } = require('../../src/difficulty.js');

test('difficulty starts at the base values (FR-8.1)', () => {
  assert.equal(speedFor(0, cfg), cfg.difficulty.baseSpeed);
  assert.equal(gapFor(0, cfg), cfg.difficulty.baseGap);
});

test('difficulty grows with score (FR-8.1)', () => {
  assert.equal(speedFor(5, cfg), cfg.difficulty.baseSpeed + 5 * cfg.difficulty.speedPerPoint);
  assert.equal(gapFor(5, cfg), cfg.difficulty.baseGap - 5 * cfg.difficulty.gapPerPoint);
});

test('difficulty stops at its limits (FR-8.2)', () => {
  assert.equal(speedFor(10000, cfg), cfg.difficulty.maxSpeed);
  assert.equal(gapFor(10000, cfg), cfg.difficulty.minGap);
});
