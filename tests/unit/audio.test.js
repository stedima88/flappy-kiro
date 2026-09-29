'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAudio } = require('../../src/audio.js');

const sources = { jump: 'jump.wav', gameOver: 'game_over.wav' };

function fakeAudioCtor(log, { failPlay = false } = {}) {
  return class FakeAudio {
    constructor(src) {
      this.src = src;
      this.listeners = {};
    }
    addEventListener(type, fn) {
      this.listeners[type] = fn;
    }
    play() {
      if (failPlay) return Promise.reject(new Error('NotAllowedError'));
      log.push(this.src);
      return Promise.resolve();
    }
  };
}

test('plays the right sound for each effect (FR-9.1, FR-9.2)', () => {
  const log = [];
  const sfx = createAudio({ sources, AudioCtor: fakeAudioCtor(log) });
  sfx.play('jump');
  sfx.play('gameOver');
  assert.deepEqual(log, ['jump.wav', 'game_over.wav']);
});

test('mute silences all sounds (FR-9.3)', () => {
  const log = [];
  const sfx = createAudio({ sources, AudioCtor: fakeAudioCtor(log), muted: true });
  sfx.play('jump');
  sfx.setMuted(false);
  sfx.play('jump');
  assert.deepEqual(log, ['jump.wav']);
});

test('missing Audio support or blocked playback never throws (NFR-6.2)', async () => {
  assert.doesNotThrow(() => createAudio({ sources, AudioCtor: undefined }).play('jump'));
  const sfx = createAudio({ sources, AudioCtor: fakeAudioCtor([], { failPlay: true }) });
  assert.doesNotThrow(() => sfx.play('jump'));
  await new Promise((r) => setImmediate(r)); // no unhandled rejection
});
