# The Stock Market Universe — full project audit, and the plan that stops the circles

Written July 29, 2026, against the tree at head. Not a design round. Every
factual claim below was checked against the repository this evening — file
mtimes, the acceptance ledgers, the review records, the state machine, and
the source itself. Where I write a number, I counted it.

The owner's sentence this audit answers: *"I have given you so much feedback
and you have come up with so many ideas and now it feels like they are not
being implemented during these relays… I feel like we are just running in
circles."*

**He is right, and the audit's central verdict is simple: the designs are not
the problem. The delivery loop is.** Of the twelve recurring complaints, not
one traces to a wrong design. Three are actually *fixed in the shipped code
and nobody ever showed him*. The rest are either designed-and-adopted but
sitting unbuilt behind a stalled state machine, or were never entered into
the one file build turns read. The feeling of circles is accurate because the
loop genuinely circles: he reports → a design answers → the build doesn't
land it (or lands it invisibly) → nothing shows him either way → he reports
again.

---

## 1. What is actually wrong — five findings, with receipts

### Finding 1 — since round 6 was adopted, zero product code has changed

The owner adopted round 6 in full (*"full throttle ahead"*), it was scheduled
as §12, and the roadmap was renumbered. Since then the repository shows:

- **`src/` is byte-identical to the §11 implementation.** The newest file
  under `src/` is `lib/observatory/draft-return.ts` from the §11 build.
  Nothing after it.
- Every file changed since is documentation: `PHASE10.md` (§12 inserted),
  `PHASE10_STATE.json`, the §11 spec re-edit, `IMPLEMENTATION_SPEC.md` (a
  72KB historical record of how the relay was bootstrapped),
  `SINGLE_PROVIDER_MODE.md`, both standing prompts, `AGENTS.md`,
  `ACTIVE_CONTEXT.md`, the ledger, and the audit brief itself.

The machine state says §11 is in `remediate`, `status: ready`,
`next_actor: codex` — and that turn has not run. Meanwhile the process wrote
roughly 250KB of coordination documents. From the owner's chair this is
exactly *"ideas… not being implemented during these relays."* The relay is
not running in circles; **it is standing still while the documentation walks
in circles around it.**

### Finding 2 — the intake failure is real, and it is now half-fixed

Confirmed exactly as the brief describes. The spacing complaint —
*"either make the sun bigger and everything more spaced out, or make the
planets smaller"* — sits in `UNIVERSE_ROUND4_BRIEF.md` §4, along with the
observation that the composition clusters centre-left. It reached
`OWNER_FEEDBACK_LEDGER.md` **only this evening**, as §3.0.1, with the honest
note "never entered here until now." Between round 4 and now, four specs were
written by turns that read the ledger, and none of them was ever told the
planets were too close. The failure was not disobedience; it was a missing
row in the one file that gets read.

The half that is still broken: the ledger has no *statuses*, no IDs, and no
rule forcing a spec to face its open items. The spacing row exists now; the
mechanism that would have caught its absence still doesn't. §3 fixes that.

### Finding 3 — recorded feedback can still be legally skipped

*"The background is still meh"* has been in the ledger since it was said,
survived §11 untouched, and now waits inside §12 — behind a remediation that
isn't running, inside a section that bundles six designs. Nothing in the
process makes an open ledger item *block* anything. A spec that schedules
zero owner items while ten sit open is currently a valid spec. That is the
deprioritisation channel, and it is wide open.

### Finding 4 — the verification apparatus has never seen the screen

The numbers, from the acceptance ledgers at head:

| Section | Criteria | Implementer deferred to reviewer | Reviewer outcome |
|---|---|---|---|
| §10 | 77 | **40** | 71 pass, 6 carried — while the authoritative review-5 says **FAIL**; accepted by owner decision |
| §11 | 54 | **41** | **45 `not_run`**, 4 fail, 4 pass, 1 blocked — reviewer's browser never launched |

The §11 review records *why* nobody looked: the agent sandbox on the owner's
machine cannot launch Chromium — *"cached Chromium rejected by the host's
Mach rendezvous permission boundary."* So the implementer defers visual
criteria to the reviewer, the reviewer's browser is blocked, the criteria
land as `not_run`, and the section proceeds on DOM greps and build exits.
"Eight planets exist in the DOM" passes while nobody can say what the frame
looks like. The G-EVIDENCE gate exists on paper and is structurally
unsatisfiable in the environment the relay runs in.

