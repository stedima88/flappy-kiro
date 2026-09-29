# Build and Test Summary — Flappy Kiro

## Build Status
- **Build tool**: none (static files, NFR-1.3). npm is used only for devDependencies: fast-check 4.x and @playwright/test 1.63.
- **Build status**: Success. The game runs from `index.html` over `file://` and over HTTP.
- **Artifacts**: the source files themselves.

## Test Execution Summary
| Suite | Command | Result |
|---|---|---|
| Unit (example-based) | `npm run test:unit` | 47 / 47 pass |
| Property-based (fast-check) | `npm run test:unit` | 15 / 15 pass (seeds logged) |
| Integration / E2E (Playwright, file://, desktop + touch) | `npm run test:e2e` | 12 / 12 pass |
| Performance | see performance-test-instructions.md | Pass: 60 FPS, 0.7 ms max update, bounded memory |
| Coverage (src logic) | node --experimental-test-coverage | 96.9% lines, 82.4% branches |
| Contract tests | N/A | single unit, no APIs |
| Security tests | Deferred | Security Baseline pass comes next (CQ3: A) |

**Overall**: `npm test`: 62 unit/PBT tests and 12 E2E tests pass, 0 failures.

## Defects found and fixed during Build and Test
1. **Refresh-rate dependence (NFR-2.2)**: Ghosty's path differed by about 3.6 px per 0.5 s between 60 Hz and 144 Hz. Fixed in `src/physics.js` (velocity-average integration). A regression unit test was added.

## Extension Compliance
| Extension | Status |
|---|---|
| Resiliency Baseline | RESILIENCY-01 compliant (Low criticality). RESILIENCY-10 compliant: client-side degradation, with storage and audio fallbacks tested automatically and the sprite fallback checked manually. RESILIENCY-14: resiliency testing is the automated fallback tests plus the manual checks in integration-test-instructions.md. All others N/A (local only, no hosting). |
| Property-Based Testing | PBT-08 compliant: shrinking enabled, a seed logged on every run, and replay with `FC_SEED`. The CI part is N/A because there's no CI pipeline (local only); add `npm test` to CI if one is created. All other PBT rules compliant. |
| Security Baseline | Disabled for construction. A dedicated pass is next. |

## Overall Status
- **Build**: Success
- **All tests**: Pass
- **Ready for**: the Security Baseline pass (deferred extension), then Operations (placeholder)
