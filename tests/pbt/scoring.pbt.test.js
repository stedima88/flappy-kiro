'use strict';
const { test } = require('node:test');
const { fc, cfg, pair } = require('./arbitraries.js');
const { scorePairs } = require('../../src/scoring.js');

test('PBT invariant: each pair adds at most one point and score equals pairs passed (FR-4.1)', () => {
  fc.assert(
    fc.property(fc.uniqueArray(pair, { selector: (p) => p.id, maxLength: 8 }), fc.array(fc.double({ min: 0, max: 30, noNaN: true }), { maxLength: 60 }), (initial, moves) => {
      let pairs = initial.map((p) => ({ ...p, passed: false }));
      let total = 0;
      for (const dx of moves) {
        const before = pairs.filter((p) => p.passed).length;
        const r = scorePairs(pairs, cfg.ghosty.x, cfg);
        if (r.gained < 0 || r.gained > pairs.length) return false;
        if (r.pairs.filter((p) => p.passed).length !== before + r.gained) return false;
        total += r.gained;
        pairs = r.pairs.map((p) => ({ ...p, x: p.x - dx }));
      }
      return total === pairs.filter((p) => p.passed).length && total <= initial.length;
    }),
  );
});

test('PBT idempotence: scoring the same positions twice adds nothing the second time', () => {
  fc.assert(
    fc.property(fc.array(pair, { maxLength: 8 }), (pairs) => {
      const once = scorePairs(pairs, cfg.ghosty.x, cfg);
      return scorePairs(once.pairs, cfg.ghosty.x, cfg).gained === 0;
    }),
  );
});
