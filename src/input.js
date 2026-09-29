// Keyboard, mouse and touch input mapped to game intents (FR-2, FR-11.5, FR-12.5).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  // handlers: { flap, pause, esc, mute, settings, menuMove(delta), isMenuOpen() }
  function attachInput(stage, doc, handlers) {
    function onKeyDown(e) {
      const menu = handlers.isMenuOpen();
      if (e.code === 'Space') {
        if (menu) return; // the focused menu button handles Space itself
        e.preventDefault(); // no page scroll and no activation of a focused button
        if (e.repeat) return; // holding the key gives one flap per press (FR-2.2)
        if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
        handlers.flap();
        return;
      }
      if (e.repeat) return;
      switch (e.code) {
        case 'KeyP':
          handlers.pause();
          break;
        case 'Escape':
          e.preventDefault();
          handlers.esc();
          break;
        case 'KeyM':
          handlers.mute();
          break;
        case 'KeyS':
          handlers.settings();
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          if (menu) {
            e.preventDefault();
            handlers.menuMove(e.code === 'ArrowDown' ? 1 : -1);
          }
          break;
        default:
          break;
      }
    }

    function onKeyUp(e) {
      if (e.code === 'Space' && !handlers.isMenuOpen()) e.preventDefault();
    }

    function onPointerDown(e) {
      if (e.target.closest && e.target.closest('button')) return; // buttons do their own thing
      if (e.button !== undefined && e.button > 0) return; // left click, touch and pen only
      e.preventDefault();
      handlers.flap();
    }

    doc.addEventListener('keydown', onKeyDown);
    doc.addEventListener('keyup', onKeyUp);
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('contextmenu', (e) => e.preventDefault());
    // iOS Safari: stop double-tap zoom and scroll bounce on the game area.
    stage.addEventListener('touchstart', (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false });
    stage.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    doc.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  const api = { attachInput };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.input = api;
})(typeof window !== 'undefined' ? window : globalThis);
