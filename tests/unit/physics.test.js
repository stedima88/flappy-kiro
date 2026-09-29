'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cfg = require('../../src/config.js');
const physics = require('../../src/physics.js');

const at = (y, vy = 0) => ({ x: cfg.ghosty.x, y, vy });

test('gravity pulls Ghosty down (FR-1.3)', () => {
  const g = physics.step(at(200, 0), 0.1, cfg);
  assert.equal(g.vy, cfg.gravity * 0.1);
  assert.ok(g.y > 200);
});

test('flap replaces the vertical velocity (FR-1.4)', () => {
  assert.equal(physics.flap(at(200, 500), cfg).vy, cfg.flapVelocity);
  assert.equal(physics.flap(at(200, -100), cfg).vy, cfg.flapVelocity);
});

test('fall speed is capped (NFR-2.3)', () => {
  assert.equal(physics.step(at(100, cfg.maxFallSpeed), 0.03, cfg).vy, cfg.maxFallSpeed);
});

test('ceiling holds Ghosty at the top and stops upward motion (FR-1.5)', () => {
  const g = physics.step(at(cfg.ghosty.hitRadius + 1, -450), 1 / 30, cfg);
  assert.equal(g.y, cfg.ghosty.hitRadius);
  assert.equal(g.vy, 0);
});

test('touching the ground is detected (FR-6.2)', () => {
  assert.equal(physics.hitsGround(at(cfg.playHeight - cfg.ghosty.hitRadius), cfg), true);
  assert.equal(physics.hitsGround(at(cfg.playHeight - cfg.ghosty.hitRadius - 1), cfg), false);
});

test('clampDt caps long frames and rejects invalid values (NFR-2.3)', () => {
  assert.equal(physics.clampDt(1, cfg.maxFrameDt), cfg.maxFrameDt);
  assert.equal(physics.clampDt(0.01, cfg.maxFrameDt), 0.01);
  assert.equal(physics.clampDt(-1, cfg.maxFrameDt), 0);
  assert.equal(physics.clampDt(NaN, cfg.maxFrameDt), 0);
});

test('movement does not depend on the refresh rate: 60 Hz vs 144 Hz (NFR-2.2)', () => {
  const run = (hz) => {
    let g = at(100, cfg.flapVelocity);
    for (let i = 0; i < hz * 0.5; i++) g = physics.step(g, 1 / hz, cfg);
    return g.y;
  };
  assert.ok(Math.abs(run(60) - run(144)) < 0.5, `60Hz=${run(60)} 144Hz=${run(144)}`);
});
