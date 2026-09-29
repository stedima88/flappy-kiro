// All player-facing text (English only for now, NFR-3.4).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  const strings = Object.freeze({
    title: 'Flappy Kiro',
    startPrompt: 'Press Space, click or tap to start',
    controls: 'Space / Click / Tap: flap  ·  P / Esc: pause  ·  M: mute  ·  S: settings',
    paused: 'Paused',
    resumePrompt: 'Press P or Esc to resume',
    resume: 'Resume',
    gameOver: 'Game Over',
    newHighScore: 'New high score!',
    restartPrompt: 'Press Space, click or tap to play again',
    backToStart: 'Esc: back to start',
    settings: 'Settings',
    soundOn: 'Sound: On',
    soundOff: 'Sound: Off',
    motionFull: 'Motion: Full',
    motionReduced: 'Motion: Reduced',
    resetHighScore: 'Reset high score',
    resetConfirm: 'Reset the high score to 0?',
    yes: 'Yes, reset',
    no: 'Cancel',
    close: 'Close',
    mute: 'Mute sound',
    unmute: 'Unmute sound',
    pause: 'Pause',
    error: 'Something went wrong. Reload the page to play again.',
    scoreBar: (score, high) => `Score: ${score} | High: ${high}`,
    finalScore: (score) => `Score: ${score}`,
    highScore: (high) => `High score: ${high}`,
  });

  if (typeof module === 'object' && module.exports) module.exports = strings;
  else FK.strings = strings;
})(typeof window !== 'undefined' ? window : globalThis);
