# Unit Test Execution — Flappy Kiro

## Run Unit Tests
### 1. Execute all unit and property-based tests
```bash
npm run test:unit
```
This runs `node --test` over `tests/unit/*.test.js` (example-based) and `tests/pbt/*.pbt.test.js` (property-based, fast-check).

With coverage:
```bash
node --test --experimental-test-coverage --test-coverage-include="src/**" "tests/unit/*.test.js" "tests/pbt/*.pbt.test.js"
```

### 2. Review test results
- **Expected**: **62 tests pass, 0 failures** (47 example-based, 15 property-based).
- **Coverage (last run, logic modules)**: 96.9% of lines, 82.4% of branches, 96.5% of functions. The uncovered lines are mostly defensive branches, such as the browser-global registration path in each file.
- **Report**: printed to the console; there's no report file.

### 3. Property-based tests (PBT-08)
- Each test file prints `[fast-check] seed=<n>` on every run.
- On failure, fast-check shrinks the input to a minimal counterexample and prints it with the seed.
- Replay a run exactly: `FC_SEED=<n> npm run test:unit`.
- Run more iterations: `FC_RUNS=2000 npm run test:unit`.
- A flaky property failure (one that passes on retry) must be investigated, not retried away (PBT-08). Add the shrunk case as an example-based regression test (PBT-10).

### 4. Fix failing tests
Read the assertion message (each check names the rule it protects, e.g. `score decreased within a run at step 4`). Replay the seed, then fix the code, or the test if the test's model is wrong, and add a regression example.
