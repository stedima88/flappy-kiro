# Performance Test Instructions — Flappy Kiro

## Purpose
Check the NFR-2 requirements. There's no server, so "load" means the per-frame work in the browser.

## Performance Requirements
| Requirement | Target |
|---|---|
| NFR-2.1 Frame rate | Steady 60 FPS on a typical laptop |
| NFR-2.2 Refresh-rate independence | Same flight path at 60 Hz and 144 Hz |
| NFR-2.3 Stall safety | A frame's dt is capped at 1/30 s |
| NFR-2.4 No memory growth | Wall list stays bounded |
| NFR-2.5 Input latency | A flap takes effect on the next frame |

## How it was measured
1. **In-browser frame timing** (Chromium headless, 1280x960 at devicePixelRatio 2): the game runs with an autopilot for 8 s while `requestAnimationFrame` intervals and `update()` time are recorded.
2. **Refresh-rate independence**: unit test `movement does not depend on the refresh rate: 60 Hz vs 144 Hz` in `tests/unit/physics.test.js`.
3. **Stall safety / memory**: property tests `clampDt is always within [0, maxFrameDt]` and `scrolling and spawning keep exact spacing and a bounded wall count`.
4. **Playability at the hardest level**: a Node autopilot simulation over 8 seeds.

## Results (2026-09-29)
| Metric | Result | Status |
|---|---|---|
| Median / 95th-percentile frame interval | 16.7 ms / 16.7 ms (60 FPS) | Pass |
| Slowest `update()` call | 0.7 ms (budget 16.7 ms) | Pass |
| JS heap after 8 s of play | about 10 MB | Pass |
| Wall pairs alive at once | 3 (bounded by the property test) | Pass |
| 60 Hz vs 144 Hz position after 0.5 s | difference < 0.5 px (was about 3.6 px before the fix below) | Pass |
| Autopilot scores (8 seeds) | 16–23, reaching the hardest level | Pass (playable) |

## Optimization performed
- The physics step now uses the average of the old and new velocity, which is exact under constant gravity. The earlier simple Euler step made Ghosty's path depend slightly on the refresh rate. The new unit test found this.
- The sky and ground textures are drawn once into offscreen canvases (and again on resize), not every frame.

## How to repeat
Run the unit tests for items 2 and 3. For frame timing, open the game in Chrome, play with DevTools → Performance recording, and confirm the frames stay at 16.7 ms and the heap stays flat.
