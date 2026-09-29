// Sound effects through HTMLAudioElement so they work from file:// (FR-9, NFR-6.2, L-1).
// A missing or blocked sound never throws. The game just stays silent.
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  function createSound(src, poolSize, AudioCtor) {
    const pool = [];
    let available = typeof AudioCtor === 'function';
    let next = 0;
    if (available) {
      try {
        for (let i = 0; i < poolSize; i++) {
          const el = new AudioCtor(src);
          el.preload = 'auto';
          el.addEventListener('error', () => {
            available = false;
          });
          pool.push(el);
        }
      } catch (e) {
        available = false;
      }
    }
    return {
      play() {
        if (!available || pool.length === 0) return;
        const el = pool[next];
        next = (next + 1) % pool.length; // lets quick flaps overlap instead of cutting each other off
        try {
          el.currentTime = 0;
          const p = el.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (e) {
          // autoplay blocked or decoding failed: ignore
        }
      },
    };
  }

  function createAudio({ sources, muted = false, AudioCtor = root.Audio }) {
    const sounds = {
      jump: createSound(sources.jump, 3, AudioCtor),
      gameOver: createSound(sources.gameOver, 1, AudioCtor),
    };
    let isMuted = muted;
    return {
      play(name) {
        if (!isMuted && sounds[name]) sounds[name].play();
      },
      setMuted(value) {
        isMuted = Boolean(value);
      },
      get muted() {
        return isMuted;
      },
    };
  }

  const api = { createAudio };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.audio = api;
})(typeof window !== 'undefined' ? window : globalThis);
