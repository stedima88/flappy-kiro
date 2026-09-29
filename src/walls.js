// Wall pairs: random-height gaps, fixed spacing, spawn/despawn (FR-3).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  function clamp(v, lo, hi) {
    return Math.min(Math.max(v, lo), hi);
  }

  // Allowed range for a gap centre so the whole gap stays inside the play area with margins.
  function gapBounds(gapSize, cfg) {
    const half = gapSize / 2;
    return {
      min: cfg.walls.gapMargin + half,
      max: cfg.playHeight - cfg.walls.gapMargin - half,
    };
  }

  function nextGapCenter(prevCenter, gapSize, rng, cfg) {
    const { min, max } = gapBounds(gapSize, cfg);
    if (prevCenter === null || prevCenter === undefined) return min + rng() * (max - min);
    const delta = (rng() * 2 - 1) * cfg.walls.maxGapDelta;
    return clamp(prevCenter + delta, min, max);
  }

  function createPair(id, x, gapCenter, gapSize) {
    return { id, x, gapCenter, gapSize, passed: false };
  }

  // Top body, top cap, bottom cap, bottom body. Caps are wider than the body, as drawn.
  function rectsFor(pair, cfg) {
    const w = cfg.walls;
    const gapTop = pair.gapCenter - pair.gapSize / 2;
    const gapBottom = pair.gapCenter + pair.gapSize / 2;
    const capX = pair.x - (w.capWidth - w.bodyWidth) / 2;
    return [
      { x: pair.x, y: 0, w: w.bodyWidth, h: gapTop - w.capHeight },
      { x: capX, y: gapTop - w.capHeight, w: w.capWidth, h: w.capHeight },
      { x: capX, y: gapBottom, w: w.capWidth, h: w.capHeight },
      { x: pair.x, y: gapBottom + w.capHeight, w: w.bodyWidth, h: cfg.playHeight - gapBottom - w.capHeight },
    ];
  }

  // Moves pairs left by dx and drops those fully off screen.
  function advance(pairs, dx, cfg) {
    const leftEdge = -(cfg.walls.capWidth - cfg.walls.bodyWidth) / 2;
    return pairs
      .map((p) => ({ ...p, x: p.x - dx }))
      .filter((p) => p.x + cfg.walls.capWidth + leftEdge > 0);
  }

  // Next spawn x, or null when no pair is due. Keeps the exact spacing between pairs.
  function nextSpawnX(pairs, cfg) {
    if (pairs.length === 0) return cfg.width;
    const last = pairs[pairs.length - 1];
    return last.x <= cfg.width - cfg.walls.spacing ? last.x + cfg.walls.spacing : null;
  }

  const api = { gapBounds, nextGapCenter, createPair, rectsFor, advance, nextSpawnX };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.walls = api;
})(typeof window !== 'undefined' ? window : globalThis);
