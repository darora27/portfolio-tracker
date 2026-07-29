# Operating guide — who does what, so nobody has to think about it

Owner-adopted, July 29, 2026. One page. If a situation isn't covered here,
`UNIVERSE_AUDIT.md` §3–§4 is the deeper law; the ledger is the single queue.

## The three seats + the consultant

**Devan — the eyes and the judge.** You look at screens and say sentences.
You never verify anything a machine can verify. Your jobs, in full: run the
relay when asked (`./scripts/phase10-relay.sh --max-turns 4`), run the camera
when asked (`npm run phase10:capture`), look at contact sheets / the running
app, answer in plain words ("trails are right now", "panel still too small"),
and make taste calls (pick tab-strip variant, boxes on/off, spacing verdict).
Anything phrased as "which looks right?" is yours. Anything phrased as
"is this true?" is a machine's.

**Opus — the translator and streamliner. Not a designer.** Opus's jobs:
translate machine state into plain English for Devan (what shipped, what's
waiting on him, 10 lines max); transcribe Devan's sentences into ledger rows
same-day (the intake rule); assemble section specs FROM adopted designs
(round 6 + audit — never inventing scope); do small mechanical fixes and
bookkeeping; run/monitor the relay; keep PHASE10.md and the ledger in sync.
Opus does NOT redesign anything, does NOT reopen settled decisions, does NOT
write new criteria beyond the caps (≤20/section, ≤12 visual), and does NOT
mark anything done — captures and Devan's sentences do that.

**Codex (via the relay) — the hands.** Implementation and remediation turns.
Budget note: Codex is the healthiest budget (74% until Aug 5) — route
implementation-heavy turns there; that is its seat anyway.

**Fable — the consultant. Expensive by design; used by decision, never by
default.** Consult Fable ONLY when a trigger below fires, and arrive with a
specific question plus the current contact sheet — never "take a look."

## Call-Fable triggers (the complete list)

1. An item Devan confirmed comes back broken, or the same complaint lands
   twice after "landed" — a circle is forming.
2. A section is on its **third** remediation loop.
3. Anyone (including Opus) wants to redesign something already adopted.
4. A genuinely new surface needs design (nothing adopted covers it).
5. A technical mystery survives one honest relay attempt (e.g. the 50ms
   long-task gate if `compileAsync` doesn't clear it).

Everything else — bookkeeping, translation, specs from adopted docs, small
fixes, reviews, captures — is Opus/Codex/Devan work. If Opus is unsure
whether something is a Fable problem, it isn't yet: run the loop once more.

## The loop (one burst ≈ one sitting)

1. Devan starts a relay burst: `./scripts/phase10-relay.sh --max-turns 4`.
2. When it stops for eyes, Devan runs the camera and looks (2 min).
3. Devan says sentences → Opus transcribes to the ledger, updates statuses.
4. Opus posts the plain-English digest: what landed, what's blocked, what
   Devan owes, what's next. Ten lines.
5. Repeat. **One burst per day is the pace** — Claude budget is ~50% for 5
   days, so cap relay bursts at `--max-turns 4`, keep Opus sessions short and
   batched (one sitting, not always-on), and let Codex carry implementation.

## The order of work (already decided — do not re-plan)

1. **Now:** commit the Fable drop (`FABLE_IMPLEMENTATION_HANDOFF.md`),
   Devan's 2-minute look, ledger updates, fix/retire the stale F4
   observation script.
2. **§11.R finish:** F2 (ASML anchor) + F3 (approach marks) with captures;
   zero `not_run` visual criteria at acceptance.
3. **§12a landing section:** spacing package (audit §5.1 numbers), exit
   receipt + terminal regroup, tab-strip A/B/C + boxes on/off as captures
   for Devan's pick, DRAFT rig three lines, logo scale-harness strip,
   long-task `compileAsync` fix. No new surfaces.
4. **§12b:** the Chart Room, then the sky (before/after pair for Devan).
5. **§13′ XLK** (small) · **§17′ trade form** (plain) · **§18 close-out.**
   §13/§15/§16 stay cut. Nothing gets added ahead of this list without
   Devan writing it down.

## Standing rules (the short form)

Feedback lands in the ledger the same turn it's spoken. Open debt blocks new
scope. Nothing is "done" without a capture or Devan's sentence. A re-report
of a done item halts the line until root-caused. Visual claims need pixel
evidence — "no browser available" means STOP and hand Devan the capture
command, never "deferred."
