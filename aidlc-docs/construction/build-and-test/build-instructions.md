# Build Instructions — Flappy Kiro

## Prerequisites
- **To play**: any current browser (Chrome, Firefox, Safari, Edge). Nothing else.
- **To run tests**: Node.js 20 or newer (verified with Node 24.15, npm 11.12), and network access to registry.npmjs.org the first time.
- **Environment variables**: none required. Optional: `FC_SEED` (replay a property-test run), `FC_RUNS` (property-test iterations, default 200).
- **System**: about 250 MB of disk for `node_modules` plus the Playwright Chromium cache.

## Build Steps
There is **no build step** (NFR-1.3). The files in the repository are what the browser runs.

### 1. Install test dependencies (dev only)
```bash
npm install
npx playwright install chromium   # once per machine
```

### 2. Run the game
```bash
open index.html                   # macOS; or double-click index.html
# or serve it: python3 -m http.server 8000  ->  http://localhost:8000
```

### 3. Verify it works
- **Expected**: the Start screen shows "Flappy Kiro", "High score: 0", a Settings button and the bottom bar "Score: 0 | High: 0". The browser console shows no errors.
- **Artifacts**: none are generated. `test-results/` and `playwright-report/` are created only by E2E runs and are git-ignored.

## Troubleshooting
### `npm install` fails
- **Cause**: no network access, or a custom npm registry that lacks the packages.
- **Solution**: check `npm config get registry`, then retry. The game itself doesn't need `npm install` at all.

### Playwright says "Executable doesn't exist"
- **Cause**: the Chromium build for this Playwright version isn't downloaded.
- **Solution**: `npx playwright install chromium`.

### High score is lost after a reload when opening from disk
- **Cause**: known limitation L-2 (some browsers, especially Safari, restrict localStorage on `file://`).
- **Solution**: serve the folder over HTTP (step 2, second option).
