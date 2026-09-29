'use strict';
const { test } = require('node:test');
const { fc, cfg, score } = require('./arbitraries.js');
const { speedFor, gapFor } = require('../../src/difficulty.js');

test('PBT ordering: speed never decreases and gap never grows as score rises (FR-8.1)', () => {
  fc.assert(
    fc.property(score, score, (a, b) => {
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      return speedFor(lo, cfg) <= speedFor(hi, cfg) && gapFor(lo, cfg) >= gapFor(hi, cfg);
    }),
  );
});

test('PBT range: difficulty always stays within its limits (FR-8.2)', () => {
  const d = cfg.difficulty;
  fc.assert(
    fc.property(score, (s) => {
      const v = speedFor(s, cfg);
      const gap = gapFor(s, cfg);
      return v >= d.baseSpeed && v <= d.maxSpeed && gap >= d.minGap && gap <= d.baseGap;
    }),
  );
});
