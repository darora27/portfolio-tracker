# Phase 10 Agent Workflow

Status: workflow plan only; the orchestrator is not implemented in this pass

Applies after: Devan records the Phase 10 visual-direction selection

## 1. Operating principles

- One coding agent process may access this repository at a time.
- Work one `PHASE10.md` section at a time, in order.
- A section is a vertical product slice, not a role-specific partial change.
- Security, privacy, financial correctness, accessibility, and green
  verification are release gates.
- Claude and Codex have different jobs in each section. They do not merely
  continue one generic checklist.
- The durable repository state, not chat history or a resume prompt, is the
  source of truth.
- Stop safely when state is surprising. Do not “repair” an unexpected dirty
  worktree or bypass a failed test to keep the relay moving.

## 2. Required sequence

Every implementation section follows this state machine:

1. **Claude Builder**
   - reads the selected direction, product direction, UX architecture,
     `PHASE10.md`, and handoff state;
   - implements the smallest complete vertical slice;
   - adds/updates tests and screenshots;
   - runs required verification;
   - commits a green builder candidate;
   - hands off to Codex Critic.
2. **Codex Critic**
   - performs a read-only product, UX, accessibility/mobile, and engineering
     review;
   - compares before/after screenshots and acceptance criteria;
   - records a scored pass/fail result with actionable evidence;
   - does not implement fixes during the critic role;
   - hands failures to Claude Refiner or passes to Codex acceptance review.
3. **Claude Refiner**
   - addresses only the critic's accepted findings;
   - re-runs tests/build and required visual checks;
   - commits the refinement;
   - hands off to Codex acceptance review.
4. **Codex acceptance review**
   - independently verifies the final diff, behavior, screenshots, privacy,
     tests, build, and scorecard;
   - records acceptance or returns a bounded failure list to Claude Refiner;
   - marks the section complete only when every scorecard category passes.

If the first critic review has no failures, the state may skip Claude Refiner
and move directly to Codex acceptance review. The sequence is still recorded;
the skip reason must be “critic passed without required changes.”

No section advances while any scorecard category fails.

## 3. Standard critic scorecard

Each category is scored `PASS` or `FAIL`; an optional 1–5 diagnostic score helps
track quality but never converts a failure into a pass.

### Product alignment

Pass requires:

- the slice answers the route's named user question;
- it follows `PRODUCT_DIRECTION.md`;
- public/private and observation/not-advice boundaries are intact;
- the chosen design direction is recognizable;
- negative or weak performance remains honest.

### Hierarchy

Pass requires:

- one dominant first-layer message;
- supporting data has deliberate priority;
- advanced content is available through clear disclosure;
- desktop and mobile reading order are intentional;
- the result is not another equally weighted card wall.

### Usefulness

Pass requires:

- the user can make sense of the displayed evidence;
- claims identify window, source freshness, and important limitations;
- controls lead to meaningful detail;
- empty, stale, unsupported, and error states remain useful;
- no decorative interaction blocks the task.

### Originality

Pass requires:

- the solution is specific to a portfolio Observatory;
- dimensionality structures navigation, relationships, or storytelling;
- it avoids generic SaaS/dashboard patterns and context-free decoration;
- it does not copy the reference site's branding, assets, layout, voxel art,
  trade dress, or audio.

### Accessibility and mobile

Pass requires:

- click, keyboard, and touch operation;
- visible focus and semantic state;
- reduced-motion and non-3D fallbacks;
- correct focus behavior after disclosure/navigation;
- no essential canvas-only content;
- verified 390×844 behavior and no page overflow;
- touch targets and contrast meet the section's criteria.

### Engineering reliability

Pass requires:

- financial math and source semantics remain correct;
- privacy tests and route gating pass;
- API/server boundaries and caches are appropriate;
- no secret or `.env*` access/output;
- tests and production build are green;
- visual checks are real and reproducible;
- no unexplained dirty state or unrelated diff.

## 4. Critic report format

The critic writes a structured review into the handoff state and a human-readable
section note. Each failure contains:

```json
{
  "category": "hierarchy",
  "criterion": "one dominant first-layer message",
  "evidence": "The mobile first viewport gives equal weight to five metric cards.",
  "impact": "A first-time visitor cannot tell which fact answers the chapter question.",
  "required_change": "Replace the card row with one lead interpretation and move four metrics behind Details.",
  "verification": "Capture 390x844 before/after screenshots and repeat the five-second comprehension check."
}
```

