// Seedable pseudo-random generator (mulberry32) so wall placement is reproducible in tests (NFR-4.2).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  function createRng(seed) {
    let a = seed >>> 0;
    return function next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const api = { createRng };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.rng = api;
})(typeof window !== 'undefined' ? window : globalThis);
