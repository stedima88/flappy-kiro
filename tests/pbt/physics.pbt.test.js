'use strict';
const { test } = require('node:test');
const { fc, cfg, ghostyY, velocity, ghostyAction, frameDt } = require('./arbitraries.js');
const physics = require('../../src/physics.js');

test('PBT invariant: the ceiling always holds and fall speed stays capped (FR-1.5, NFR-2.3)', () => {
  fc.assert(
    fc.property(ghostyY, velocity, fc.array(ghostyAction, { maxLength: 200 }), (y, vy, actions) => {
      let g = { x: cfg.ghosty.x, y, vy };
      for (const a of actions) {
        g = a.kind === 'flap' ? physics.flap(g, cfg) : physics.step(g, physics.clampDt(a.dt, cfg.maxFrameDt), cfg);
        if (g.y < cfg.ghosty.hitRadius) return false;
        if (a.kind === 'step' && g.vy > cfg.maxFallSpeed) return false;
      }
      return true;
    }),
  );
});

test('PBT invariant: a flap always sets exactly the flap velocity (FR-1.4)', () => {
  fc.assert(
    fc.property(ghostyY, velocity, (y, vy) => physics.flap({ x: 0, y, vy }, cfg).vy === cfg.flapVelocity),
  );
});

test('PBT range: clampDt is always within [0, maxFrameDt] (NFR-2.3)', () => {
  fc.assert(
    fc.property(fc.oneof(frameDt, fc.double()), (dt) => {
      const c = physics.clampDt(dt, cfg.maxFrameDt);
      return c >= 0 && c <= cfg.maxFrameDt;
    }),
  );
});
