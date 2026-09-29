# Story Generation Plan — Flappy Kiro

**Input**: `aidlc-docs/inception/requirements/requirements.md` (approved 2026-09-29)
**Outputs**: `aidlc-docs/inception/user-stories/personas.md`, `aidlc-docs/inception/user-stories/stories.md`

---

## Part A — Planning Questions

Fill in each `[Answer]:` tag with a letter. If nothing fits, choose the last option (Other) and describe your preference.

### Breakdown approaches (for Question 2)
| Approach | How it's organised | Trade-off |
|---|---|---|
| User Journey-Based | Follows a play session: launch, start, play, pause, game over, restart, settings | Reads naturally and maps well to E2E tests. Shared rules (collision, scoring) can end up spread across several stories. |
| Feature-Based | One group per capability: flight, walls, scoring, states, audio, visuals, settings | Maps cleanly to code modules. Loses the player's end-to-end view. |
| Persona-Based | Grouped by player type | Only worthwhile with several distinct personas. |
| Epic-Based | A few epics (e.g. Core Gameplay, Game Flow, Settings, Presentation, Quality), each with small stories | Good hierarchy and easy traceability. A little more structure. |
| Hybrid | Epics by feature, and stories inside each epic ordered by the player journey | Combines traceability with a journey view. |

## Question 1
Which personas should the stories be written for?

A) One persona: a casual player (plays on any device)

B) Two player personas: a desktop player (keyboard/mouse) and a mobile player (touch)

C) Option B plus a developer/maintainer persona (tunes config, runs tests), used for the technical enabler stories

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
Which breakdown approach should organise the stories? (See the table above.)

A) User Journey-Based

B) Feature-Based

C) Epic-Based

D) Hybrid: feature epics, with stories ordered by player journey inside each

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
How fine-grained should the stories be?

A) Coarse: about 8-12 stories, each covering one screen or capability with a larger set of acceptance criteria

B) Fine: about 20-30 small stories, each covering one rule or behaviour (e.g. "ceiling holds Ghosty", "score counts once per pair")

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
Which format should acceptance criteria use?

A) Given / When / Then scenarios (maps directly to automated tests)

B) Checklist of plain-language bullet points

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
Should acceptance criteria include concrete tuning numbers (e.g. gap size in pixels, speed limits)?

A) No: describe the behaviour only (e.g. "the gap never shrinks below the configured minimum"). The numbers are set in Functional Design.

B) Yes: propose target numbers now in the acceptance criteria

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
How should non-functional and technical requirements (file:// support, degrading gracefully on failures, delta-time physics, tests) be handled?

A) As separate "enabler" stories with their own acceptance criteria

B) As acceptance criteria inside the related player stories (e.g. "sound fails to load" becomes a criterion of the audio story)

C) Not as stories: leave them as NFR constraints in requirements.md, referenced from stories where relevant

X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
Should each story list the requirement IDs it covers (e.g. FR-4.1, NFR-6.3), plus a coverage table at the end showing every FR/NFR is covered?

A) Yes: per-story IDs plus a coverage table

B) Per-story IDs only

C) No traceability

X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Part B — Generation Checklist (runs after the plan is approved)

- [ ] 1. Record answers and the chosen approach at the top of `stories.md`
- [ ] 2. Generate `personas.md` with player archetypes (goals, context, device, frustrations), as chosen in Q1
- [ ] 3. Define the story structure (epics/groups) as chosen in Q2
- [ ] 4. Write stories in "As a <persona>, I want <goal>, so that <benefit>" form, sized as chosen in Q3
- [ ] 5. Write acceptance criteria for every story in the format from Q4 and the level of detail from Q5, including edge and error cases
- [ ] 6. Handle NFRs as chosen in Q6
- [ ] 7. Add requirement traceability as chosen in Q7
- [ ] 8. Map personas to stories
- [ ] 9. Check every story against INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable) and fix any that fail
- [ ] 10. Check extension compliance (Resiliency, PBT) for this stage and record N/A items
- [ ] 11. Final check: every approved requirement is covered by at least one story (or explicitly marked as a pure constraint)
