# Phase 10 workflow cockpit

This directory is the control plane for the Claude Lead ↔ Codex
Implementation relay. The July 28 upgrade makes the relay faster by removing
prompt and bookkeeping drag while making quality claims more explicit and
mechanically checkable.

## The bicycle upgrades

| Upgrade | Workflow equivalent | Practical effect |
|---|---|---|
| Lighter drivetrain | Canonical `workflow.json` + generated `ACTIVE_CONTEXT.md` | Each turn carries the live route and exact inputs instead of rereading the full trip diary |
| Better suspension | `DESIGN_GATE.md` + design-proof template | Visual direction is settled before production work absorbs late creative shocks |
| Disc brakes | Executable acceptance ledger | Speed increases without trusting vague “looks good” or “tests passed” claims |
| Quick shifter | Passing review accepts and advances in the same Claude turn | Removes one bookkeeping invocation and its redundant third full gate |
| Repair kit | `PROVIDER_OUTAGE.md` preparation lane | Useful work continues during quota downtime without role theft or self-approval |
| Bike computer | Read-only workflow health report | Live route, context weight, artifacts, and repeat-review hotspots stay visible |

## Daily commands

Validate before a Phase 10 turn:

```bash
npm run phase10:validate
```

Inspect the workflow:

```bash
npm run phase10:workflow:report
```

Run the network-free control-plane tests:

```bash
npm run phase10:workflow:test
```

Start the bounded serial relay:

```bash
./scripts/phase10-relay.sh --max-turns 6
```

Regenerate the active packet after state, roadmap, or operating-policy edits:

```bash
npm run phase10:context
```

The runners and relay reject stale generated context, so forgetting this step
fails safely before consuming a model turn.

## What did not change

- Claude owns product direction, specification, independent review, and
  acceptance.
- Codex owns implementation and bounded remediation.
- The agents remain serial and never review their own implementation.
- Implementation and final review each run the full test suite and production
  build independently.
- Privacy, security, authentication, financial correctness, and data integrity
  remain hard boundaries.
- `STOP`, the lock, clean-tree discipline, owner-gated routes, secret handling,
  and the prohibition on `vercel --prod` remain in force.

Start with `ACTIVE_CONTEXT.md` for the live turn. Use
`docs/PHASE10_AGENT_WORKFLOW.md` for the full operating contract and the
progress log only when historical evidence is needed.
