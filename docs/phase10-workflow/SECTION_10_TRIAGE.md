# §10 triage — the bounded exit

Recorded July 29, 2026 by owner direction, before the next review turn runs.

**Purpose:** convert an open-ended remediation loop into one decision. §10 has
had three review rounds with zero passes. This document says in advance what
happens after the fourth, so the outcome is a choice rather than exhaustion.

**This is not permission to weaken a gate.** It is permission to *stop* and
classify.

---

## The pattern this responds to

| Section | Review rounds | Passes | How it closed |
|---|---|---|---|
| §1 | 4 | 0 | Owner exception |
| §8 | 6 | 3 | Passed |
| §9 | 5 | 0 | Owner decision |
| §10 | 3 | 0 | — |

Three of the last four sections closed by owner decision rather than by a
passing review. That is a signal that some criteria are calibrated above what is
achievable, and the workflow currently has no way to discover that except by
grinding against them until the owner intervenes.

---

## The rule

**After the next review turn, remediation on §10 stops.** Every open finding is
sorted into exactly one of three buckets and §10 closes on that basis.

### Bucket A — achievable inside §10, finish it

Bounded work with a known mechanism and no unresolved question. One further
remediation is authorised *only* for findings in this bucket.

Current candidate: **F4 / VIS-12.** Two-thirds closed already. The contribution
bar no longer covers financial values, and four of seven bays render their
question once. Three remain — SCOPE, HAZARD, SIGNALS — and the fix is the
active-panel rule already working for PLOT and MANIFEST. This is a known change,
not an investigation.

### Bucket B — belongs to §11, do not fix twice

Findings whose real cause is scheduled for removal or rework in the next
section. Fixing them inside §10 means doing the work twice.

Current candidate: **F2 / BLD-04**, the long-task gate at 55–61 ms across four
attempts. Round 3's CPU profile attributes it to Three.js **shader-program
acquisition** — 34 ms of self time in `getParameters`/`getProgramCacheKey` — and
explicitly clears texture upload.

§11 is already specified to delete the embedded legacy dashboard along with its
Recharts instances, pause the radar off-screen, and lazy-mount below-fold
sections. Those reduce material and program permutations, which is exactly what
the profile points at. If F2 moves to §11 it must be recorded as **carried, not
closed**, with the measurement attached and §11's acceptance requiring it to
clear.

### Bucket C — not achievable as specified

Findings where the criterion asks for something the implementation cannot
deliver, for reasons the measurement itself demonstrates. These become a
documented, non-generalising owner exception with the measurement retained in
full — the pattern §1 established.

Current candidate: **F1 / TST-03.** Round 3's evidence identifies three
separable mechanisms, and one is structural: **the trail core is sub-pixel at
the OVERVIEW camera on outer orbits.** CBRS renders as a roughly one-pixel line
that necessarily blends with the void. A ΔE ≤ 8 match against a model colour
cannot be satisfied by a pixel that is physically part trail and part
background.

If that holds, the honest resolutions are: qualify the criterion by camera
distance or projected trail width, or record an exception. **Not** to loosen ΔE
until it passes — that would make the check meaningless everywhere.

The other two mechanisms round 3 found — the misplaced ASML sample point inside
the planet disc, and the additive glow washing four holdings lighter — are
bucket A or B and should be separated from the sub-pixel case rather than
bundled with it.

---

## What the triage turn does

1. Read the latest review's findings and evidence.
2. Assign every open finding to A, B, or C **with a stated reason**.
3. For bucket C, state precisely why the criterion cannot be met and what the
   measured ceiling is.
4. Set `status: blocked`, `next_actor: devan`, and hand the classification to
   the owner. **Do not self-authorise an exception.**

## What the owner then does

Approves the classification, authorises one bucket-A remediation if any exists,
records any bucket-C exception as non-generalising, and accepts §10.

---

## What this does not permit

- Weakening, redefining, or baseline-subtracting any gate to force a pass.
- Moving a finding to bucket B without naming the §11 work that resolves it and
  adding it to §11's acceptance criteria.
- Moving a finding to bucket C without evidence that the criterion is
  unsatisfiable, as distinct from unsatisfied.
- Treating a regression as achievable-by-default. F3 got worse between rounds 2
  and 3 (4 of 8 worlds failing became 6 of 8); a regression is evidence the
  mechanism is not yet understood, which is a bucket-A investigation or a
  bucket-C admission, not a silent carry.
