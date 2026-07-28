# Phase 10 agent workflow

Status: active from §2 onward.

The machine-readable authority is
`docs/phase10-workflow/workflow.json`. Live routing and required reading are
generated into `docs/phase10-workflow/ACTIVE_CONTEXT.md`. The original
workflow implementation plan remains in
`docs/phase10-workflow/IMPLEMENTATION_SPEC.md` as historical evidence only.

§0 and §1 used an earlier Builder → Critic → Refiner → Acceptance sequence.
That history remains under `PHASE10_STATE.json`'s `legacy` key and in the
historical review/handoff directories; it is not an operational sequence for
new work.

## 1. Operating principles

- One coding-agent process may access the repository at a time, enforced by
  `PHASE10_LOCK` plus the actor's process check.
- `STOP` is always checked before any other repository read or write.
- `PHASE10_STATE.json` routes the next turn. The canonical manifest defines
  valid stages, roles, actors, terminal section, gates, and verification
  policy.
- Generated `ACTIVE_CONTEXT.md` is a small routing packet, not a new hand-edited
  source of truth. Its hashes are validated before every turn.
- Historical documents are read when the active task names them, not injected
  into every turn.
- Security, privacy, authentication, financial correctness, data integrity,
  accessibility, and honest failure states remain release gates.
- Claude and Codex keep separate jobs. Neither reviews and accepts its own
  implementation.
- Ambiguous outcomes stop as `blocked`; the relay never guesses from prose,
  retries automatically, changes roles, or runs agents concurrently.

## 2. Roles

1. **Claude Lead** (`claude-code`) owns product intent, section
   specifications, design-proof sufficiency, acceptance criteria, independent
   review, and final acceptance.
2. **Codex Implementation** (`codex`) implements the accepted specification,
   records implementer evidence, and remediates only Claude's bounded findings.

The ordinary cycle is:

Claude specifies → Codex implements → Claude reviews and accepts

If review fails:

Claude reviews → Codex remediates → Claude re-reviews and accepts

A passing review records acceptance and initializes the next section in the
same Claude turn. This removes a documentation-only model invocation and a
third redundant full test/build run. The two independent gates remain: Codex
verifies the candidate before committing, and Claude repeats the full suite and
build during final review.

The `accept` stage remains valid only for state already routed there or for an
explicit owner-exception/blocked recovery. It is not part of the normal
passing path.

## 3. Canonical state machine

The manifest's `stages` and `transitions` objects are authoritative. Human
summary:

| stage | role | actor | normal outcome |
|---|---|---|---|
| `specify` | `claude_lead` | Claude | spec + acceptance ledger → `implement` |
| `implement` | `codex_implementation` | Codex | verified candidate → `review` |
| `review` | `claude_lead` | Claude | fail → `remediate`; pass → accept and advance |
| `remediate` | `codex_implementation` | Codex | verified bounded fixes → `review` |
| `accept` | `claude_lead` | Claude | legacy/exception acceptance → advance |

Never hardcode the final section in prose or prompts. Read
`workflow.managed_sections.terminal`; validation ensures it matches the highest
roadmap heading.

## 4. Active context

Run:

```bash
npm run phase10:context
npm run phase10:validate
```

The generator writes `docs/phase10-workflow/ACTIVE_CONTEXT.md` from:

- `docs/phase10-workflow/workflow.json`;
- `PHASE10_STATE.json`; and
- `PHASE10.md`.

It also hashes the operational workflow, design gate, actor prompts, handoff
contract, and acceptance-ledger instructions named by
`workflow.context.active_context_hash_sources`. A policy edit therefore makes
the active packet mechanically stale until it is regenerated.

It contains the current route, exact required sources, current inherited
conditions, global gates, transition summary, verification policy, and hashes
of its inputs. The validator fails if the packet is missing or stale.

Agents always read:

1. `AGENTS.md`;
2. `PHASE10_STATE.json`; and
3. `docs/phase10-workflow/ACTIVE_CONTEXT.md`.

They then read only the current spec, direction package, handoff, and relevant
product/UX sections named there. Full progress and legacy records stay
available for a targeted historical question.

## 5. Design-proof gate

Before specifying user-facing production work, Claude applies
`docs/phase10-workflow/DESIGN_GATE.md`.

The proof names intent, annotated references, rejected patterns, design
grammar, representative states, exact proof surfaces, the owner decision, and
the boundary between defect remediation and a new creative direction. Existing
owner-approved direction packages may satisfy it only when the spec explicitly
maps every required item.

A material unresolved design decision routes to Devan before implementation.
This prevents a technically passing section from being repeatedly reopened by
late creative direction.

## 6. Executable acceptance ledger

Starting with the section configured by
`workflow.acceptance_ledger.required_from_section`, every spec creates:

