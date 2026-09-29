// Ghosty's vertical motion: gravity, flap, fall-speed cap and the ceiling (FR-1.3..FR-1.5).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  function clampDt(dt, maxDt) {
    if (!Number.isFinite(dt) || dt <= 0) return 0;
    return Math.min(dt, maxDt);
  }

  function flap(ghosty, cfg) {
    return { ...ghosty, vy: cfg.flapVelocity };
  }

  function step(ghosty, dt, cfg) {
    const vy = Math.min(ghosty.vy + cfg.gravity * dt, cfg.maxFallSpeed);
    // Average of old and new velocity: exact under constant gravity, so the flight path
    // is the same at 60 Hz and 144 Hz (NFR-2.2).
    const y = ghosty.y + ((ghosty.vy + vy) / 2) * dt;
    const r = cfg.ghosty.hitRadius;
    if (y - r < 0) {
      // The ceiling holds Ghosty in place instead of ending the game.
      return { ...ghosty, y: r, vy: Math.max(vy, 0) };
    }
    return { ...ghosty, y, vy };
  }

  function hitsGround(ghosty, cfg) {
    return ghosty.y + cfg.ghosty.hitRadius >= cfg.playHeight;
  }

  const api = { clampDt, flap, step, hitsGround };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.physics = api;
})(typeof window !== 'undefined' ? window : globalThis);
