'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fc, cfg, gameCommand, pilotStep } = require('./arbitraries.js');
const { createRng } = require('../../src/rng.js');
const G = require('../../src/game.js');

const { STATES: S, EVENTS: E } = G;

// Simplified model of the state machine (functional-design section 3).
// Collisions are internal to update(), so the model follows the real game on ticks.
function modelDispatch(m, event, cooldownDone) {
  switch (m.state) {
    case S.START:
      if (event === E.FLAP) return { ...m, state: S.PLAYING };
      if (event === E.OPEN_SETTINGS) return { state: S.SETTINGS, returnTo: S.START };
      return m;
    case S.PLAYING:
      if (event === E.PAUSE || event === E.ESC || event === E.HIDDEN) return { ...m, state: S.PAUSED };
      return m;
    case S.PAUSED:
      if (event === E.PAUSE || event === E.ESC) return { ...m, state: S.PLAYING };
      if (event === E.OPEN_SETTINGS) return { state: S.SETTINGS, returnTo: S.PAUSED };
      return m;
    case S.SETTINGS:
      if (event === E.CLOSE_SETTINGS || event === E.ESC) return { state: m.returnTo, returnTo: null };
      return m;
    case S.GAME_OVER:
      if (event === E.FLAP && cooldownDone) return { ...m, state: S.PLAYING };
      if (event === E.ESC) return { ...m, state: S.START };
      return m;
    default:
      return m;
  }
}

test('PBT stateful: the game follows the state-machine model and keeps its score rules (FR-7, FR-4, FR-5)', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), fc.nat({ max: 50 }), fc.array(gameCommand, { minLength: 20, maxLength: 200 }), (seed, high, commands) => {
      const game = G.createGame({ cfg, rng: createRng(seed), highScore: high });
      let model = { state: S.START, returnTo: null };
      let prevScore = 0;
      let prevHigh = high;
      const check = (step) => {
        assert.equal(game.state, model.state, `state differs from model at step ${step}`);
        assert.ok(game.score >= prevScore, `score decreased within a run at step ${step}`);
        assert.ok(game.highScore >= prevHigh, `high score dropped without a reset at step ${step}`);
        if (game.state === S.GAME_OVER) assert.ok(game.highScore >= game.score, `high score below final score at step ${step}`);
        assert.ok(game.ghosty.y >= cfg.ghosty.hitRadius, `Ghosty above the ceiling at step ${step}`);
        prevScore = game.score;
        prevHigh = game.highScore;
      };
      commands.forEach((cmd, step) => {
        if (cmd.kind === 'event') {
          const before = game.state;
          const cooldownDone = game.stateTime >= cfg.gameOverCooldown;
          G.dispatch(game, cmd.event);
          model = modelDispatch(model, cmd.event, cooldownDone);
          // a new run, or going back to the start screen, resets the score by design
          if (game.state === S.PLAYING && (before === S.START || before === S.GAME_OVER)) prevScore = 0;
          if (game.state === S.START && before === S.GAME_OVER) prevScore = 0;
          if (cmd.event === E.RESET_HIGH_SCORE && before === S.SETTINGS) prevHigh = 0;
        } else if (cmd.kind === 'pilot') {
          for (let f = 0; f < cmd.frames && game.state === S.PLAYING; f++) {
            if (pilotStep(game)) G.dispatch(game, E.FLAP);
            G.update(game, 1 / 60);
            if (game.state === S.GAME_OVER) model = { ...model, state: S.GAME_OVER };
            check(step);
          }
        } else {
          const wasPlaying = game.state === S.PLAYING;
          G.update(game, cmd.dt);
          if (wasPlaying && game.state === S.GAME_OVER) model = { ...model, state: S.GAME_OVER };
        }
        check(step); // invariants hold after every command
      });
    }),
    { numRuns: 60 },
  );
});
