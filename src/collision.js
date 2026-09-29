// Circle (Ghosty's hitbox) vs rectangle intersection (FR-6).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});
  const isNode = typeof module === 'object' && module.exports;
  const walls = isNode ? require('./walls.js') : FK.walls;

  function circleIntersectsRect(cx, cy, r, rect) {
    if (rect.w <= 0 || rect.h <= 0) return false;
    const nx = Math.min(Math.max(cx, rect.x), rect.x + rect.w);
    const ny = Math.min(Math.max(cy, rect.y), rect.y + rect.h);
    const dx = cx - nx;
    const dy = cy - ny;
    return dx * dx + dy * dy < r * r;
  }

  function hitsPair(ghosty, pair, cfg) {
    const r = cfg.ghosty.hitRadius;
    return walls.rectsFor(pair, cfg).some((rect) => circleIntersectsRect(ghosty.x, ghosty.y, r, rect));
  }

  const api = { circleIntersectsRect, hitsPair };
  if (isNode) module.exports = api;
  else FK.collision = api;
})(typeof window !== 'undefined' ? window : globalThis);
