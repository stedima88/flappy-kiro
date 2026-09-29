// Flappy Kiro tuning constants (see aidlc-docs/construction/flappy-kiro/functional-design).
// Every script registers on window.FlappyKiro in the browser and on module.exports in Node,
// so the game runs from file:// without a build step and the logic is testable in Node.
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  const config = Object.freeze({
    width: 800,
    height: 600,
    playHeight: 550, // the ground/score bar fills the remaining 50 px

    ghosty: Object.freeze({
      x: 200,
      startY: 275,
      drawWidth: 40,
      drawHeight: 49,
      hitRadius: 16,
    }),

    gravity: 1500,
    flapVelocity: -450,
    maxFallSpeed: 700,
    maxFrameDt: 1 / 30,

    walls: Object.freeze({
      bodyWidth: 60,
      capWidth: 72,
      capHeight: 22,
      spacing: 260,
      gapMargin: 60,
      maxGapDelta: 150,
    }),

    difficulty: Object.freeze({
      baseSpeed: 180,
      speedPerPoint: 6,
      maxSpeed: 270,
      baseGap: 170,
      gapPerPoint: 2,
      minGap: 125,
    }),

    gameOverCooldown: 0.5,

    storageKeys: Object.freeze({
      highScore: 'flappyKiro.highScore',
      settings: 'flappyKiro.settings',
    }),
  });

  if (typeof module === 'object' && module.exports) module.exports = config;
  else FK.config = config;
})(typeof window !== 'undefined' ? window : globalThis);
