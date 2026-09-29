'use strict';
const { test } = require('node:test');
const { fc, settings } = require('./arbitraries.js');
const storage = require('../../src/storage.js');

const defaults = { muted: false, motion: 'full' };

test('PBT round-trip: settings survive serialize then parse (FR-12, PBT-02)', () => {
  fc.assert(
    fc.property(settings, (s) => {
      const back = storage.parseSettings(storage.serializeSettings(s), defaults);
      return back.muted === s.muted && back.motion === s.motion;
    }),
  );
});

test('PBT round-trip: high score survives serialize then parse (FR-5.1, PBT-02)', () => {
  fc.assert(
    fc.property(fc.maxSafeNat(), (n) => storage.parseHighScore(storage.serializeHighScore(n)) === n),
  );
});

test('PBT invariant: any stored high score parses to a non-negative safe integer (FR-5.3)', () => {
  fc.assert(
    fc.property(fc.oneof(fc.string(), fc.constant(null), fc.integer().map(String), fc.double().map(String)), (raw) => {
      const n = storage.parseHighScore(raw);
      return Number.isSafeInteger(n) && n >= 0;
    }),
  );
});

test('PBT invariant: any stored settings text parses to valid settings (FR-12.6)', () => {
  fc.assert(
    fc.property(fc.oneof(fc.string(), fc.json(), fc.constant(null)), (raw) => {
      const s = storage.parseSettings(raw, defaults);
      return typeof s.muted === 'boolean' && storage.MOTIONS.includes(s.motion);
    }),
  );
});
