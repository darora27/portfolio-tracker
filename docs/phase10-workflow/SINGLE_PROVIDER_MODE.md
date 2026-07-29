# Single-provider mode

Authorised by Devan, July 29, 2026, for the OpenAI quota outage running until
approximately **August 3, 2026**.

This is distinct from `PROVIDER_OUTAGE.md`, which covers a short absence and
permits only preparation drafts. That lane cannot carry a week — it would
produce drafts and no progress. This mode lets work continue with named
compensating controls and an explicit record of what is degraded.

---

## What is suspended

**Cross-model independence.** Normally Codex implements and Claude reviews, so
findings come from a model with different training and no memory of the
reasoning that produced the code. That difference is what caught `/share`
leaking owner dollar amounts to a cookie-carrying browser, trails fogged to
black while a test asserting their opacity passed, and a gate pinned to a value
where it could not fail.

In this mode Claude performs both roles. **That is a genuine reduction in review
quality and must be recorded on every section accepted under it.**

## What is not suspended

The relay invokes each turn as a separate process with no shared memory. A
Claude review turn has no recollection of a Claude implementation turn — it
reads the spec, the ledger, and the artifacts cold, exactly as it would read
Codex's work.

**The loss is model diversity, not context isolation.** Every other guarantee —
the acceptance ledger, live browser verification, the privacy canaries, the
performance gates, the state machine, the lock — is unchanged and still binding.

---

## Compensating controls — mandatory while this mode is active

1. **The acceptance ledger's executable verifiers are required, not
   supporting.** Every criterion that can be checked by a script must be, and
   the raw output retained. Where cross-model judgement is unavailable,
   mechanical verification carries more of the load.

2. **No criterion may be graded from source reading alone.** The existing
   prohibition on `expect(source).toContain(...)` extends to review: a criterion
   about rendered behaviour requires a pixel, scene-graph, or DOM measurement.

3. **Owner visual review before acceptance.** No section is accepted in this
   mode until Devan has run it and given feedback. He is the independent check
   while the second model is unavailable — and across §7 through §10 his eyes
   caught more real defects than any criterion did.

4. **Sections accepted under this mode are flagged.** `sections_history` records
   `single_provider_mode: true`. If a later section exposes a defect that
   cross-model review would plausibly have caught, that flag says where to look.

5. **The implementer writes evidence, not argument.** Implementation handoffs
   state what was measured and what was not. A reviewer must be able to grade
   from artifacts without reading the implementer's reasoning.

---

## What must wait for Codex

Work where cross-model review is load-bearing rather than nice to have:

- **Any change to the privacy boundary** — what `/share` renders, the
  authenticated/public split, the canary tests. A single model that reasons
  itself into a leak will review itself into agreeing with it.
- **Any change to the financial math core** — TWR, XIRR, drawdown, beta,
  Sharpe, volatility.
- **Weakening, redefining, or granting an exception to any gate.** Requires
  either Codex or an explicit owner decision.

If a section needs one of these, do the rest and stop at that boundary rather
than proceeding alone.

---

## Operating it

The relay's routing is unchanged; only the runner for the implementation role
changes. Run implementation turns with the Claude runner while state says
`next_actor: codex`:

```bash
PHASE10_CLAUDE_MODEL=opus ./scripts/phase10-claude-lead.sh
```

The turn must open by recording that it is acting under single-provider mode and
which role it is performing, then follow that role's normal prompt and
transitions.

**Do not edit the state machine's role values.** The record should show that
Claude covered a Codex turn, not that the workflow was rewritten around an
outage.

---

## Ending it

When OpenAI quota returns, resume normal routing with no ceremony. Optionally,
the first Codex turn afterwards may re-review the most recently accepted
single-provider section — worthwhile if that section touched anything on the
"must wait" list, unnecessary otherwise.

Remove this mode's active flag from state; leave the per-section
`single_provider_mode` markers in `sections_history` permanently as historical
record.

---

## PHASE10_SWAP_ROLES — working as of July 29, 2026

Puts the **sighted** agent on implementation. Claude can drive a browser on this
host and Codex cannot, so the default arrangement implements blind and reviews
sighted — which costs roughly one review round per visual defect. That is a
large part of why §10 needed five rounds, and why "no logos are visible" was
reported four times while each attempted fix was made by an agent that could not
look at the result.

### Two failures, both now fixed

1. **Lock ownership** — fixed in `a690a41`. The lock recorded which CLI ran, not
   which role was performed, so a swapped turn refused its own lock. The
   `PHASE10_LOCK_OWNER` / `PHASE10_LOCK_TASK` overrides resolve this.
2. **Prompt identity** — fixed by making both standing prompts actor-neutral.
   They previously opened *"You are OpenAI Codex acting as the implementation
   lead"*, so a swapped agent read that, correctly concluded it was the wrong
   actor, and stopped. Each prompt now addresses a **role**, and carries a
   "Who you are" section stating explicitly that `codex_implementation` and
   `claude_lead` are **stage names, not claims about which model is running**,
   and that a turn is graded on the lock and state values rather than on the
   agent's own vendor identity.

**State machine role values were not touched.** `role=codex_implementation`
still means the implementation stage regardless of who runs it, so the history
continues to record which stage ran and who covered it.

### Running it

```bash
PHASE10_SWAP_ROLES=1 PHASE10_CLAUDE_MODEL=opus ./scripts/phase10-relay.sh --max-turns 8
```

Verified routing for all four combinations:

| `next_actor` | swap | CLI that runs | prompt used | lock owner |
|---|---|---|---|---|
| codex | 0 | codex-implementation.sh | codex-implementation.md | codex |
| **codex** | **1** | **claude-lead.sh** | **codex-implementation.md** | **codex** |
| claude | 0 | claude-lead.sh | claude-lead.md | claude |
| **claude** | **1** | **codex-implementation.sh** | **claude-lead.md** | **claude** |

### The tradeoff — read before choosing

The swap does not make things strictly better. It moves a limitation:

- **Gained:** the implementer can see what it built. Visual criteria get fixed
  and confirmed inside one turn instead of bouncing through review.
- **Lost:** the reviewer cannot launch a browser. It can run every executable
  verifier in the ledger and grade from numeric output — that path is fully
  intact — but it cannot make the *"the planet is sitting too far right"*
  judgement that a person or a sighted agent makes by looking.

The lead prompt handles this honestly: a blind reviewer marks judgement-only
visual criteria `carried_by_owner` with a note naming what must be looked at,
and never invents an observation it did not make. Devan reviews every section
before acceptance and is the standing visual check, so this costs less than it
appears — but it is a real reduction and should be a deliberate choice.

**Use the swap when a section's findings are predominantly visual.** Use the
default when they are predominantly logical, privacy-related, or mathematical.

**Cross-model independence is preserved either way** — the two stages still run
under different providers. This is not single-provider mode.
