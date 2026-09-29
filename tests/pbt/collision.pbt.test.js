'use strict';
const { test } = require('node:test');
const { fc, rect } = require('./arbitraries.js');
const { circleIntersectsRect } = require('../../src/collision.js');

// Reference: brute-force distance from the centre to a dense grid of points over the rectangle.
function oracleDistance(cx, cy, r) {
  let best = Infinity;
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const px = r.x + (r.w * i) / steps;
      const py = r.y + (r.h * j) / steps;
      best = Math.min(best, Math.hypot(cx - px, cy - py));
    }
  }
  return best;
}

test('PBT oracle: circle-rectangle collision matches a brute-force distance check (FR-6)', () => {
  fc.assert(
    fc.property(
      rect,
      fc.integer({ min: -100, max: 900 }),
      fc.integer({ min: -100, max: 700 }),
      fc.integer({ min: 4, max: 40 }),
      (r, cx, cy, radius) => {
        const d = oracleDistance(cx, cy, r);
        const grid = Math.hypot(r.w, r.h) / 60; // how coarse the reference grid is
        fc.pre(Math.abs(d - radius) > grid + 1); // skip cases too close to the edge to judge
        return circleIntersectsRect(cx, cy, radius, r) === d < radius;
      },
    ),
    { numRuns: 150 },
  );
});
