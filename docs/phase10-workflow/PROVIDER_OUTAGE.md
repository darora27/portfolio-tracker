# Phase 10 provider-outage preparation lane

Use this only when the actor named by valid live state is temporarily
unavailable and Devan explicitly asks the available actor to keep making safe
progress. It is a manual preparation lane, not a state-machine transition and
not a relay retry.

## Non-negotiable boundary

The unavailable actor keeps its assigned role. The available actor may prepare
inputs but may not impersonate the missing role, advance `PHASE10_STATE.json`,
approve its own work, or weaken a verification gate.

## Useful work by live stage

| Live stage | Safe preparation by the other actor | Forbidden |
|---|---|---|
| `specify` | Read-only repository audit, risk inventory, candidate acceptance criteria, test-map draft, reference inventory, or a clearly marked draft spec input | Production implementation, official specification, design approval, state advance |
| `implement` / `remediate` | Clarify existing spec ambiguities, prepare a review matrix, inspect historical failures, or identify reusable existing primitives | Editing the candidate, resolving findings as the wrong actor, state advance |
| `review` / `accept` | Organize existing evidence, identify missing artifacts, or prepare read-only commands for the reviewer | Final verification claims, acceptance, state advance |

Reusable workflow infrastructure may be changed only under a separate,
owner-directed request that clearly scopes that work, as Devan did for the
July 28 workflow upgrade. It must not be mixed into a product candidate.

## Draft contract

Place section-specific preparation under:

`docs/phase10-workflow/drafts/section-N-<topic>.md`

Every draft starts with:

```text
Status: PREPARATION ONLY — not an accepted spec, finding, or state transition.
Live route when prepared: §N / <stage> / <next_actor>.
Prepared by: <tool/model>.
Required adopter: <assigned actor or Devan>.
```

The draft separates observed facts from recommendations and links exact source
locations. It must not claim browser, visual, test, or build evidence that was
not actually captured.

## Returning to the normal lane

1. The assigned actor reads valid state and the active packet.
2. It independently checks the draft against current repository state.
3. It adopts, rewrites, or rejects the preparation in its official artifact.
4. Only the assigned actor performs the normal state transition.
5. The draft remains historical evidence or is removed in that actor's commit.

Outage preparation is successful when it shortens the assigned actor's next
turn without creating an ambiguous candidate or bypassing independent review.
