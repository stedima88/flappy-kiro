# Requirements Verification Questions — Flappy Kiro

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options match, choose the last option (Other) and describe your preference after the tag.

Context already understood from your request and the workspace:
- Ghosty moves right continuously, falls under gravity, and goes up when you press the spacebar.
- Walls come in pairs with gaps of the same size at random heights. Passing a pair scores 1 point.
- Hitting a wall or the ground ends the game.
- Existing resources: `assets/ghosty.png`, `assets/jump.wav`, `assets/game_over.wav`, and the reference UI `img/example-ui.png`. The reference UI has a sky-blue sketch background, clouds, green pipes, and a "Score: X | High: Y" bar at the bottom.

---

## Question 1
What platform and technology should the game be built with?

A) Browser game using plain HTML5 Canvas + JavaScript/TypeScript (no game engine, runs by opening a page)

B) Browser game using a game framework (e.g. Phaser)

C) Desktop game in Python (e.g. Pygame)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Which inputs should make Ghosty go up?

A) Spacebar only (as stated)

B) Spacebar plus mouse click

C) Spacebar plus mouse click plus touch (playable on mobile/tablet)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 3
Which game screens/states are required?

A) Minimal: game starts on first spacebar press; on game over, press spacebar to restart immediately

B) Start screen ("Press Space to start") → Playing → Game Over screen with final score and "Press Space to restart"

C) Option B plus a Pause state (e.g. P or Esc key)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
How should the high score behave? (The reference UI shows "High: 2".)

A) Save the high score in the browser/local storage so it survives page reloads and restarts

B) Keep the high score only for the current session (lost on reload)

C) No high score, current score only

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
What should happen when Ghosty touches the top of the screen?

A) Ghosty is blocked at the ceiling (can't go higher, game continues)

B) Touching the ceiling ends the game, like the ground

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
Should difficulty increase as the score goes up?

A) No: constant speed, gap size and wall spacing throughout

B) Yes, gradually: speed increases and/or gaps shrink slightly as the score rises, with a sensible limit

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
How should audio be handled?

A) Use the provided `jump.wav` (on flap) and `game_over.wav` (on collision), with no mute control

B) Same as A, plus a mute/unmute toggle (e.g. M key or on-screen button)

C) No audio

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8
How closely should the visuals follow `img/example-ui.png`?

A) Closely: sky-blue sketch-style background, drifting clouds, green pipe-style walls with caps, `ghosty.png` sprite, score bar at the bottom

B) Loosely: same general layout, simple flat shapes and colours are fine

C) Also add polish on top of A (e.g. Ghosty tilting with velocity, parallax clouds, a score pop effect)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
What screen size and layout should the game use?

A) Fixed-size game area (about 800x600 like the reference), centred on the page

B) Responsive: scales to fit the browser window while keeping its aspect ratio

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10
How should the game be delivered and run?

A) Static files only: open `index.html` locally or serve from any static host, no build step

B) Small dev toolchain (e.g. npm + Vite) with a build step that produces static files

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 11
What level of automated testing do you expect?

A) Unit tests for the core game logic (physics, collision, scoring, wall generation) with a JS test runner

B) Unit tests plus a small end-to-end browser test (e.g. Playwright) that loads the game and checks it starts

C) No automated tests: manual play-testing only

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 12: Security Extensions
Should security extension rules be enforced for this project?

A) Yes: enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No: skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: X start as a POC by skipping security rules and, once tested and in a good shape, add all SECURITY rules

## Question 13: Resiliency Extensions
Should the resiliency baseline be applied to this project?

**What this extension is.** It applies **directional, design-time best practices** for resilient systems, taken from the **AWS Well-Architected Framework (Reliability Pillar)** and guidance for resilience reviews. It pushes requirements, design and code toward fault tolerance, high availability, observability and recoverability. It covers 15 practice areas: business goals, change management, observability, high availability, disaster recovery and continuous improvement.

**What this extension is NOT.** It does **not** make your workload production-ready. It does not certify or guarantee any availability, RTO or RPO target. It is a **starting point** for good resiliency decisions early on, not a substitute for a formal **AWS Well-Architected Review** of the finished system.

Treat the output as a solid **first draft of your resiliency posture** to build on and check, not a finished result certified for production.

A) Yes: apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads, as an informed starting point you can check and harden before go-live)

B) No: skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where fast iteration matters more than reliability)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 14: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes: enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial: enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No: skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