`docs/phase10-workflow/acceptance/section-N.json`

Each concrete requirement has:

- a stable ID;
- one of the seven acceptance dimensions;
- a risk level;
- an observable description;
- a command/browser/visual/manual verifier;
- required artifacts; and
- separate implementer and reviewer results.

Codex may fill only implementer results. Claude records the candidate SHA and
fills reviewer results independently. A pass without evidence is invalid.

Commands:

```bash
npm run phase10:acceptance -- new \
  --section N \
  --spec docs/phase10-workflow/specs/section-N.md

npm run phase10:acceptance -- check \
  docs/phase10-workflow/acceptance/section-N.json \
  --require implementer

npm run phase10:acceptance -- check \
  docs/phase10-workflow/acceptance/section-N.json \
  --require reviewer
```

The ledger does not replace human visual judgment. It prevents objective gates
such as privacy, contrast, geometry, dimensions, payload size, and performance
from being discovered one at a time across repeated review turns.

## 7. Bounded review

Claude reviews against the declared spec and ledger only. Each failure cites
the exact criterion, evidence, and required change. Findings are complete for
every criterion that could be exercised in that review; advisory ideas and
future-scope suggestions do not become remediation findings.

If a blocking failure prevents later criteria from being exercised, the review
lists those criteria explicitly as unperformed. Codex fixes the blocker and
must run the newly reachable verifier matrix before returning the candidate.

## 8. Verification and acceptance

Implementation and remediation candidates:

- run `npm test`;
- run `npm run build`;
- complete implementer ledger evidence;
- capture required live/browser/visual artifacts; and
- commit only when the candidate satisfies the section's gates.

Final review:

- independently runs `npm test` and `npm run build`;
- independently exercises high-risk and user-visible ledger criteria;
- records the candidate's real SHA;
- completes reviewer evidence; and
- on pass, records acceptance and initializes the next section in the same
  commit.

The accepted history record retains the canonical acceptance-ledger path from
the manifest's configured starting section onward. Validation requires its
candidate SHA to equal `accepted_commit` and all reviewer criteria to remain
complete, even after live state moves to the next section.

No third full run is required solely to move fields between state records. A
current owner-approved inherited-red exception must be named in
`ACTIVE_CONTEXT.md`; it never generalizes and no new failure may be hidden
inside it.

## 9. Runners and relay

One-turn runners:

- `./scripts/phase10-claude-lead.sh`
- `./scripts/phase10-codex-implementation.sh`

Bounded serial relay:

```bash
./scripts/phase10-relay.sh --max-turns 6
```

Read-only check:

```bash
./scripts/phase10-relay.sh --check
```

The relay validates canonical state and active-context freshness before and
after every turn. It selects only the actor named by validated state, requires
one real commit plus state progress, and stops on STOP, lock, dirty tree,
invalid state, blocked/complete/Devan routing, non-zero runner exit, missing
progress, or its turn limit.

## 10. Failure and retry discipline

- Zero retries are automatic.
- Devan may manually authorize one retry after an ambiguous failure.
- A third consecutive attempt at the same blocked turn is refused.
- No sleep loop estimates quota reset.
- No actor changes role because a provider is unavailable.
- Safe drafting during provider downtime may occur only outside the live state
  transition and still requires the assigned lead/owner approval before
  implementation. A drafter cannot accept its own implementation.

The bounded preparation rules and draft contract live in
`docs/phase10-workflow/PROVIDER_OUTAGE.md`. This lane is manual and
owner-directed; the relay never enters it.

## 11. Commit and handoff discipline

- Implementation/remediation: `phase10(§N): <summary>`.
- Review/acceptance: `phase10(review §N): <summary>`.
- Workflow infrastructure: `phase10(workflow): <summary>`.
- The accepted implementation SHA is the candidate at the start of the passing
  review; a commit never attempts to contain its own hash.
- Handoffs remain under `docs/phase10-handoffs/` and carry only outcome,
  evidence, current route, and next action. They do not restate the protocol.
- Regenerate active context after every state or roadmap change and before the
  turn's final validation/commit.

## 12. Manual fallback

Manual operation remains:

1. Check STOP, lock, clean tree, workflow validation, and process list.
2. Run the actor named by state.
3. Inspect the state transition and current acceptance ledger.
4. Run the next actor only after the prior process exits and releases the lock.

Manual operation never waives a gate.

## 13. Workflow health report

Run:

```bash
npm run phase10:workflow:report
```

The read-only report validates the control plane and prints the live route,
always-read packet size, artifact counts, and sections with three or more
recorded review outcomes. Use `-- --json` for machine-readable output. Review
hotspots are a signal to improve the next specification, design proof, or
verifier matrix; they are not permission to relax acceptance.