Consequence, exactly as the brief says: **the owner's eyes are the only
camera this project has ever had** — which also explains Finding 5.

### Finding 5 — three of his complaints are already fixed, and nobody showed him

Because nothing produces captures, fixes that *land* are indistinguishable
from fixes that don't. At head:

- **Trails were shortened** — `MIN_TRAIL_DEGREES = 26, MAX = 46` shipped in
  §11, down from 36–64°, between the two bands as asked. He has never been
  shown a before/after. The audit brief itself still lists trails as
  unfixed — the circle is now eating its own auditors.
- **News headlines are real links** — the §11 room and panel render
  `<a href>` to the article and filter out unlinkable items.
- **A correlation explanation exists** — the CORRELATION section ships a
  plain-language paragraph ("When holdings move together, this portfolio has
  fewer independent paths…"). It is generic rather than about *his* named
  pairs, so it half-answers him — but it exists, and he has never been told.

An invisible fix costs double: the work, and then the re-report that makes
the work look ignored. The cure is the same camera as Finding 4.

---

## 2. Every recurring item, separated: design wrong vs build didn't land

The separation the brief asked for. **Verdict vocabulary:** `NEVER-ENTERED`
(feedback lost before the ledger), `DESIGNED · UNBUILT` (design adopted,
no code), `LANDED · UNSHOWN` (in the shipped code, never verified on
screen or confirmed by him), `NEEDS MEASUREMENT` (can't be fixed until
someone looks), `NO DESIGN YET` (needs an answer, given in §5).

| # | Item | Design answer | Build state at head | Verdict |
|---|---|---|---|---|
| 1 | Planets too close / frame unused | §5.1 of this audit (numbers + assertion) | radii [0.8, 1.7], gap 1.6×(rᵢ+rᵢ₊₁), unchanged since round 5 | **NEVER-ENTERED → NO DESIGN YET → answered in §5.1** |
| 2 | Background "meh" / TVA register | Round 6 §2, five moves, adopted | CSS star tiles, flat nebula, 0.02-floor aurora — all still at head | **DESIGNED · UNBUILT** (§12) |
| 3 | Trails too long | §11 spec set 26–46° pending his eye | **26–46° is in the code** | **LANDED · UNSHOWN** |
| 4 | No logos visible | Round 3 carved marks; round 6 didn't touch it | marks in textures; invisible at 44–64px overview; §11 review F3 open | **NEEDS MEASUREMENT** (§5.3) |
| 5 | Small fonts unreadable | Round 6 §5 — the five-token ramp | 125 declarations, 44 sizes, 64% ≤ 11.5px — untouched | **DESIGNED · UNBUILT** (F1, critical) |
| 6 | Cursor has no flight | Round 6 §3 + mock, tuned by him (holds heading) | rocket still pinned 1:1 at −35° | **DESIGNED · UNBUILT** |
| 7 | Planet sits too far right (ASML) | Round 5 left-third anchor, x ≈ 30% | not landed; §11 review F2 open | **DESIGNED · UNBUILT** |
| 8 | Tab strip looks wrong | Round 6 §4.2 — variants A/B/C for his judgement | 9px boxed tabs unchanged | **DESIGNED · UNBUILT** |
| 9 | Exit terminal too much | Round 6 §4.1 — receipt + regrouped terminal | `:focus-within` accident unchanged | **DESIGNED · UNBUILT** |
| 10 | News must hyperlink | (simple compliance) | **real `<a href>` links shipped in §11** | **LANDED · UNSHOWN** |
| 11 | Correlation not understood | Round 6 named-pair sentence; §11 generic paragraph | generic paragraph shipped; named-pair sentence not | **HALF-LANDED · UNSHOWN** |
| 12 | DRAFT rig: off-design, hidden, too fast, unclear | Round 4 built ~faithfully (tape, GHOST, pit rail all present) — three real gaps | motion defaults ON, dish laps 9–28s vs scene minutes, latch buried in footer, no coach line | **LANDED · 3 GAPS** (§5.4) |
| — | Chart Room | Round 6 §1 + owner-reviewed mock | nothing | **DESIGNED · UNBUILT** (§12) |
| — | Glow on type; thin-box test | Owner additions, recorded in §12 | untouched | **DESIGNED · UNBUILT** |
| — | XLK system | Ledger §7 sequence; `systems/README.md` done | `xlk.json` not started | **SCHEDULED · UNSTARTED** |
| — | Long-task 50ms gate | breached 55–65ms, five rounds; cause: shader acquisition | unchanged | **NO DESIGN YET → answered in §6, §12a** |

Read the verdict column top to bottom and the pattern is unmistakable:
**zero rows say "the design was wrong."** Two say the feedback never reached
the build. Three say the fix landed and died in silence. Eight say the design
exists, was adopted, and is queued behind a machine that has stopped moving.
That is the audit: this project does not have a design problem or even mainly
a code problem — it has a **custody problem** (feedback → ledger), a
**throughput problem** (adopted design → landed code), and an **evidence
problem** (landed code → his eyes). Three pipes, all leaking at the joints.

---

## 3. The fix for the circles — the mechanism

Design principle: every rule below attaches to a file and a validator that
already exist (`OWNER_FEEDBACK_LEDGER.md`, `phase10:validate`,
`phase10:acceptance -- check`, the spec preflight). No new coordination
documents — this project has enough of those. Four rules with teeth:

### Rule 1 — the ledger becomes a tracker, and intake is a turn obligation

Delivered alongside this audit: **`OWNER_FEEDBACK_LEDGER_v2.md`** — the same
file restructured so every owner item is a row with an ID (`FB-nn`), his
verbatim words, a count of times reported, a **status**, and a **closes-when**.
The status vocabulary, which is the whole trick:

```
open → designed (→doc §) → scheduled (→§n) → landed (→commit)
     → verified (→capture)  → CONFIRMED (his words, quoted)
plus: regressed · needs-owner · retired
```

Two hard rules ride on it:

- **Intake in the same turn.** Any turn that receives owner feedback — a
  review, a brief, a conversation note — transcribes it to ledger rows
  *before doing anything else*. A design round or spec turn whose source
  brief contains owner quotes not present in the ledger is invalid. (This
  is what would have caught spacing in round 4 — the quote was in the brief
  and nowhere else.)
- **Only two things close a row.** A `CONFIRMED` quote from the owner, or a
  committed capture for items he delegated to measurement. `landed` is not
  done. `pass` in a criteria ledger is not done. This kills Finding 5's
  failure mode: trails/news/correlation would today read `landed → awaiting
  contact sheet`, and everyone — including him — could see exactly where
  they stand.

### Rule 2 — debt blocks scope

Standing rule, enforced at the spec gate: **a section spec must open with a
table of every `open`/`designed` ledger row, each marked `scheduled here`,
`scheduled §n`, or `deferred — owner initials`.** The *owner* defers items,
not the agent; a spec that silently omits an open row fails validation
(mechanically: every `FB-nn` with status open/designed must appear in the
spec's table — a ten-line check in `phase10-validate-state.mjs`).

And one stronger clause, for right now: **while five or more rows sit
`open`/`designed`, the next section must be a landing section** — fixes and
confirmations only, no new surfaces — unless the owner overrides in writing.
The queue must drain before it grows. This is the forcing function the brief
asked for.

### Rule 3 — the re-report alarm

If the owner reports something already marked `landed`/`verified`/`CONFIRMED`,
the row flips to **`regressed`** and the next section cannot start until a
turn root-causes it into one of: never actually landed / landed then broken /
landed but the design missed. This is the circle detector — the exact event
that has been happening silently ("small fonts", three sections running)
becomes a loud, blocking event with a named cause.

### Rule 4 — acceptance cannot outrun evidence

Changes to `phase10:acceptance -- check`:

- `deferred_to_reviewer` remains legal **within** a section, but a section
  cannot pass review while any visual criterion is `not_run`, `deferred`,
  or `blocked`. Zero exceptions by an agent; an owner exception names each
  criterion individually (the §10 pattern of 40 deferrals riding through
  is retired).
- A `VIS-*` criterion may not be satisfied by DOM presence, source greps, or
  build exit codes. Its evidence field must reference a capture or a
  sampled-pixel/geometry measurement (§4).
- When no browser can launch, the turn ends at a new terminal status:
  `needs-capture`, `next_actor: devan`, with the *one command* he must run
  (§4.2). The machine stops honestly instead of proceeding blind.

These four rules are the answer to "where feedback lives, what forces a
build turn to address it, and what happens when it can't": it lives in the
ledger as rows with statuses; the spec gate forces every open row to be
faced; and when a turn can't address something, the row says so, with a
named owner decision — never silence.

---

## 4. The visual-truth standard

**The principle: a claim about pixels requires evidence made of pixels.**
Three evidence classes, in order of preference:

1. **A capture** — a committed PNG from the repo's own harness, at a named
   viewport (1440×900 primary), a named URL/state, and **fixture data**, so
   it is deterministic and secret-free.
2. **A measurement** — sampled pixels or projected geometry, from the capture
   or live scene. The project already knows how: the sphere-strip luminance
   audit, the ring-alpha floor sample, the trail hue lock. Extend that
   pattern; it is the house's best invention.
3. **The owner's sentence** — for taste verdicts (spacing "looks right",
   background "not meh"), recorded verbatim into the ledger. His eyes stay
   the final gate; the standard's job is to make sure they arrive *last*,
   after machine eyes, not *instead* of them.

### 4.1 The contact sheet — the artifact that ends "done when it is not"

Every section review produces
`docs/phase10-baseline/section-N/contact-sheet.md`: **at most twelve
captures**, each with a one-line caption naming the criteria and ledger rows
it evidences. The owner reviews the sheet — two minutes — and his responses
are intake-transcribed (Rule 1). Acceptance requires the sheet to exist and
every visual criterion to point into it. This is also the delivery vehicle
for Finding 5: the §11.R sheet will contain the shortened trails, the linked
news, and the correlation paragraph — three "open" items that may close on
his say-so within minutes of him seeing them.

### 4.2 Solving the camera problem — because right now no agent can look

The Mach-rendezvous block is real: agent sandboxes on the Mac cannot launch
Chromium. Three lanes, in order:

1. **The owner runs the camera.** `npm run phase10:capture -- --section 11`
   — a Playwright script, run from a normal terminal *outside any agent
   sandbox*, where Chromium launches fine. (The timing scripts already
   drive headless Chromium contexts this way; the harness makes that a
   first-class devDependency and an npm script instead of an ad-hoc file.) It boots next dev against fixture
   data, walks a declared shot list, writes the PNGs, exits. Two minutes of
   his time, already less than he spends reviewing blind builds.
2. **A cloud session runs it.** This audit's round-6 mock was verified in
   exactly this way — headless Chromium, screenshots, a real rendering bug
   found (`position:fixed` without `top/left`) that no DOM grep could ever
   have caught. That is the standard working, demonstrated on this very
   project. A capture-only cloud turn needs the repo and fixtures, no
   secrets.
3. **Fix the local sandbox** (grant the runner browser permission for the
   one capture command). Worth one attempt; not worth blocking on — lanes 1
   and 2 exist today.

Requirement on the harness itself: a **fixture mode** — deterministic demo
holdings behind a flag (the dev orrery route is most of the way there) — so
captures never depend on live Supabase/Finnhub state or `.env` secrets, and
so before/after pairs are pixel-comparable.

### 4.3 The criteria diet

54 criteria in §11 was not rigor; it was surface area nobody could cover —
41 were deferred on arrival. Cap sections at **~20 criteria, at most 12
visual**, each visual one answerable by a single named capture or
measurement. A criterion that cannot say which contact-sheet frame proves it
does not get written. Fewer claims, all of them true — the same trade the
owner keeps asking for in the product itself.

---

## 5. The design answers owed — and only these

The brief asked for design only where a recurring item cannot be fixed
without one.

### 5.1 Spacing — the full answer

His sentence offers the trade: sun bigger / more space / planets smaller.
The sun is settled (≥ 1.6× the largest planet, measured in pixels — round 5,
landed). So spend the other two:

- **Planet radii: [0.8, 1.7] → [0.62, 1.35]** (≈ −21% linear). Weight still
  maps by √weight; identity survives (the 32px test was passed by colour +
  silhouette, not diameter).
- **Orbit gaps: `1.6 × (rᵢ + rᵢ₊₁)` → `1.75 × (rᵢ + rᵢ₊₁) + 0.55`.** The
  additive constant is the actual fix — today two large adjacent planets can
  legally orbit with near-zero visual channel between rings; the constant
  guarantees daylight even in the worst pairing. Smaller planets + larger
  gaps compound: ring-to-ring clearance roughly doubles for the inner
  system, and the fitted 88% belt span spends the recovered space outward.
- **The sun's dominance rises for free** — its floor stays `max(2.8, 1.6 ×
  largest)`, and the largest just shrank.
- **Do not fake positions.** The centre-left cluster he saw is transient
  orbital phase; with full rings visible (landed in §11) the *paths* fill
  the frame even when the planets bunch. Restated from round 5 because it
  will tempt again.

**Acceptance, two-part, per this audit's own rules:** (1) measured — at the
1440×900 overview capture, minimum edge-to-edge distance between any two
adjacent planet discs at closest approach ≥ 1.0× the larger disc's diameter,
computed from the existing projection helpers; (2) **CONFIRMED — the row
closes when he says the spacing looks right, and not before.** (Already so
marked in ledger v2.)

### 5.2 Background — no new design; a proof obligation

Round 6 §2 stands adopted: delete the tiled CSS star wallpaper, floor the
aurora at `0.14 + wildness × 0.26`, give the nebula a filament texture, add
the black vignette + warm grain frame, graticule disposable. The only thing
this audit adds: **"meh" is a taste verdict, so the section must produce a
same-fixture before/after pair on the contact sheet**, and the ledger row
closes only on his sentence. If the five moves land and he still says meh,
*that* — and only that — is the moment this becomes a design problem again,
and it will be a well-posed one, with pixels on the table.

### 5.3 Logos — measure before touching anything, then accept the physics

Five reports, four texture regenerations, each moving less than measurement
noise — the definition of a circle. The hypothesis nobody has tested: at
overview scale a planet is 44–64px, so a carved capital is a handful of
pixels; **no texture regeneration can fix arithmetic.** The §12a harness
step: render the *shipped* textures on discs at 44/56/64px and at approach
scale, crop the mark region, and put the strip on the contact sheet.
Predicted outcome, stated so it can be falsified: overview marks are
unreadable at any texture quality; approach marks are readable and F2/F3
(anchor + camera exposure at approach, where `renderExposure` spans 1 to 12
across worlds) are the actual fixes. Then the honest design position, for
his sign-off, already implicit in round 3: **at overview, identity is
colour + silhouette + emissive; the mark is the approach-scale reward,
guaranteed by brand-first entry.** If he wants a mark visible from orbit,
the design answer is a label chip or flag object, not a fifth regeneration —
his call, made looking at the measurement strip.

### 5.4 The DRAFT rig — three gaps, three lines

The rig is closer to round 4 than the complaint suggests (tape banner,
GHOST, pit rail, rack — all present). The real gaps: **(1)** motion defaults
ON — flip to OFF for everyone; stillness until *he* flips it (fiddling is
the verb; watching was never the point). **(2)** dish laps run **9–28
seconds** (`DraftRig.tsx`, the `--draft-speed` formula) against scene
orbits measured in minutes — that is the "too fast." Slow the band to
30–90s, still magnitude-ordered. **(3)** discoverability + first use: the
`DRAFT · 🚀` latch also appears in the strip nav (owner view), and first
open shows one coach line, visible not just aria-live: `PULL A CIRCLE — THE
OTHERS BREATHE. DRAG INTO ANOTHER TO SIPHON.` Close on his confirmation.

### 5.5 Trails, news, correlation — no design; show him

Trails at 26–46° and linked news are done pending his eyes. Correlation
completes with round 6's named-pair sentence (template, ≤ 14 words, from his
own top |r| pair) added to the shipped generic paragraph; the row closes
when he can say back what it tells him about his book.

---

## 6. The sequenced plan — and what gets cut

Ordering principle, from his own sentence: **fewer things that land.** Every
numbered block below ends with him looking at a contact sheet.

**Now — §11.R (remediation, already routed; finish it, small):**
F1 fonts — implemented as round 6's five-token ramp rather than a one-off
nudge (same size diff; a one-off would be re-done in weeks and this is the
item's *fourth* appearance — called conflict, position taken). F2 ASML
anchor. F3 approach-scale mark visibility (camera/exposure only — no
texture regeneration, per the ledger's own rule). F4 SINCE BUY vs MAX
detents. **Plus the capture harness + fixture mode + the §11.R contact
sheet** — which also carries the trails/news/correlation confirmations from
Finding 5. Acceptance: zero `not_run` visual criteria. This is one bounded
codex turn plus one capture run.

**§12a — the landing section (debt only, no new surfaces):**
spacing package (§5.1) · cursor flight model (round 6 §3, mock-tuned,
heading holds) · exit receipt + regrouped terminal · glow-on-type reduction ·
tab-strip variants A/B/C and thin-box on/off — *as captures for his
judgement, build nothing final* · DRAFT rig's three lines (§5.4) ·
correlation named-pair sentence · logo scale-harness strip (§5.3,
measurement only) · **the long-task fix**: move shader-program acquisition
into `renderer.compileAsync` (KHR_parallel_shader_compile) inside the
existing staged warmup so program linking never rides a frame — then
re-measure the five-context figure against the unchanged 50ms gate. Every
item here closes or advances a ledger row; the section's contact sheet
should close half the open board in one owner sitting.

**§12b — the two genuinely new builds from round 6:**
the Chart Room first (his biggest ask — strip, graph with
MODE/VOO/BOOK/DEPTH/TRADES/COST, the four-instrument bench, plates; lazy;
zero route-load), then the sky (§5.2's before/after obligation). Two
implementation turns, two sheets.

**§13′ — XLK, small:** `systems/xlk.json` + hollow-core sun render behind
the flag + a labelled door (never an accidental zoom — the round 5 rule).
The ball he asked to get rolling, rolled, without committing the galaxy.

**§17′ — the trade-entry form,** plain, owner-only — the one genuinely
missing piece of the fold-into-Mission-Control decision. Plain because it is
used rarely and correctness beats atmosphere (recommendation already on
file; needs his yes).

**§18 — integration close-out** as written (fonts self-hosted, resilience,
full-experience acceptance) — now runnable against a criteria set that can
actually be verified.

**Cut, plainly, with the reason said out loud:** the roadmap ahead still
carries five sections of the pre-universe product. The owner already decided
their fate on July 28 — *"remaining sections fold into Mission Control;
universe matters most; trim the deeper routes to whatever is simplest that
works"* — and the roadmap never absorbed the decision. So: **§13
(`/compare` guided sim story) — cut**; the canned scenarios retired with
`/compare` when the DRAFT rig replaced it (round 4 §8, accepted). **§15
(`/research`) — cut**; NEWS + moons absorbed it; Reddit stays parked until
the owner clarifies which problem it solves (ledger D3). **§16 (`/history`)
— cut**; the aurora, RETURNS, and the Chart Room's DEPTH carry it. **§14
(after-hours) — stays parked** unless he re-raises it. What remains after
the cuts is six blocks, every one of which ends with something he can see.

---

## 7. My own part in the circle

Six design rounds kept answering forward while the build fell behind, and
answering was the easy half. Round 6 bundled six designs into one adopted
block, which became one §12 too large to start while §11 bled — so "adopted
in full" quietly became "queued in full," and from the owner's chair,
adopted-and-queued is indistinguishable from ignored. And the recurring
items kept being *re-designed* (fonts, three times) when what they needed
was custody and a camera. The audit brief itself carried a stale item —
trails, fixed in the tree it was written against — because even the
auditing layer works without captures. The structural consequence, binding
on me: **no future design round may exceed what one section can land and
verify**, and every round opens with the ledger board, not the new brief.

---

## 8. The first 48 hours — what Devan actually does

1. **Adopt the tracker:** replace `OWNER_FEEDBACK_LEDGER.md` with the
   delivered `OWNER_FEEDBACK_LEDGER_v2.md` (one rename; the old file's
   every line survives, now with IDs and statuses). Skim the board — it is
   the first complete picture of your own feedback this project has had.
2. **Adopt the four rules + the capture standard:** paste the §3/§4 rule
   blocks into `AGENTS.md` and the two standing prompts (a ready-to-paste
   appendix is at the bottom of ledger v2), and have the next Claude Lead
   turn add the two validator checks (spec-faces-the-board;
   no-not_run-visual-acceptance).
3. **Run the relay** for §11.R with the amended remediation scope (F1 as the
   ramp; + harness). When it reaches `needs-capture`, run
   `npm run phase10:capture` in a plain terminal — or hand the capture turn
   to a cloud session.
4. **Review one contact sheet.** Expect to close FB-03 (trails), FB-10
   (news), and judge F1/F2 on pixels — the first time in eleven sections
   that "done" will arrive with a picture attached.

Then §12a, and the board drains instead of growing.

---

*Companion file delivered with this audit: `OWNER_FEEDBACK_LEDGER_v2.md` —
the proposed replacement ledger: every §2/§3 item re-carried with IDs,
verbatim quotes, statuses grounded in this audit's code evidence, and
closes-when conditions; plus the ready-to-paste rules appendix. Nothing was
dropped in the conversion; three rows arrive pre-marked `landed → awaiting
your eyes`, which is the whole point.*