Comments are bounded to changed behavior and explicit acceptance criteria.
Personal taste without product evidence is not a blocking finding.

## 5. Durable machine-readable handoff

The future orchestrator maintains `PHASE10_STATE.json` at repository root. It is
created only when implementation begins, not during this planning pass.

Minimum shape:

```json
{
  "schema_version": 1,
  "phase": 10,
  "current_section": "§1",
  "role": "claude_builder",
  "status": "ready",
  "next_agent": "claude",
  "selected_direction": {
    "name": null,
    "recorded_by": null,
    "recorded_at": null,
    "combined_parts": []
  },
  "last_green_commit": null,
  "verification": {
    "tests": {
      "command": "npm test",
      "status": "not_run",
      "summary": null,
      "finished_at": null
    },
    "build": {
      "command": "npm run build",
      "status": "not_run",
      "summary": null,
      "finished_at": null
    },
    "visual": {
      "required": true,
      "status": "not_run",
      "desktop_screenshot": null,
      "mobile_screenshot": null
    }
  },
  "review": {
    "result": "not_run",
    "reviewer": null,
    "scorecard": {
      "product_alignment": "not_run",
      "hierarchy": "not_run",
      "usefulness": "not_run",
      "originality": "not_run",
      "accessibility_mobile": "not_run",
      "engineering_reliability": "not_run"
    },
    "failures": []
  },
  "failure_count": {
    "consecutive": 0,
    "maximum": 3
  },
  "stop_reason": null,
  "updated_at": null
}
```

Required invariants:

- `current_section`, `role`, `status`, and `next_agent` always agree.
- `last_green_commit` names the exact commit whose test/build state is recorded.
- A dirty worktree cannot be described as green.
- `review.result` is `pass` only when every scorecard category is `pass`.
- `status` becomes `complete` only after Codex acceptance review.
- `stop_reason` is mandatory for every stopped, failed, or blocked state.
- Updates are atomic: write a temporary file, validate schema, then rename.
- Every role reads the state again immediately before writing its handoff.

Recommended status values:

`blocked_selection`, `ready`, `running`, `awaiting_critic`,
`awaiting_refiner`, `awaiting_acceptance`, `failed_verification`,
`stopped`, `complete`.

## 6. Role-specific prompts

The orchestrator renders prompts from state; it does not use one generic “resume”
prompt.

### Claude Builder prompt

> You are the Phase 10 Builder for `{current_section}`. Read AGENTS.md,
> PRODUCT_DIRECTION.md, docs/PHASE10_UX_ARCHITECTURE.md,
> docs/PHASE10_AGENT_WORKFLOW.md, PHASE10.md, and PHASE10_STATE.json. Confirm
> the recorded direction and clean green base. Implement only this section as a
> complete vertical slice. Follow every behavioral, visual, mobile,
> accessibility, test, build, and privacy criterion. Capture required
> before/after screenshots. Do not touch `.env*`, do not deploy, and do not
> widen scope. Commit the green builder candidate, update state for Codex
> Critic, then stop.

### Codex Critic prompt

> You are the read-only Phase 10 Critic for `{current_section}`. Read the Phase
> 10 product, UX, workflow, specification, selected direction, handoff state,
> builder diff, tests, and screenshots. Do not edit implementation files.
> Evaluate all six scorecard categories and every section acceptance criterion.
> Verify desktop/mobile evidence and distinguish facts from taste. Record
> PASS/FAIL with bounded actionable evidence, update state to Claude Refiner or
> Codex acceptance as appropriate, then stop.

### Claude Refiner prompt

> You are the Phase 10 Refiner for `{current_section}`. Read the critic report
> and current state. Address only recorded blocking findings while preserving
> passed behavior. Re-run the section's tests, full tests, production build,
> privacy checks, and required visual checks. Commit the green refinement,
> update state for Codex acceptance review, then stop. If a finding conflicts
> with security, math, privacy, or the selected direction, stop and record the
> conflict instead of guessing.

### Codex acceptance prompt

