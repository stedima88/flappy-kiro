# Requirements — Flappy Kiro

## Intent Analysis Summary

| Item | Value |
|---|---|
| **User request** | Build a Flappy Bird clone called Flappy Kiro. The player steers a ghost, Ghosty, that moves right continuously through pairs of walls. Each pair has a gap of the same size at a random height. Ghosty falls on its own and goes up only when the player taps the spacebar. Each pair of walls passed scores one point. Hitting a wall or the ground ends the game. |
| **Request type** | New Project (greenfield) |
| **Scope estimate** | Single component: one client-side browser game, no backend |
| **Complexity estimate** | Simple to Moderate: clear core mechanics, plus game states, persistence, difficulty curve, responsive scaling and a full test suite |
| **Requirements depth** | Standard |

**Sources**: the original request (see `aidlc-docs/audit.md`), `requirement-verification-questions.md`, `requirement-clarification-questions.md`, the reference UI `img/example-ui.png`, and the assets in `assets/`.

---

## 1. Functional Requirements

### FR-1 Player character (Ghosty)
- **FR-1.1** Ghosty is drawn with the sprite `assets/ghosty.png`.
- **FR-1.2** Ghosty stays at a fixed horizontal position on screen. The world (walls, clouds) scrolls left, which gives the feeling of moving right continuously.
- **FR-1.3** Gravity pulls Ghosty down all the time while playing.
- **FR-1.4** A flap input gives Ghosty an upward velocity (it replaces the current vertical velocity, as in the original game).
- **FR-1.5** Ghosty cannot go above the top edge of the play area. At the ceiling it is held at the top edge, its upward velocity is set to zero, and the game continues. *(Q5: A)*
- **FR-1.6** Ghosty tilts with its vertical velocity: nose up when rising, nose down when falling. This is visual only. *(Q8: A, from the reference style)*

### FR-2 Input
- **FR-2.1** Flap inputs are the **spacebar**, a **mouse click**, and a **touch** on the game area. *(Q2: C)*
- **FR-2.2** Holding the spacebar down triggers one flap per key press, not repeated flaps from key auto-repeat.
- **FR-2.3** The spacebar does not scroll the page.
- **FR-2.4** Pause/resume keys are **P** and **Esc**. *(Q3: C)*
- **FR-2.5** The mute/unmute key is **M**, and there is also an on-screen mute button that works with mouse and touch. *(Q7: B)*

### FR-3 Walls (obstacles)
- **FR-3.1** Walls come in pairs: one from the top and one from the bottom, with a vertical gap between them.
- **FR-3.2** Within a given difficulty level, all gaps are the same size. *(original request)*
- **FR-3.3** Each gap is placed at a random height. The whole gap must stay inside the play area with a minimum margin from the top and from the ground.
- **FR-3.4** Consecutive gaps must not be so far apart vertically that they are impossible to reach at the current speed. A maximum vertical change between neighbouring gaps is defined in Functional Design.
- **FR-3.5** New wall pairs appear at the right edge at a fixed horizontal spacing and scroll left. Pairs that have left the screen on the left are removed.
- **FR-3.6** Walls look like green pipes with a wider cap at the gap end, as in `img/example-ui.png`.

### FR-4 Scoring
- **FR-4.1** The score goes up by exactly **1** each time Ghosty fully passes a wall pair, measured when Ghosty's horizontal position passes the pair's trailing edge. Each pair counts only once.
- **FR-4.2** The score is shown during play in a bottom bar formatted as `Score: <n> | High: <m>`, as in the reference UI.
- **FR-4.3** A brief visual effect plays on the score when it increases. *(Q8: A)*

### FR-5 High score
- **FR-5.1** The high score is saved in the browser's `localStorage` and survives page reloads and restarts. *(Q4: A)*
- **FR-5.2** When a game ends with a score above the stored high score, the high score is updated and saved.
- **FR-5.3** If the stored value is missing, corrupted or not a valid non-negative integer, it is treated as 0.

### FR-6 Collision and game over
- **FR-6.1** Hitting any wall ends the game.
- **FR-6.2** Hitting the ground ends the game.
- **FR-6.3** The ceiling does not end the game (see FR-1.5).
- **FR-6.4** Collision detection uses a hitbox slightly smaller than the sprite, so that transparent sprite edges don't cause unfair collisions. The exact shape and size are set in Functional Design.
- **FR-6.5** When a collision happens, **the game ends immediately**: the simulation freezes on the frame of impact, `game_over.wav` plays, and the Game Over overlay appears. There is no death animation or fall to the ground. *(Gap 2, 2026-09-29)*

