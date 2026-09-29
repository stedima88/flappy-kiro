# Requirements Clarification Questions — Flappy Kiro

Thanks for your answers. Most are clear. A few points below need a decision before I write the requirements document:
- Some answers interact or are open-ended.
- The **Resiliency Baseline** you enabled (Q13: A) requires certain decisions to be made by you, not assumed by me.

Fill in each `[Answer]:` tag as before.

---

## Ambiguity 1: JavaScript or TypeScript (Q1: A)
Q1 option A said "JavaScript/TypeScript". Which language should the code be written in?

### Clarification Question 1
A) TypeScript (type-checked; fits well with the Vite toolchain from Q10: B)

B) Plain JavaScript (ES modules)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Ambiguity 2: "Runs by opening a page" vs a build step (Q1: A vs Q10: B)
Q1 A mentioned "runs by opening a page", but Q10 B adds an npm + Vite build step. Vite's build output normally needs to be served over HTTP rather than opened with a double-click (`file://`).

### Clarification Question 2
A) That's fine: run with `npm run dev` / `npm run preview` locally, and the built `dist/` folder is served from a static host

B) The built output must also work when `index.html` is opened directly from disk (needs extra build configuration)

X) Other (please describe after [Answer]: tag below)

[Answer]: X don't use a build step, use static files

## Ambiguity 3: When to turn on the Security rules (Q12: Other)
You chose to start as a POC without security rules and add all SECURITY rules "once tested and in a good shape". When should that happen?

### Clarification Question 3
A) At the end of this workflow: after Build and Test passes, run a dedicated security pass (enable Security Baseline, review and fix all findings) before the work is called complete

B) As a separate, later AI-DLC iteration that you'll start yourself; this workflow only records it as a follow-up

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Ambiguity 4: Where the game will run (drives Resiliency scope, Q13: A)
Most Resiliency Baseline rules (multi-zone, DR, health checks, auto-scaling, backups) concern hosted infrastructure. The game itself runs entirely in the player's browser and has no backend. Its only stored data is the high score in local storage. Where will the built game be hosted?

### Clarification Question 4
A) Local only for now (played on developer machines); no hosting. Resiliency rules then apply to the client code only: asset/audio load failures, local storage unavailable, tab hidden or resumed, frame-rate hiccups. Infrastructure rules are marked N/A.

B) Static hosting on AWS (e.g. S3 + CloudFront), with infrastructure defined as code (Terraform) in this project

C) Static hosting on an existing platform or service you already use. Please name it.

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Resiliency Baseline: Required Decisions

If you chose **A (local only)** in Clarification Question 4, answer **N/A** below. I'll document these as not applicable to a client-only game, with the reason. Otherwise, pick an option.

## Question: RTO/RPO Goals and Disaster Recovery Strategy
What are your Recovery Time Objective (RTO) and Recovery Point Objective (RPO) goals? These determine the Disaster Recovery strategy and how much infrastructure redundancy is needed.

A) RPO/RTO: Hours. Backup & Restore strategy. Lowest cost ($). Data is backed up; no services are deployed. On failure, redeploy from IaC and restore from backups. Suitable for non-critical workloads.

B) RPO/RTO: 10s of minutes. Pilot Light strategy. Cost: $$. Data is live; services are idle. Infrastructure is deployed but not running, and scales up on failover. Suitable for important workloads.

C) RPO/RTO: Minutes. Warm Standby strategy. Cost: $$$. Data is live; services run at reduced capacity and scale up during failover. Suitable for business-critical applications.

D) RPO/RTO: Near real-time. Multi-site Active/Active strategy. Highest cost ($$$$). Data is live, and services run in multiple regions at once. Suitable for mission-critical, zero-downtime requirements.

E) N/A: single-region deployment is acceptable, with no cross-region DR. Rely on multi-zone availability within one region.

X) Other (please describe after [Answer]: tag below)

[Answer]: N/A

## Question: Change Management Process
How should production changes for this workload be governed? AI-DLC will fit the design to your answer rather than inventing a process.

A) Use our existing change management process. Name the process or tool (e.g. ServiceNow, Jira Change, internal CAB). AI-DLC will reference it and make sure deployable artifacts fit it (change records, approval gates).

B) No formal process exists yet. AI-DLC should propose a lightweight process (change record + approval + rollback note) for the team to adopt.

C) N/A: this workload is exempt from formal change management (e.g. internal tooling or a POC). The reason for the exemption will be documented.

X) Other (describe after [Answer]: tag below)

[Answer]: N/A

## Question: CI/CD and Deployment Tooling
What CI/CD tooling and deployment process should this workload use?

A) Use our existing CI/CD pipeline. Name the tool (e.g. Buildkite, Bitbucket Pipelines, Jenkins, CodePipeline). AI-DLC will produce artifacts compatible with it.

B) No pipeline exists. AI-DLC should propose a CI/CD pipeline definition suited to the chosen IaC and runtime.

X) Other (describe after [Answer]: tag below)

[Answer]: N/A

## Question: Rollback Mechanism
How should a failed production deployment be rolled back?

A) Redeploy the previous IaC/artifact version (version-pinned rollback)

B) Blue/green swap back to the previous environment

C) Canary auto-rollback on health/metric regression

D) Database-aware rollback required (schema/data migration reversal). This gets flagged for explicit design.

E) Use our organization's existing rollback procedure. Please provide a reference.

X) Other (describe after [Answer]: tag below)

[Answer]: N/A

## Question: Deployment Style
What deployment strategy is acceptable for this workload's risk profile?

A) Direct / in-place (lowest cost, highest blast radius). Acceptable for non-critical workloads.

B) Rolling (instances replaced gradually)

C) Blue/green (zero-downtime cutover, higher cost)

D) Canary (traffic shifted progressively, with automated rollback)

X) Other (describe after [Answer]: tag below)

[Answer]: N/A

## Question: Regional Topology
Does this workload need a multi-region deployment, or is a single region with multi-zone redundancy enough?

A) Single-region, multi-zone. Survives a zone failure but not a full-region failure. Lower cost. (Matches RTO/RPO options A, B and E.)

B) Multi-region active-passive. Survives a region failure through failover. Higher cost. (Matches Warm Standby and cross-region Pilot Light.)

C) Multi-region active-active. Survives a region failure with no downtime. Highest cost. (Matches Active/Active.)

X) Other (describe after [Answer]: tag below)

[Answer]: N/A

## Question: Incident Response Process
How are production incidents handled for this workload?

A) Use our existing incident response process. Please provide a reference (e.g. PagerDuty runbooks, internal on-call process). AI-DLC will align alerting and runbooks to it.

B) No formal process exists. AI-DLC should propose a lightweight incident response and Correction of Errors (COE) process for adoption.

X) Other (describe after [Answer]: tag below)

[Answer]: N/A
