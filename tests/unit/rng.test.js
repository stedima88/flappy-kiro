'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRng } = require('../../src/rng.js');

test('same seed gives the same sequence (NFR-4.2)', () => {
  const a = createRng(123);
  const b = createRng(123);
  for (let i = 0; i < 10; i++) assert.equal(a(), b());
});

test('different seeds give different sequences', () => {
  assert.notEqual(createRng(1)(), createRng(2)());
});
