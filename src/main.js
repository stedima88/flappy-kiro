// Browser entry point: wires the game model to the canvas, DOM overlays, input, audio and storage.
(function (root) {
  'use strict';
  const FK = root.FlappyKiro;
  const { config: cfg, strings, storage, audio: audioLib, renderer: rendererLib, input, game: G } = FK;
  const { STATES, EVENTS } = G;
  const doc = root.document;

  // SECURITY-15: last-resort handlers. Details go to the console only; players only ever
  // see the generic error overlay (SECURITY-09).
  root.addEventListener('error', (e) => console.error('Flappy Kiro unhandled error:', e.error || e.message));
  root.addEventListener('unhandledrejection', (e) => {
    console.error('Flappy Kiro unhandled promise rejection:', e.reason);
    e.preventDefault();
  });

  const $ = (id) => doc.getElementById(id);
  const stage = $('stage');
  const canvas = $('game-canvas');
  const ui = {
    start: $('screen-start'),
    startHigh: $('start-high'),
    pause: $('screen-pause'),
    gameOver: $('screen-gameover'),
    finalScore: $('gameover-score'),
    finalHigh: $('gameover-high'),
    newHigh: $('gameover-new-high'),
    settings: $('screen-settings'),
    settingsMain: $('settings-main'),
    settingsConfirm: $('settings-confirm'),
    soundToggle: $('settings-sound'),
    motionToggle: $('settings-motion'),
    error: $('screen-error'),
    hudPause: $('hud-pause'),
    hudMute: $('hud-mute'),
  };

  // Static text comes from strings.js (NFR-3.4).
  doc.querySelectorAll('[data-text]').forEach((el) => {
    el.textContent = strings[el.dataset.text];
  });
  ui.hudPause.setAttribute('aria-label', strings.pause);

  // --- Persistence (FR-5, FR-12, NFR-6.3) ---
  const store = storage.createStore(() => root.localStorage);
  const prefersReduced = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const settings = storage.parseSettings(store.get(cfg.storageKeys.settings), {
    muted: false,
    motion: prefersReduced ? 'reduced' : 'full',
  });
  const saveSettings = () => store.set(cfg.storageKeys.settings, storage.serializeSettings(settings));

  const game = G.createGame({
    cfg,
    rng: FK.rng.createRng((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0),
    highScore: storage.parseHighScore(store.get(cfg.storageKeys.highScore)),
  });

  const sfx = audioLib.createAudio({
    sources: { jump: 'assets/jump.wav', gameOver: 'assets/game_over.wav' },
    muted: settings.muted,
  });

  // Ghosty sprite, with a drawn fallback if it can't be loaded (NFR-6.1).
  const ghostyImage = { image: new root.Image(), ready: false };
  ghostyImage.image.onload = () => {
    ghostyImage.ready = true;
  };
  ghostyImage.image.onerror = () => {
    ghostyImage.ready = false;
    console.warn('Flappy Kiro: assets/ghosty.png failed to load, using the fallback shape.');
  };
  ghostyImage.image.src = 'assets/ghosty.png';

  const renderer = rendererLib.createRenderer({ canvas, cfg, doc, ghostyImage });

  // --- UI state and effects ---
  let confirmingReset = false;
  let lastUiKey = '';

  function applyEffects(effects) {
    for (const fx of effects) {
      if (fx.type === 'sound') sfx.play(fx.name);
      else if (fx.type === 'saveHighScore') store.set(cfg.storageKeys.highScore, storage.serializeHighScore(fx.value));
    }
  }

  function send(event) {
    applyEffects(G.dispatch(game, event));
    syncUi();
  }

  function menuButtons() {
    const panel = confirmingReset ? ui.settingsConfirm : ui.settingsMain;
    return Array.from(panel.querySelectorAll('button'));
  }

  function syncUi() {
    const s = game.state;
    const key = [s, game.score, game.highScore, game.newHigh, settings.muted, settings.motion, confirmingReset].join('|');
    if (key === lastUiKey) return;
    const prevState = lastUiKey.split('|')[0];
    const prevConfirm = lastUiKey.split('|')[6];
    lastUiKey = key;

    stage.dataset.state = s;
    stage.dataset.score = String(game.score);
    stage.dataset.highScore = String(game.highScore);
    stage.dataset.muted = String(settings.muted);
    stage.dataset.motion = settings.motion;

    ui.start.hidden = s !== STATES.START;
    ui.pause.hidden = s !== STATES.PAUSED;
    ui.gameOver.hidden = s !== STATES.GAME_OVER;
    ui.settings.hidden = s !== STATES.SETTINGS;
    ui.hudPause.hidden = s !== STATES.PLAYING;

    ui.startHigh.textContent = strings.highScore(game.highScore);
    ui.finalScore.textContent = strings.finalScore(game.score);
    ui.finalHigh.textContent = strings.highScore(game.highScore);
    ui.newHigh.hidden = !game.newHigh;

    ui.soundToggle.textContent = settings.muted ? strings.soundOff : strings.soundOn;
    ui.soundToggle.setAttribute('aria-pressed', String(!settings.muted));
    ui.motionToggle.textContent = settings.motion === 'reduced' ? strings.motionReduced : strings.motionFull;
    ui.hudMute.textContent = settings.muted ? '🔇' : '🔊';
    ui.hudMute.setAttribute('aria-label', settings.muted ? strings.unmute : strings.mute);

    ui.settingsMain.hidden = confirmingReset;
    ui.settingsConfirm.hidden = !confirmingReset;

    // Move focus into the menu when it opens or switches panels, and out of it when it closes.
    if (s === STATES.SETTINGS && (prevState !== s || prevConfirm !== String(confirmingReset))) {
      menuButtons()[0].focus();
    } else if (s !== STATES.SETTINGS && prevState === STATES.SETTINGS && doc.activeElement) {
      doc.activeElement.blur();
    }
  }

  function toggleMute() {
    settings.muted = !settings.muted;
    sfx.setMuted(settings.muted);
    saveSettings();
    syncUi();
  }

  function toggleMotion() {
    settings.motion = settings.motion === 'reduced' ? 'full' : 'reduced';
    saveSettings();
    syncUi();
  }

  function onEsc() {
    if (game.state === STATES.SETTINGS && confirmingReset) {
      confirmingReset = false;
      syncUi();
      return;
    }
    send(EVENTS.ESC);
  }

  function closeSettings() {
    confirmingReset = false;
    send(EVENTS.CLOSE_SETTINGS);
  }

  input.attachInput(stage, doc, {
    flap: () => send(EVENTS.FLAP),
    pause: () => send(EVENTS.PAUSE),
    esc: onEsc,
    mute: toggleMute,
    settings: () => {
      if (game.state === STATES.SETTINGS) closeSettings();
      else send(EVENTS.OPEN_SETTINGS);
    },
    menuMove: (delta) => {
      const buttons = menuButtons();
      const i = buttons.indexOf(doc.activeElement);
      buttons[(i + delta + buttons.length) % buttons.length].focus();
    },
    isMenuOpen: () => game.state === STATES.SETTINGS,
  });

  const click = (el, fn) => el.addEventListener('click', fn);
  click($('start-settings'), () => send(EVENTS.OPEN_SETTINGS));
  click($('pause-resume'), () => send(EVENTS.PAUSE));
  click($('pause-settings'), () => send(EVENTS.OPEN_SETTINGS));
  click(ui.hudPause, () => send(EVENTS.PAUSE));
  click(ui.hudMute, toggleMute);
  click(ui.soundToggle, toggleMute);
  click(ui.motionToggle, toggleMotion);
  click($('settings-reset'), () => {
    confirmingReset = true;
    syncUi();
  });
  click($('settings-reset-yes'), () => {
    confirmingReset = false;
    send(EVENTS.RESET_HIGH_SCORE);
  });
  click($('settings-reset-no'), () => {
    confirmingReset = false;
    syncUi();
  });
  click($('settings-close'), closeSettings);

  // Auto-pause when the tab is hidden (NFR-6.4).
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) send(EVENTS.HIDDEN);
  });

  // --- Scaling: fit the window, keep the aspect ratio, stay sharp on high-DPI (FR-11) ---
  function fit() {
    const scale = Math.min(root.innerWidth / cfg.width, root.innerHeight / cfg.height);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    renderer.resize(scale * (root.devicePixelRatio || 1));
  }
  root.addEventListener('resize', fit);
  root.addEventListener('orientationchange', fit);
  fit();

  // --- Main loop with an error guard (NFR-2, NFR-6.5) ---
  let last = null;
  let consecutiveErrors = 0;
  function frame(ts) {
    const dt = last === null ? 0 : (ts - last) / 1000;
    last = ts;
    try {
      applyEffects(G.update(game, dt));
      renderer.draw(game, Math.min(dt, cfg.maxFrameDt), { reducedMotion: settings.motion === 'reduced' });
      syncUi();
      consecutiveErrors = 0;
    } catch (err) {
      consecutiveErrors += 1;
      console.error('Flappy Kiro frame error:', err);
      if (consecutiveErrors >= 3) {
        ui.error.hidden = false;
        stage.dataset.state = 'ERROR';
        return; // stop the loop and show the error instead of freezing silently
      }
    }
    root.requestAnimationFrame(frame);
  }
  syncUi();
  root.requestAnimationFrame(frame);

  // Debugging handle used by the E2E tests. It can change the game state, which is acceptable:
  // this is a single-player local game, so there is no trust boundary to protect.
  FK.app = { game, settings };
})(window);
