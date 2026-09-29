'use strict';
// Shared fast-check setup and domain generators (PBT-07, PBT-08).
// Replay a failure with FC_SEED=<seed> npm run test:unit. The seed is printed on every run.
const fc = require('fast-check');
const cfg = require('../../src/config.js');
const G = require('../../src/game.js');

const seed = process.env.FC_SEED ? Number(process.env.FC_SEED) : Date.now() % 2147483647;
if (!globalThis.__fkSeedLogged) {
  globalThis.__fkSeedLogged = true;
  console.log(`[fast-check] seed=${seed} (set FC_SEED=${seed} to replay)`);
}
// baseSize 'large' so generated command/move lists are long enough to reach deep game states.
fc.configureGlobal({ seed, numRuns: Number(process.env.FC_RUNS || 200), baseSize: 'large' });

const score = fc.integer({ min: 0, max: 500 });
const gapSize = fc.integer({ min: cfg.difficulty.minGap, max: cfg.difficulty.baseGap });
// A random() stand-in: a list of values in [0, 1), cycled.
const rngValues = fc.array(fc.double({ min: 0, max: 1, maxExcluded: true, noNaN: true }), { minLength: 1, maxLength: 50 });
const makeRng = (values) => {
  let i = 0;
  return () => values[i++ % values.length];
};
const ghostyY = fc.double({ min: cfg.ghosty.hitRadius, max: cfg.playHeight, noNaN: true });
const velocity = fc.double({ min: -1000, max: cfg.maxFallSpeed, noNaN: true });
const frameDt = fc.oneof(
  fc.constant(0),
  fc.constant(cfg.maxFrameDt),
  fc.double({ min: 0, max: 0.5, noNaN: true }),
);
const ghostyAction = fc.oneof(
  fc.record({ kind: fc.constant('step'), dt: frameDt }),
  fc.record({ kind: fc.constant('flap') }),
);
const settings = fc.record({ muted: fc.boolean(), motion: fc.constantFrom('full', 'reduced') });
const pair = fc
  .record({
    id: fc.nat(),
    x: fc.double({ min: -100, max: cfg.width, noNaN: true }),
    gapSize,
    t: fc.double({ min: 0, max: 1, noNaN: true }),
    passed: fc.boolean(),
  })
  .map(({ id, x, gapSize: gs, t, passed }) => {
    const min = cfg.walls.gapMargin + gs / 2;
    const max = cfg.playHeight - cfg.walls.gapMargin - gs / 2;
    return { id, x, gapSize: gs, gapCenter: min + t * (max - min), passed };
  });
const rect = fc
  .record({
    x: fc.integer({ min: 0, max: 700 }),
    y: fc.integer({ min: 0, max: 500 }),
    w: fc.integer({ min: 1, max: 200 }),
    h: fc.integer({ min: 1, max: 200 }),
  });
// Game commands, with time steps weighted so runs actually progress.
const gameCommand = fc.oneof(
  { weight: 5, arbitrary: fc.record({ kind: fc.constant('tick'), dt: fc.constantFrom(1 / 60, 1 / 30, 0.1) }) },
  { weight: 3, arbitrary: fc.record({ kind: fc.constant('event'), event: fc.constant(G.EVENTS.FLAP) }) },
  { weight: 1, arbitrary: fc.record({ kind: fc.constant('event'), event: fc.constantFrom(...Object.values(G.EVENTS)) }) },
  // steer Ghosty toward the next gap for a while, so runs score points and set high scores
  { weight: 2, arbitrary: fc.record({ kind: fc.constant('pilot'), frames: fc.integer({ min: 30, max: 600 }) }) },
);

// Simple autopilot used by the stateful test: flap when Ghosty is about to drop below the gap.
function pilotStep(game) {
  const next = game.pairs.find((p) => p.x + cfg.walls.capWidth > game.ghosty.x - cfg.ghosty.hitRadius);
  const target = next ? next.gapCenter + next.gapSize * 0.3 : cfg.ghosty.startY;
  const predicted = game.ghosty.y + game.ghosty.vy * 0.05;
  return predicted > target;
}

module.exports = { pilotStep, fc, cfg, score, gapSize, rngValues, makeRng, ghostyY, velocity, frameDt, ghostyAction, settings, pair, rect, gameCommand };
