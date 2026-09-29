# Integration Test Instructions — Flappy Kiro

## Purpose
Flappy Kiro is a single unit with no services. Integration here means that the modules work together inside a real browser: logic, rendering, DOM overlays, input, storage and audio wiring. The end-to-end Playwright suite covers this. It loads `index.html` straight from disk, which also confirms the file:// requirement (NFR-1.4).

## Test Scenarios (tests/e2e/game.spec.js)
| # | Scenario | Requirements |
|---|---|---|
| 1 | Start screen shows title, high score and controls, with no console errors | FR-7.1 |
| 2 | Space starts, falling ends the game, Space restarts after the cooldown | FR-7, FR-6.5 |
| 3 | Mouse click starts and flaps | FR-2.1 |
| 4 | P / Esc / ❚❚ pause and resume | FR-7.3, FR-2.4 |
| 5 | Hidden tab pauses automatically | NFR-6.4 |
| 6 | New high score is saved and survives a reload | FR-5 |
| 7 | Corrupted stored high score shows 0 | FR-5.3 |
| 8 | Sound and motion settings are saved across a reload | FR-12.3, FR-12.4 |
| 9 | Reset high score: Cancel keeps it, confirming clears it, and the change persists | FR-12.2 |
| 10 | Settings menu works with the keyboard only; Space doesn't flap in the menu | FR-12.5 |
| 11 | Settings opened from pause return to pause | FR-12.1 |
| 12 | Touch device: a tap starts the game; the stage fits a 390 px wide screen at 4:3 | FR-2.1, FR-11.2 |

## Setup
No services to start. Only the Chromium build is needed: `npx playwright install chromium`.

## Run
```bash
npm run test:e2e
```
- **Expected**: `12 passed`.
- **On failure**: screenshots, traces and `error-context.md` files are written to `test-results/`.
- **Cleanup**: none required (git-ignored output). Each test gets a fresh browser context, so localStorage doesn't leak between tests.

## Manual checks (not automated)
- Rename `assets/ghosty.png` temporarily and reload: the fallback ghost shape should appear and the game should stay playable (NFR-6.1).
- Sound: you should hear `jump.wav` on each flap and `game_over.wav` on a crash. M and 🔊 toggle it (FR-9).
- Real phone: tapping doesn't zoom or scroll the page (FR-11.5). Sound may lag slightly on iOS (L-1).
