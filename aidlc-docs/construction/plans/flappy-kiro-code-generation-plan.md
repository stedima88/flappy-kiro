# Code Generation Plan — flappy-kiro

This plan is the single source of truth for Code Generation. The user told us to proceed directly ("build the application", 2026-09-29).
**Unit**: flappy-kiro (a single unit, greenfield). **Workspace root**: repository root.
**Stories**: none (User Stories skipped). Traceability is to the FR/NFR IDs in requirements.md.

## Layout
```
index.html              page, DOM overlays, script tags in dependency order
styles.css              layout, letterboxing, overlays, touch behaviour
src/                    classic scripts, shared by browser and Node tests
  config.js strings.js rng.js physics.js difficulty.js walls.js
  collision.js scoring.js storage.js game.js      <- pure logic
  audio.js renderer.js input.js main.js           <- browser adapters
tests/unit/*.test.js    example-based (node:test)
tests/pbt/*.pbt.test.js property-based (fast-check), tests/pbt/arbitraries.js
tests/e2e/*.spec.js     Playwright, file:// URL
package.json            devDependencies + scripts only (no build)
playwright.config.js
```

## Steps
- [x] 1. Project setup: package.json, playwright.config.js, update .gitignore
- [x] 2. Pure logic: config, strings, rng, physics, difficulty, walls, collision, scoring, storage, game (FR-1..FR-9, FR-12, NFR-4)
- [x] 3. Example-based unit tests for every logic module (NFR-5.1, PBT-10)
- [x] 4. Property-based tests + shared arbitraries + seed logging (NFR-5.2, PBT-02..PBT-08)
- [x] 5. Browser adapters: audio (with fallback), renderer (sketch background, clouds, pipes, sprite fallback, tilt, score pop, reduced motion), input (keys/pointer/touch), main (loop, dt clamp, resize/DPR, visibility, error guard, overlays, settings menu) (FR-2, FR-9..FR-12, NFR-2, NFR-6)
- [x] 6. index.html + styles.css with `data-testid` on interactive elements
- [x] 7. E2E tests: start screen, start via Space, game over by falling, restart, pause, settings (reset confirm, motion, sound), persistence across reload (NFR-5.3)
- [x] 8. README update (how to play, run, test)
- [x] 9. Code summary in aidlc-docs/construction/flappy-kiro/code/
