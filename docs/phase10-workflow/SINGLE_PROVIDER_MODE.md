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

## PHASE10_SWAP_ROLES — implemented, does not work, do not use

Added July 29, 2026 to put the sighted agent on implementation, since Claude can
drive a browser on this host and Codex cannot. **It fails, twice over:**

1. **Lock ownership** — fixed in `a690a41`. The lock recorded which CLI ran, not
   which role was performed, so a swapped turn refused its own lock. The
   `PHASE10_LOCK_OWNER` / `PHASE10_LOCK_TASK` overrides resolve this.
2. **Prompt identity — unresolved.** The standing prompts declare their actor in
   their first line (*"You are OpenAI Codex acting as the implementation
   lead"*). A swapped agent reads that, correctly concludes it is the wrong
   actor, and stops without doing work. No lock or environment change reaches
   this; the prompt text itself is the blocker.

Making the swap work requires **actor-neutral prompt variants** — the same
stage instructions with the identity assertion removed and the role named by
stage rather than by vendor. That is a real piece of work and should be done
deliberately, not improvised.

**Until then the flag is inert in practice.** Leave it off. The default
arrangement — Codex implements, Claude reviews — is unaffected and remains the
proven path.

The underlying motivation stands and is worth revisiting: implementing blind and
reviewing sighted costs roughly one review round per visual defect, which is a
large part of why §10 needed five rounds and §11 is on its second.
