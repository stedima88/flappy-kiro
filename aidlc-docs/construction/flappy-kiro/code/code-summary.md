# Code Summary — flappy-kiro

| File | Responsibility | Requirements |
|---|---|---|
| `index.html` | Page, canvas, DOM overlays (start, pause, game over, settings, error), HUD buttons with `data-testid`, classic scripts in order | FR-7, FR-12, NFR-1.4 |
| `styles.css` | Fixed 800x600 stage scaled to fit with letterboxing; touch/zoom/select prevention; overlay and button styles | FR-11, FR-11.5 |
| `src/config.js` | Tuning constants and storage keys | NFR-4.3 |
| `src/strings.js` | All English player-facing text | NFR-3.4 |
| `src/rng.js` | Seeded mulberry32 generator | NFR-4.2 |
| `src/physics.js` | Gravity, flap, fall cap, ceiling hold, ground check, dt clamp | FR-1, FR-6.2, NFR-2.3 |
| `src/difficulty.js` | Speed and gap by score, with limits | FR-8 |
| `src/walls.js` | Gap bounds, next gap centre with max delta, pair rectangles, advance/despawn, spawn spacing | FR-3 |
| `src/collision.js` | Circle-rectangle intersection, pair hit test | FR-6 |
| `src/scoring.js` | Once-per-pair scoring | FR-4.1 |
| `src/storage.js` | High score / settings parse and serialize, store with in-memory fallback | FR-5, FR-12, NFR-6.3 |
| `src/game.js` | State machine plus simulation step; returns effects | FR-6.5, FR-7, FR-12.2 |
| `src/audio.js` | HTMLAudioElement pool, mute, fails silently | FR-9, NFR-6.2 |
| `src/renderer.js` | Sketch sky, parallax clouds, pipes, Ghosty with tilt, bob and fallback shape, score bar with pop effect, reduced motion | FR-1.6, FR-10, FR-12.3, NFR-6.1 |
| `src/input.js` | Space (no repeat, no scroll), P/Esc/M/S, arrow keys in the menu, pointer/touch flap | FR-2, FR-11.5, FR-12.5 |
| `src/main.js` | Wiring, UI sync, settings actions, visibility auto-pause, fit/DPR, rAF loop with error guard | FR-11, NFR-6.4, NFR-6.5 |
| `tests/unit/*` | 46 example-based tests | NFR-5.1, PBT-10 |
| `tests/pbt/*` | 15 property tests, shared arbitraries, seed logging | NFR-5.2, PBT-02..08 |
| `tests/e2e/game.spec.js` | 12 Playwright tests over file:// (desktop + touch) | NFR-5.3 |

## Deviations and notes
- Difficulty limits were lowered from the first draft (max speed 300 to 270, max gap delta 180 to 150) after an autopilot simulation showed the hardest level was very tight. functional-design.md is updated.
- Two small additions beyond the requirements, for touch-only players: an on-screen pause button (❚❚), and Esc on Game Over returning to the Start screen.
- `window.FlappyKiro.app` is a read-only debugging handle. The E2E tests use it to set a score in the high-score test.
- Not covered by automated tests (manual play): the sprite fallback when `ghosty.png` fails to load, and audio actually coming out of the speakers.
