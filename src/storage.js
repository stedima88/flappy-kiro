// High score and settings persistence with an in-memory fallback (FR-5, FR-12, NFR-6.3).
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});

  const MOTIONS = ['full', 'reduced'];

  function parseHighScore(raw) {
    if (typeof raw !== 'string') return 0;
    const s = raw.trim();
    if (!/^\d+$/.test(s)) return 0;
    const n = Number(s);
    return Number.isSafeInteger(n) ? n : 0;
  }

  function serializeHighScore(n) {
    return String(Math.max(0, Math.floor(n)));
  }

  function parseSettings(raw, defaults) {
    let obj = null;
    try {
      obj = typeof raw === 'string' ? JSON.parse(raw) : null;
    } catch (e) {
      obj = null;
    }
    if (!obj || typeof obj !== 'object') obj = {};
    return {
      muted: typeof obj.muted === 'boolean' ? obj.muted : defaults.muted,
      motion: MOTIONS.includes(obj.motion) ? obj.motion : defaults.motion,
    };
  }

  function serializeSettings(settings) {
    return JSON.stringify({ muted: settings.muted, motion: settings.motion });
  }

  // getBackend returns a Storage-like object; it may throw (blocked storage) or return null.
  function createStore(getBackend) {
    let backend = null;
    try {
      backend = getBackend ? getBackend() : null;
      if (backend) {
        const probe = '__flappyKiroProbe__';
        backend.setItem(probe, '1');
        backend.removeItem(probe);
      }
    } catch (e) {
      backend = null;
    }
    const memory = new Map();
    return {
      persistent: backend !== null,
      get(key) {
        if (backend) {
          try {
            return backend.getItem(key);
          } catch (e) {
            // fall through to memory
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      set(key, value) {
        memory.set(key, value);
        if (backend) {
          try {
            backend.setItem(key, value);
          } catch (e) {
            // quota or blocked: the in-memory value is used for this session
          }
        }
      },
    };
  }

  const api = { parseHighScore, serializeHighScore, parseSettings, serializeSettings, createStore, MOTIONS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else FK.storage = api;
})(typeof window !== 'undefined' ? window : globalThis);
