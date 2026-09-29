// Game model: state machine (FR-7) plus one simulation step. Pure logic, no DOM.
// dispatch() and update() change the game in place and return a list of effects
// (sounds, saves) for the browser adapters to carry out.
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});
  const isNode = typeof module === 'object' && module.exports;
  const dep = (name) => (isNode ? require('./' + name + '.js') : FK[name]);
  const physics = dep('physics');
  const difficulty = dep('difficulty');
  const walls = dep('walls');
  const collision = dep('collision');
  const scoring = dep('scoring');

  const STATES = Object.freeze({
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    SETTINGS: 'SETTINGS',
  });

  const EVENTS = Object.freeze({
    FLAP: 'FLAP',
    PAUSE: 'PAUSE',
    ESC: 'ESC',
    HIDDEN: 'HIDDEN',
    OPEN_SETTINGS: 'OPEN_SETTINGS',
    CLOSE_SETTINGS: 'CLOSE_SETTINGS',
    RESET_HIGH_SCORE: 'RESET_HIGH_SCORE',
  });

  function createGame({ cfg, rng, highScore = 0 }) {
    const game = {
      cfg,
      rng,
      state: STATES.START,
      returnTo: null,
      stateTime: 0,
      time: 0,
      highScore,
      newHigh: false,
    };
    resetRun(game);
    return game;
  }

  function resetRun(game) {
    const g = game.cfg.ghosty;
    game.ghosty = { x: g.x, y: g.startY, vy: 0 };
    game.pairs = [];
    game.score = 0;
    game.newHigh = false;
    game.lastGapCenter = null;
    game.nextPairId = 1;
  }

  function setState(game, state) {
    game.state = state;
    game.stateTime = 0;
  }

  function doFlap(game, effects) {
    game.ghosty = physics.flap(game.ghosty, game.cfg);
    effects.push({ type: 'sound', name: 'jump' });
  }

  function startRun(game, effects) {
    resetRun(game);
    setState(game, STATES.PLAYING);
    doFlap(game, effects);
  }

  function endRun(game, effects) {
    setState(game, STATES.GAME_OVER);
    effects.push({ type: 'sound', name: 'gameOver' });
    if (game.score > game.highScore) {
      game.highScore = game.score;
      game.newHigh = true;
      effects.push({ type: 'saveHighScore', value: game.highScore });
    }
  }

  function dispatch(game, event) {
    const effects = [];
    const S = STATES;
    const E = EVENTS;
    switch (game.state) {
      case S.START:
        if (event === E.FLAP) startRun(game, effects);
        else if (event === E.OPEN_SETTINGS) {
          game.returnTo = S.START;
          setState(game, S.SETTINGS);
        }
        break;
      case S.PLAYING:
        if (event === E.FLAP) doFlap(game, effects);
        else if (event === E.PAUSE || event === E.ESC || event === E.HIDDEN) setState(game, S.PAUSED);
        break;
      case S.PAUSED:
        if (event === E.PAUSE || event === E.ESC) setState(game, S.PLAYING);
        else if (event === E.OPEN_SETTINGS) {
          game.returnTo = S.PAUSED;
          setState(game, S.SETTINGS);
        }
        break;
      case S.SETTINGS:
        if (event === E.CLOSE_SETTINGS || event === E.ESC) {
          setState(game, game.returnTo || S.START);
          game.returnTo = null;
        } else if (event === E.RESET_HIGH_SCORE) {
          game.highScore = 0;
          effects.push({ type: 'saveHighScore', value: 0 });
        }
        break;
      case S.GAME_OVER:
        if (event === E.FLAP && game.stateTime >= game.cfg.gameOverCooldown) startRun(game, effects);
        else if (event === E.ESC) {
          resetRun(game);
          setState(game, S.START);
        }
        break;
      default:
        break;
    }
    return effects;
  }

  function update(game, rawDt) {
    const effects = [];
    const cfg = game.cfg;
    const dt = physics.clampDt(rawDt, cfg.maxFrameDt);
    game.time += dt;
    // Screen timers (the restart cooldown) use real elapsed time, so a slow device doesn't
    // stretch them. Only the simulation uses the capped dt.
    game.stateTime += Number.isFinite(rawDt) && rawDt > 0 ? rawDt : 0;
    if (game.state !== STATES.PLAYING) return effects;

    game.ghosty = physics.step(game.ghosty, dt, cfg);
    game.pairs = walls.advance(game.pairs, difficulty.speedFor(game.score, cfg) * dt, cfg);

    let spawnX = walls.nextSpawnX(game.pairs, cfg);
    while (spawnX !== null) {
      const gap = difficulty.gapFor(game.score, cfg);
      const center = walls.nextGapCenter(game.lastGapCenter, gap, game.rng, cfg);
      game.pairs.push(walls.createPair(game.nextPairId++, spawnX, center, gap));
      game.lastGapCenter = center;
      spawnX = walls.nextSpawnX(game.pairs, cfg);
    }

    const crashed =
      physics.hitsGround(game.ghosty, cfg) || game.pairs.some((p) => collision.hitsPair(game.ghosty, p, cfg));
    if (crashed) {
      endRun(game, effects);
      return effects;
    }

    const scored = scoring.scorePairs(game.pairs, game.ghosty.x, cfg);
    game.pairs = scored.pairs;
    if (scored.gained > 0) {
      game.score += scored.gained;
      effects.push({ type: 'scored', value: game.score });
    }
    return effects;
  }

  const api = { STATES, EVENTS, createGame, dispatch, update };
  if (isNode) module.exports = api;
  else FK.game = api;
})(typeof window !== 'undefined' ? window : globalThis);