> You are the Phase 10 Acceptance Reviewer for `{current_section}`. Independently
> inspect the complete section diff from the last accepted commit, current
> behavior, before/after screenshots, tests, build, privacy, mobile, reduced
> motion, fallback, and all scorecard categories. Do not implement fixes. Mark
> the section complete only if every category and acceptance criterion passes.
> Otherwise record the smallest complete failure list, route state back to
> Claude Refiner, and stop.

## 7. Audit of `scripts/agent-relay.sh`

The Phase 9 relay is a convenience loop, not a safe critic/refiner
orchestrator. Its current behavior is unsuitable for unattended Phase 10 work:

1. A successful Tool A run executes `continue`, so the loop calls Tool A again
   instead of invoking a critic.
2. Ordinary failures set `WAS_LIMITED=0`; the caller treats that like success
   and can loop the same tool.
3. Rate-limit detection is a small output-string heuristic and is incomplete.
4. The `while true` loop has no project-complete condition.
5. The fixed 20-minute sleep does not use provider-supplied reset or retry time.
6. Both commands use broad permission-bypass flags, which are inappropriate for
   unattended local work.
7. The relay invokes `codex exec`, creating a CLI execution; it cannot inject
   work into an existing Codex desktop task.
8. It has no repository lock, STOP sentinel, dirty-state check, verification
   gate, maximum failure count, structured handoff, or role-specific prompt.

Phase 10 must not extend this loop in place and call it orchestration.

## 8. Replacement orchestrator plan

The replacement is a small state-driven owner tool, implemented only in a later
approved section.

### Required control flow

1. Acquire a repository lock using an atomic lock file/directory that records
   PID, command, host, and start time.
2. Refuse to run if another valid lock exists.
3. Read and schema-validate `PHASE10_STATE.json`.
4. Stop if a user-controlled `STOP` sentinel exists.
5. Confirm the worktree matches the expected clean/role state.
6. Confirm `last_green_commit` exists and matches recorded verification.
7. Choose exactly one next role from state.
8. Render that role's prompt with section and acceptance context.
9. Run exactly one agent process with least-privilege workspace access.
10. Prefer machine-readable CLI output where the provider supports it.
11. Capture exit code and structured result without printing secrets.
12. Re-read state, validate the allowed transition, and verify repository state.
13. Stop on unexpected dirty state or failed verification.
14. Increment consecutive failures; stop at the configured maximum (default 3).
15. Use provider-supplied retry/reset timing when available; otherwise apply
    bounded exponential backoff with jitter and a maximum wait.
16. Reset failure count after a valid successful handoff.
17. Exit when all Phase 10 sections are accepted and state is `complete`.
18. Release the lock on normal exit and signals; preserve diagnostic state.

### Safety requirements

- No broad danger/full-access flags unless the entire run occurs in an
  explicitly isolated disposable environment approved by the owner.
- Restrict agents to the repository workspace and required read-only tooling.
- Never read, print, upload, stage, or commit `.env*` files.
- Redact provider output before durable logging.
- Do not auto-resolve git conflicts, discard user changes, reset the worktree,
  deploy, or mutate remote systems.
- Do not automatically accept tool permission prompts.
- The owner can create `STOP` at any time; the orchestrator checks it before and
  after each agent process and before retries.
- A stopped run records `stop_reason`, last green commit, and exact safe resume
  state.

### Completion condition

The project completes only when:

- every Phase 10 section is marked complete in order;
- every final Codex scorecard passes;
- tests and production build are green at the final commit;
- required screenshots exist;
- the worktree is clean;
- no STOP sentinel is present;
- the final summary is recorded.

Rate limits, a zero exit code, or the absence of more prompt text are not
completion conditions.

## 9. Verification and commit discipline

- Builder and Refiner commits use `phase10(§N): <summary>`.
- Critic-only state/report commits, if needed, use
  `phase10(review §N): <result>`.
- Tests and production build must be green before implementation commits.
- A section's final accepted commit is recorded in state.
- Before/after screenshot paths are recorded for every UI-bearing section.
- Critic and acceptance reviews compare the section range, not only the last
  commit.
- No section starts from an uncommitted previous section.

## 10. Manual fallback

Manual role alternation remains the reliable fallback:

1. Owner checks lock, STOP, state, and clean worktree.
2. Owner runs the named role with its role-specific prompt.
3. Owner verifies the state transition and repository status.
4. Owner launches the next role only after the previous process exits.

The same handoff schema and scorecard apply. Manual operation does not waive
gates.
