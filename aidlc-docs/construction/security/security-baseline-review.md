# Security Baseline Review — Flappy Kiro

**Date**: 2026-09-29. **Trigger**: the deferred Security Baseline pass after Build and Test (CQ3: A).
**Scope**: every file in the public repository `stedima88/flappy-kiro`: game code, tests, tooling and docs.
**System profile**: a static, single-player game that runs entirely in the browser and is played locally from `file://`. There is no server, API, account, network call or third-party script. The only data it keeps is the high score and two settings in the player's own `localStorage`.

## Evidence Collected
| Check | Result |
|---|---|
| `npm audit` | found 0 vulnerabilities |
| Unsafe DOM/code sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string timers) | none. All text is set with `textContent`. |
| External URLs in HTML/JS/CSS | none |
| Secrets scan of all committed files (keys, tokens, passwords, private keys) | none (only mentions in rule documentation) |
| Personal data in the repository | redacted before the first push (local paths, work email); commits use the GitHub noreply address |
| `JSON.parse` of stored data | one place (`storage.parseSettings`), wrapped in try/catch and validated against an allowlist; covered by property tests |
| CSP compliance | E2E test `the Content Security Policy is active and nothing violates it` passes on Chromium, Firefox and WebKit over `file://` |

## Findings and Fixes
| # | Rule | Finding | Fix |
|---|---|---|---|
| F-1 | SECURITY-04 | No Content Security Policy | Added a meta CSP (`default-src 'none'`; only `'self'` for scripts, styles, images and media; no inline code, plugins, `<base>` or forms) plus `referrer=strict-origin-when-cross-origin`. An E2E test checks for zero violations and that an inline script is blocked. |
| F-2 | SECURITY-15 | No global error handler; only the game loop was guarded | Added `window` `error` and `unhandledrejection` handlers that log to the console. Players only see the generic error overlay. |
| F-3 | SECURITY-10 | Vulnerability scan and SBOM not part of the documented workflow | Added `npm run audit` and `npm run sbom` (CycloneDX) and documented them in build-instructions.md. |
| F-4 | SECURITY-11 | No misuse cases in the design | Added "Misuse Cases" to functional-design.md (tampered storage, DevTools cheating, input spam, framing, broken assets). |
| F-5 | SECURITY-09 | A code comment called `window.FlappyKiro.app` "read-only", but it can change game state | Corrected the comment and code-summary; exception documented below. |

**No blocking findings remain.**

## Compliance Summary
| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 Encryption at rest / in transit | N/A | No data store or network transfer. `localStorage` holds only a score and two non-sensitive preferences, managed by the browser. |
| SECURITY-02 Access logging on intermediaries | N/A | No load balancer, API gateway or CDN. |
| SECURITY-03 Application logging | N/A (partially compliant) | Nothing is deployed and there's no log service. Console output contains no secrets or PII (verified). |
| SECURITY-04 HTTP security headers | Compliant (with a documented exception) | The CSP and Referrer-Policy are set with meta tags, with no `unsafe-inline` or `unsafe-eval`. **Exception**: HSTS, `X-Content-Type-Options` and `X-Frame-Options` / `frame-ancestors` can only be sent as HTTP headers, and there's no server. If the game is ever hosted, the host must send them. Note that GitHub Pages can't set custom headers, so a host such as CloudFront or Netlify would be needed for full compliance. |
| SECURITY-05 Input validation on APIs | N/A (local inputs validated) | No API. Stored values are validated by allowlist. Keyboard and pointer events map to a fixed set of actions. |
| SECURITY-06 Least-privilege IAM | N/A | No cloud identities. |
| SECURITY-07 Network configuration | N/A | No network resources. |
| SECURITY-08 Application access control | N/A | No endpoints, users or protected resources. |
| SECURITY-09 Hardening | Compliant | No default credentials. Players see a generic error message; details go to the console only. No sample pages. Current runtimes (Node 24, Playwright 1.63, fast-check 4). **Documented exception**: the debug handle `window.FlappyKiro.app` stays, because it's needed by the E2E tests and the game has no trust boundary. |
| SECURITY-10 Supply chain | Compliant | `package-lock.json` is committed with integrity hashes. The audit script finds 0 vulnerabilities. There are no unused dependencies. Only the official npm registry is used. An SBOM script is available. There are zero runtime dependencies. CI (`.github/workflows/ci.yml`) pins actions by commit SHA and Node to 24.15.0, runs `npm ci` and `npm audit --audit-level=moderate`, and uses a read-only token. |
| SECURITY-11 Secure design | Compliant | No security-critical logic to isolate. Rate limiting is N/A (no public endpoints). Misuse cases are documented (F-4). |
| SECURITY-12 Authentication | N/A | No authentication. No hardcoded credentials (verified). |
| SECURITY-13 Integrity | Compliant | Deserialization is safe (allowlisted `JSON.parse`). No CDN scripts, so SRI isn't needed. npm checks lockfile integrity hashes. Only the repository owner can change the CI definition, and every change is tracked in Git history. Critical-data auditing is N/A. |
| SECURITY-14 Alerting and monitoring | N/A | No deployed service or security events. |
| SECURITY-15 Exception handling | Compliant | Storage calls, audio playback (including promise rejections) and image loading are all handled. The game loop has a guard and there are now global handlers. Players see generic messages. Fail-closed is N/A (no access control). |

## If the Game Is Ever Hosted (follow-ups)
1. Serve over HTTPS with HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, and move the CSP into a header.
2. Revisit the Resiliency decisions recorded as N/A (hosting, rollback, monitoring).
3. ~~Add CI~~ Done 2026-09-29: `.github/workflows/ci.yml`.
