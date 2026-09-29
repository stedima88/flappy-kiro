# Functional Design — flappy-kiro

This is a light Functional Design. It fixes the values and rules that requirements.md left to this stage.

## 1. World and tuning constants (`src/config.js`)

| Constant | Value | Req |
|---|---|---|
| Logical size | 800 x 600 px; play area height 550, ground bar 50 | FR-11.1, FR-10.3 |
| Ghosty x (fixed) | 200 px | FR-1.2 |
| Ghosty draw size | 40 x 49 px (sprite aspect 1290:1567) | FR-1.1 |
| Ghosty hitbox | circle, radius 16, centred on the sprite | FR-6.4 |
| Gravity | 1500 px/s² | FR-1.3 |
| Flap velocity | -450 px/s (replaces current vy) | FR-1.4 |
| Max fall speed | 700 px/s | NFR-2.3 |
| Max frame dt | 1/30 s | NFR-2.3 |
| Wall body width / cap width x height | 60 / 72 x 22 px | FR-3.6 |
| Horizontal wall spacing | 260 px (distance from one pair's start to the next) | FR-3.5 |
| Gap margin from top / ground | 60 px / 60 px | FR-3.3 |
| Max change in gap centre between neighbours | 150 px | FR-3.4 |
| Scroll speed | `min(180 + 6 * score, 270)` px/s | FR-8 |
| Gap size | `max(170 - 2 * score, 125)` px, fixed when a pair is created | FR-8, FR-3.2 |
| Game Over input cooldown | 0.5 s | FR-7.4 |
| Settings key | **S** | FR-12.1 |

**Reachability check (FR-3.4):** at top speed (270 px/s) the open space between two pairs (260 - 72 = 188 px) takes about 0.7 s to cross. Falling 150 px from rest takes about 0.45 s. Repeated flaps climb at about 375 px/s, so climbing 150 px takes about 0.4 s. A 150 px change is therefore always reachable. The limits were first set to 300 px/s and 180 px; an autopilot simulation showed that was very tight at the hardest level, so they were lowered.

## 2. Rules

- **Physics step** (Playing only): `vy = min(vy + g*dt, maxFall)`, then `y += vy*dt`. **Ceiling** (FR-1.5): if `y - r < 0`, set `y = r` and `vy = max(vy, 0)`.
- **Ground** (FR-6.2): `y + r >= 550` means collision.
- **Walls** (FR-6.1): each pair gives 4 rectangles (top body, top cap, bottom cap, bottom body). Collision is a circle-rectangle intersection, using the distance from the circle centre to the nearest point of the rectangle.
- **Spawning**: when there are no pairs, or the rightmost pair's x is at most `800 - spacing`, spawn a pair at `x = 800` (so the first pair appears straight away at the right edge). Pairs with `x + capWidth < 0` are removed.
- **Gap placement**: `gapCenter = clamp(prev + (rng()*2-1)*maxDelta, minC, maxC)`, where `minC = margin + gap/2` and `maxC = 550 - margin - gap/2`. The first gap is uniform in `[minC, maxC]`.
- **Scoring** (FR-4.1): a pair scores once, the moment `ghosty.x > pair.x + bodyWidth`. After that it's marked `passed`.
- **Collision ends the game at once** (FR-6.5): state becomes GAME_OVER, the high score is updated if beaten, and the `gameOver` sound effect plays.

## 3. State machine (FR-7)

States: `START`, `PLAYING`, `PAUSED`, `GAME_OVER`, `SETTINGS`. SETTINGS remembers `returnTo`, which is START or PAUSED.

| From | Event | To | Side effects |
|---|---|---|---|
| START | FLAP | PLAYING | reset the run, then flap (the first input is also the first flap) |
| START | OPEN_SETTINGS | SETTINGS (returnTo START) | |
| PLAYING | FLAP | PLAYING | flap + jump sound |
| PLAYING | PAUSE / ESC / HIDDEN | PAUSED | |
| PLAYING | COLLIDE (internal) | GAME_OVER | game over sound, save the high score |
| PAUSED | PAUSE / ESC | PLAYING | |
| PAUSED | OPEN_SETTINGS | SETTINGS (returnTo PAUSED) | |
| SETTINGS | CLOSE / ESC | returnTo | |
| GAME_OVER | FLAP (after the cooldown) | PLAYING | reset the run, then flap |
| GAME_OVER | ESC | START | |

Anything else does nothing.

## 4. Persistence

- Keys: `flappyKiro.highScore` (integer string) and `flappyKiro.settings` (JSON `{"muted":bool,"motion":"full"|"reduced"}`).
- `parseHighScore(raw)`: returns a non-negative safe integer, or 0 (FR-5.3).
- `parseSettings(raw, defaults)`: any invalid field falls back to its default. The default motion setting comes from `prefers-reduced-motion`.
- Every storage call is wrapped. If storage is missing or throws, the value is kept in memory only (NFR-6.3).

## 5. Testable Properties (PBT-01)

| Component | Property | Category |
|---|---|---|
| rng | Same seed gives the same sequence; every value is in [0, 1) | Invariant / Idempotence (determinism) |
| physics | After any sequence of steps and flaps, `y >= r` (the ceiling holds); a flap sets `vy` to exactly the flap velocity; `vy <= maxFall` | Invariant |
| physics | `clampDt` output is always in [0, maxDt] | Invariant (range) |
| difficulty | Speed doesn't decrease and gap size doesn't increase as score rises; both stay within their limits | Invariant (ordering + range) |
| walls | Every generated gap lies inside the play area with its margins, and consecutive centres differ by at most maxDelta | Invariant (business rule) |
| walls | Spawned pairs keep the spacing; the list never grows beyond what fits on screen | Invariant |
| collision | Matches a direct distance calculation (reference) for circles clearly inside or clearly outside a rectangle | Oracle |
| scoring | Each pair adds at most 1 point; score equals the number of passed pairs; score never decreases | Invariant |
| storage | `parseSettings(serializeSettings(s)) == s`; `parseHighScore(String(n)) == n` | Round-trip |
| storage | `parseHighScore(anything)` is always a non-negative integer | Invariant |
| game (state machine) | Random command sequences, compared after every step against a simplified transition-table model: the state always matches the model, the score never decreases within a run, and the high score is at least the final score | Stateful |

Components with no PBT properties: renderer, audio and input (browser I/O adapters, covered by E2E and manual play), and strings (static data).