### FR-7 Game states and screens *(Q3: C)*
- **FR-7.1 Start screen**: shows the title "Flappy Kiro", Ghosty bobbing idly, the high score, and a prompt such as "Press Space / Click / Tap to start". A flap input starts the game, and that first input is also the first flap.
- **FR-7.2 Playing**: normal gameplay.
- **FR-7.3 Paused**: the whole simulation freezes and a "Paused" overlay shows how to resume. P or Esc resumes. Flap input does nothing while paused.
- **FR-7.4 Game over**: the simulation stops. An overlay shows the final score, the high score, a "New high score!" note when one was set, and a prompt to restart. A short input cooldown (for example about 0.5 s) stops an accidental flap from restarting the game immediately.
- **FR-7.5 Restart**: a flap input after the cooldown resets Ghosty, walls, score and difficulty, and returns to Playing (or Start, as decided in Functional Design). The high score is kept.
- **FR-7.6** Allowed transitions: Start to Playing; Playing to Paused; Paused to Playing; Playing to Game Over; Game Over to Playing or Start. Start to Settings and back; Paused to Settings and back. No other transitions are allowed.
- **FR-7.7 Settings menu**: see FR-12.

### FR-8 Difficulty progression *(Q6: B)*
- **FR-8.1** Difficulty increases gradually with the score. The horizontal scroll speed increases, the gap size shrinks, or both.
- **FR-8.2** Each parameter has a hard limit (maximum speed, minimum gap) so the game stays playable forever.
- **FR-8.3** Difficulty changes smoothly or in small steps. A gap that is already on screen never changes size.
- **FR-8.4** The exact curve and limits are set in Functional Design.

### FR-9 Audio *(Q7: B)*
- **FR-9.1** `assets/jump.wav` plays on every flap.
- **FR-9.2** `assets/game_over.wav` plays once when the game ends.
- **FR-9.3** Mute turns all sound off or on. The mute setting is saved in `localStorage` *(assumption A-4)*.
- **FR-9.4** Quick flaps may overlap or restart the jump sound. The sound must never delay the flap itself.
- **FR-9.5** Audio starts only after the first user interaction, as browser autoplay rules require.

### FR-10 Visuals *(Q8: A)*
- **FR-10.1** The background is sky blue in a hand-sketched style, following `img/example-ui.png`.
- **FR-10.2** White rounded clouds drift in the background with a parallax effect, moving slower than the walls.
- **FR-10.3** A dark ground/score bar runs along the bottom of the play area and holds the score text.
- **FR-10.4** All drawing uses HTML5 Canvas 2D.

### FR-11 Layout and scaling *(Q9: B)*
- **FR-11.1** The game runs at a fixed logical resolution (about 800x600, like the reference). Final numbers are set in Functional Design.
- **FR-11.2** The canvas scales to fit the browser window while keeping its aspect ratio. Any leftover space is filled with bars (letterboxing), and the game is centred.
- **FR-11.3** Rendering stays sharp on high-DPI screens, taking `devicePixelRatio` into account.
- **FR-11.4** Resizing the window or rotating a mobile device re-fits the canvas without restarting the game.

### FR-11b Mobile browser behaviour *(Gap 3, 2026-09-29)*
- **FR-11.5** Taps on the game area do not zoom the page (no double-tap or pinch zoom), scroll it, bounce it (overscroll), select text, or open the long-press/context menu on the sprite. This uses `touch-action`, viewport meta settings and preventing default touch handling on the game area.

### FR-12 Settings menu *(Gaps 6 and 7, 2026-09-29)*
- **FR-12.1** A **Settings** menu can be opened from the **Start** screen and the **Paused** screen, never during active play. It opens with an on-screen button (mouse/touch) and with a keyboard shortcut. The key is chosen in Functional Design and must not clash with Space, P, Esc or M.
- **FR-12.2** **Reset high score**: sets the saved high score to 0. A confirmation step ("Are you sure?") prevents accidental resets. The score bar updates immediately.
- **FR-12.3** **Motion setting**: at least two levels, **Full** and **Reduced**. Reduced turns off or tones down non-essential motion: cloud parallax drift, Ghosty's tilt, the score effect, and Ghosty's idle bob on the Start screen. Gameplay movement (Ghosty, walls) is never affected. On first launch the setting follows the operating system's `prefers-reduced-motion` preference. After that the player's choice is saved in `localStorage`.
- **FR-12.4** The menu also shows the **Sound on/off** toggle (the same setting as FR-2.5 and FR-9.3).
- **FR-12.5** The menu works with the keyboard alone (move with the arrow keys or Tab, choose with Enter or Space, close with Esc) and with mouse/touch alone.
- **FR-12.6** All settings follow the storage fallback in NFR-6.3.

---

## 2. Non-Functional Requirements

