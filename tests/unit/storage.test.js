'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const storage = require('../../src/storage.js');

const defaults = { muted: false, motion: 'full' };

function fakeBackend() {
  const data = new Map();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}

test('high score parses valid values (FR-5.1)', () => {
  assert.equal(storage.parseHighScore('42'), 42);
  assert.equal(storage.parseHighScore(' 7 '), 7);
});

test('missing or corrupted high score counts as 0 (FR-5.3)', () => {
  for (const raw of [null, undefined, '', 'abc', '-3', '1.5', '1e3', '99999999999999999999', '{}']) {
    assert.equal(storage.parseHighScore(raw), 0, `raw=${raw}`);
  }
});

test('settings round-trip and fall back per field (FR-12, FR-9.3)', () => {
  const s = { muted: true, motion: 'reduced' };
  assert.deepEqual(storage.parseSettings(storage.serializeSettings(s), defaults), s);
  assert.deepEqual(storage.parseSettings('{"muted":"yes","motion":"fast"}', defaults), defaults);
  assert.deepEqual(storage.parseSettings('not json', defaults), defaults);
  assert.deepEqual(storage.parseSettings(null, { muted: false, motion: 'reduced' }), { muted: false, motion: 'reduced' });
});

test('store persists through a working backend', () => {
  const backend = fakeBackend();
  const store = storage.createStore(() => backend);
  assert.equal(store.persistent, true);
  store.set('k', '5');
  assert.equal(backend.data.get('k'), '5');
  assert.equal(store.get('k'), '5');
});

test('store falls back to memory when storage is blocked (NFR-6.3)', () => {
  const store = storage.createStore(() => {
    throw new Error('SecurityError');
  });
  assert.equal(store.persistent, false);
  assert.equal(store.get('k'), null);
  store.set('k', '9');
  assert.equal(store.get('k'), '9');
});

test('store keeps working when writes fail (quota exceeded)', () => {
  const backend = fakeBackend();
  const store = storage.createStore(() => backend);
  backend.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  backend.getItem = () => {
    throw new Error('blocked');
  };
  assert.doesNotThrow(() => store.set('k', '3'));
  assert.equal(store.get('k'), '3');
});
