// Gradual difficulty with hard limits (FR-8).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  function speedFor(score, cfg) {
    const d = cfg.difficulty;
    return Math.min(d.baseSpeed + d.speedPerPoint * Math.max(0, score), d.maxSpeed);
  }

  function gapFor(score, cfg) {
    const d = cfg.difficulty;
    return Math.max(d.baseGap - d.gapPerPoint * Math.max(0, score), d.minGap);
  }

  const api = { speedFor, gapFor };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.difficulty = api;
})(typeof window !== 'undefined' ? window : globalThis);