### NFR-1 Technology and delivery *(Q1: A, CQ1: B, CQ2: Other)*
- **NFR-1.1** Language: **plain JavaScript**, with no TypeScript and no transpilation.
- **NFR-1.2** No game engine or runtime libraries. Only browser APIs: Canvas 2D, HTMLAudioElement, localStorage and requestAnimationFrame.
- **NFR-1.3** **No build step.** The files in the repository are exactly what the browser runs.
- **NFR-1.4** The game must run both when `index.html` is **opened directly from disk (`file://`)** and when served by any static HTTP server. This rules out things browsers block on `file://`, such as ES module `<script type="module">` imports and `fetch()` of local assets. See assumption A-2.
- **NFR-1.5** Target browsers: current versions of Chrome, Firefox, Safari and Edge on desktop, plus Safari on iOS and Chrome on Android.

### NFR-2 Performance
- **NFR-2.1** Runs smoothly at 60 FPS on a typical laptop and on a recent mobile device.
- **NFR-2.2** Physics and movement use elapsed time (delta-time), so game speed is the same on 60 Hz, 120 Hz and 144 Hz screens.
- **NFR-2.3** The delta-time for one frame is capped, so a long pause between frames (a stall or a background tab) can't make Ghosty tunnel through walls.
- **NFR-2.4** No per-frame memory growth: walls that leave the screen are removed.
- **NFR-2.5** A flap reacts on the next rendered frame.

### NFR-3 Usability and accessibility
- **NFR-3.1** Controls are shown on the Start screen.
- **NFR-3.2** Text has enough contrast against the background.
- **NFR-3.3** The game can be played with the keyboard alone and with touch alone.
- **NFR-3.4** Language: **English only** for now. All player-facing text lives in one place, so it can be translated later. *(Gap 8, 2026-09-29)*
- **NFR-3.5** The player can reduce non-essential motion (FR-12.3).

### NFR-4 Maintainability and testability
- **NFR-4.1** Game logic is kept separate from rendering, audio and input: physics, collision, scoring, wall generation, difficulty, the state machine and high-score parsing. That lets the logic be tested in Node.js without a browser.
- **NFR-4.2** Randomness (gap placement) goes through a random-number generator that is passed in and can be seeded, so tests are deterministic.
- **NFR-4.3** Tuning constants (gravity, flap strength, speeds, gap sizes, spacing, limits) live in one configuration module.
- **NFR-4.4** Code uses a consistent style and has brief comments where the game logic isn't obvious.

### NFR-5 Testing *(Q11: B, Q14: A)*
- **NFR-5.1** Example-based **unit tests** for the core logic: physics, collision, scoring, wall generation, difficulty, the state machine and high-score handling.
- **NFR-5.2** **Property-based tests** for the invariants of that logic, following the Property-Based Testing extension (full enforcement).
- **NFR-5.3** At least one **end-to-end browser test** that loads the game, checks the Start screen, starts a game with a flap input, and checks that play begins. It also checks game over and restart.
- **NFR-5.4** Tooling: **npm is used only for development and test dependencies** (test runner, PBT framework, E2E framework). It is never used to build or bundle the game. See assumption A-1. The frameworks are chosen in NFR Requirements; the likely candidates are Node's built-in test runner or Vitest, fast-check, and Playwright.
- **NFR-5.5** One command, such as `npm test`, runs all automated tests.

### NFR-6 Client-side resiliency *(Resiliency Baseline enabled, scope limited by CQ4: A)*
The game runs only on the local machine and has no backend, so the resiliency requirements cover graceful behaviour inside the browser:
- **NFR-6.1** If `ghosty.png` fails to load, the game draws a simple fallback shape for Ghosty and stays playable.
- **NFR-6.2** If an audio file fails to load or play, or playback is blocked, the game carries on silently without errors.
- **NFR-6.3** If `localStorage` is unavailable (private mode, blocked storage, quota), the high score and mute setting fall back to in-memory values for the session without errors.
- **NFR-6.4** When the tab or window is hidden during play, the game pauses automatically (`visibilitychange`).
- **NFR-6.5** A JavaScript error in one frame must not silently freeze the game in a broken state. Errors are logged to the console, and the game loop keeps going or fails in a visible way. The approach is set in NFR Design.

---

## 3. Extension Configuration and Compliance Scope

| Extension | Enabled | Notes |
|---|---|---|
| Security Baseline | **No (deferred)** | Skipped while building the POC. **A dedicated Security Baseline pass will run at the end of this workflow, after Build and Test** (CQ3: A): enable all SECURITY rules, review the code, and fix any blocking findings before the work is called complete. |
| Resiliency Baseline | **Yes** | Enforced. Hosting is local only (CQ4: A), so rules about hosted infrastructure are N/A (see below). Client-side resiliency is covered by NFR-6. |
| Property-Based Testing | **Yes (full)** | All PBT rules are blocking. The framework is picked in NFR Requirements (PBT-09). Properties are identified in Functional Design (PBT-01). |

