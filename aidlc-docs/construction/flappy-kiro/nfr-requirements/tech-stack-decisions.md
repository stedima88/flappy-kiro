# Tech Stack Decisions — flappy-kiro

| Concern | Decision | Rationale |
|---|---|---|
| Language | JavaScript (ES2020), `'use strict'` | CQ1: B |
| Rendering | Canvas 2D | FR-10.4 |
| UI overlays (screens, menu, buttons) | Plain DOM elements over the canvas | Keyboard and focus handling for the Settings menu (FR-12.5), stable `data-testid` hooks for E2E tests |
| Module format | Classic scripts. Each file registers itself on `window.FlappyKiro` in the browser and on `module.exports` in Node | Works from `file://` (NFR-1.4, A-2) and can be tested in Node (NFR-4.1) |
| Audio | `HTMLAudioElement` with a small pool of jump sounds | Works from `file://`; limitation L-1 accepted |
| Persistence | `localStorage`, wrapped with an in-memory fallback | FR-5, FR-12, NFR-6.3 |
| Unit test runner | Node.js built-in `node:test` + `node:assert` | No extra dependency; Node 24 is available |
| PBT framework (PBT-09) | **fast-check** 4.x (devDependency) | Custom arbitraries, automatic shrinking, seeds you can replay; works with any runner |
| E2E | **@playwright/test** (devDependency), Chromium, loading `index.html` via `file://` | Q11: B; also proves that NFR-1.4 holds |
| Build | **None** | NFR-1.3 |
| Package manager | npm, for devDependencies only | A-1 |
