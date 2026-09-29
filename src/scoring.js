// +1 per pair, counted once, when Ghosty passes its trailing edge (FR-4.1).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  function scorePairs(pairs, ghostyX, cfg) {
    let gained = 0;
    const next = pairs.map((p) => {
      if (!p.passed && ghostyX > p.x + cfg.walls.bodyWidth) {
        gained += 1;
        return { ...p, passed: true };
      }
      return p;
    });
    return { pairs: next, gained };
  }

  const api = { scorePairs };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.scoring = api;
})(typeof window !== 'undefined' ? window : globalThis);