### Resiliency decision record
You answered **N/A** to all resiliency decision questions because the game is **local only for now**: a static client-side game with no server, no backend, no shared data and no hosting.

| Rule | Decision | Rationale |
|---|---|---|
| RESILIENCY-01 Workload criticality | Classified **Low** | An entertainment POC run locally. If it's unavailable, there's no revenue, user or regulatory impact. No upstream or downstream services. |
| RESILIENCY-02 RTO/RPO and DR | N/A | Nothing is hosted. The only persistent data is a local high score, and losing it is acceptable. |
| RESILIENCY-03 Change management | N/A | Local POC. Changes are tracked in the local **Git repository** (set up 2026-09-29, branch `main`) and in this AI-DLC audit trail. |
| RESILIENCY-04 CI/CD, rollback, deployment style | N/A | No deployment target. Rollback means checking out an earlier Git commit. |
| RESILIENCY-05/06/07 Observability, health checks, resiliency monitoring | N/A | No service to monitor. Browser console logging is covered by NFR-6.5. |
| RESILIENCY-08 Regional topology | N/A | Not hosted. |
| RESILIENCY-09 Auto-scaling | N/A | No server-side compute. |
| RESILIENCY-10 Dependency isolation / graceful degradation | **Applies (client-side)** | Covered by NFR-6.1 to NFR-6.4 (asset, audio and storage failures). No network calls. |
| RESILIENCY-11/12/13 DR, backups, failover | N/A | No hosted persistent state. |
| RESILIENCY-14 Resiliency testing | Asked in NFR Design | Probably limited to automated tests of the fallbacks in NFR-6. |
| RESILIENCY-15 Incident response | N/A | Local POC with no production operation. |

**These decisions must be revisited if the game is ever hosted** (for example on S3 + CloudFront).

---

## 4. Assumptions (confirmed by the user on 2026-09-29)

- **A-1** "No build step" still lets npm install **dev-only** test tooling (test runner, fast-check, Playwright) to meet Q11: B and Q14: A. The game itself needs no `npm install` to run.
- **A-2** Because the game must work from `file://` (NFR-1.4), scripts load as classic `<script>` tags in dependency order rather than as ES modules. Logic files are written so they work both in the browser and in Node.js tests.
- **A-3** *(Revised 2026-09-29: the user asked for a Settings menu for high-score reset and motion; see FR-12.)* Gameplay tuning constants (physics, speeds, difficulty) are not exposed to the player. They are changed through the configuration module.
- **A-4** The mute setting is saved in `localStorage`, like the high score.
- **A-5** The existing assets in `assets/` are used as they are. No new art or sound assets will be created beyond drawn shapes (walls, clouds, background, fallbacks).

---

## 4b. Known Limitations (accepted by the user on 2026-09-29)
- **L-1** *(Gap 4)* Audio uses `HTMLAudioElement` so that it works on `file://`. On iOS Safari this can make sound effects lag a little. Accepted for the local POC.
- **L-2** *(Gap 5)* Some browsers, Safari especially, handle `localStorage` on `file://` pages unreliably or keep it separate per file. The high score and settings may then last only for the session, through the NFR-6.3 fallback. To be improved later, for example by serving the game over HTTP.

---

## 5. Out of Scope
- Hosting, deployment, CI/CD and infrastructure (local only for now).
- Online leaderboards, accounts or any backend.
- Characters, skins or levels beyond what is described here.
- Background music.
- Languages other than English (the text is kept in one place, per NFR-3.4).
- Security Baseline enforcement during construction. It is deferred to the final security pass (see Section 3).

---

## 6. Key Requirements Summary
1. A Flappy Bird-style game in plain JavaScript on HTML5 Canvas, with no build step and no engine, runnable straight from `index.html`.
2. Ghosty falls under gravity and flaps on spacebar, click or touch. The ceiling holds Ghosty in place; walls and the ground end the game.
3. Random-height gaps of equal size; +1 point per pair passed; a high score saved in localStorage.
4. Start, Playing, Paused and Game Over screens, with the game ending instantly on collision, and a Settings menu (sound, motion level, reset high score); difficulty that rises gradually up to fixed limits.
5. Visuals that closely follow the reference UI, scaled to the window with letterboxing and high-DPI support; no page zoom or scroll from touches on mobile; English only.
6. Logic kept separate from rendering, covered by example-based and property-based unit tests plus a Playwright E2E test.
7. Client-side graceful degradation when assets, audio or storage fail. A Security Baseline pass at the end of the workflow.
