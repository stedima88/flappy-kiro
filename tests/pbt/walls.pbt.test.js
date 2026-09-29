'use strict';
const { test } = require('node:test');
const { fc, cfg, gapSize, rngValues, makeRng } = require('./arbitraries.js');
const walls = require('../../src/walls.js');

test('PBT business rule: every gap stays in bounds and moves at most maxGapDelta (FR-3.3, FR-3.4)', () => {
  fc.assert(
    fc.property(gapSize, rngValues, fc.integer({ min: 1, max: 100 }), (gap, values, count) => {
      const rng = makeRng(values);
      const { min, max } = walls.gapBounds(gap, cfg);
      let prev = null;
      for (let i = 0; i < count; i++) {
        const c = walls.nextGapCenter(prev, gap, rng, cfg);
        if (c < min || c > max) return false;
        if (prev !== null && Math.abs(c - prev) > cfg.walls.maxGapDelta + 1e-9) return false;
        // the whole gap, not just the centre, lies inside the margins
        if (c - gap / 2 < cfg.walls.gapMargin - 1e-9 || c + gap / 2 > cfg.playHeight - cfg.walls.gapMargin + 1e-9) return false;
        prev = c;
      }
      return true;
    }),
  );
});

test('PBT invariant: scrolling and spawning keep exact spacing and a bounded wall count (FR-3.5, NFR-2.4)', () => {
  fc.assert(
    fc.property(fc.array(fc.double({ min: 0, max: 20, noNaN: true }), { maxLength: 300 }), (moves) => {
      let pairs = [];
      let id = 1;
      const maxOnScreen = Math.ceil((cfg.width + cfg.walls.capWidth) / cfg.walls.spacing) + 1;
      for (const dx of moves) {
        pairs = walls.advance(pairs, dx, cfg);
        let x = walls.nextSpawnX(pairs, cfg);
        while (x !== null) {
          pairs.push(walls.createPair(id++, x, 275, 150));
          x = walls.nextSpawnX(pairs, cfg);
        }
        for (let i = 1; i < pairs.length; i++) {
          if (Math.abs(pairs[i].x - pairs[i - 1].x - cfg.walls.spacing) > 1e-6) return false;
        }
        if (pairs.length > maxOnScreen) return false;
      }
      return true;
    }),
  );
});
