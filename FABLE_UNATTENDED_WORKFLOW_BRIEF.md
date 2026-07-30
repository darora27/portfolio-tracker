# Fable — design the Claude-only unattended workflow

Owner request, July 29, 2026. **Do not touch the repository or the state
machine; a 4-turn relay is running as this is written.** The deliverable is a
plan, plus whatever documents/scripts it needs, applied afterwards.

---

## 1. The constraint

- **OpenAI credit is spent after the currently running turn.** Codex is
  unavailable for roughly two days. Claude only.
- **Devan will be away from his computer for most of those two days.** He wants
  **long sessions** that make real progress unattended, not the current
  one-burst-per-sitting rhythm.
- Claude budget guidance on file (`OPERATING_GUIDE.md` §the loop): ~50% for 5
  days, cap bursts at `--max-turns 4`, one burst per day. **His request
  contradicts that cap.** Resolve it explicitly rather than silently.

## 2. The conflict you actually have to solve

The next section is **§12a, the landing section.** We counted its rows. Of the
eleven queued:

| | rows |
|---|---|
| **Close only on Devan's judgement** | **9** — FB-01, FB-05, FB-08, FB-09, FB-11, FB-12, FB-15, FB-17, FB-21 |
| Machine-checkable | 2 — FB-19, FB-20 |

Their closes-when conditions are literally *"he picks a variant"*, *"he reads
Mission Control without squinting"*, *"he says Mission Control uses its
space"*. **§12a is the most owner-gated section in the roadmap, and it lands
exactly when he is least available.**

Worse, the camera is his too. Agent sandboxes on this Mac are denied Chromium
at the Mach-port boundary — confirmed three separate times today. Every visual
criterion therefore routes through him, and the adopted visual-truth rule
(correctly) forbids deferring instead: a turn that cannot get pixels **must**
stop at `needs-capture` / `next_actor: devan`.

**So a long unattended Claude run, as things stand, hits a capture wall within
one or two turns and idles until he comes back.** That is the thing to fix.
And it must be fixed without reintroducing the failure that cost this project
eleven sections: 41 visual criteria deferred in one section, accepted anyway,
his eyes the only review that ever happened.

## 3. The distinction we think the answer turns on

A row can be **advanced** without him even when it cannot be **closed** by him:

- **FB-05 (fonts, 5th report, blocking §12a)** closes on *"he reads Mission
  Control without squinting"* — but the actual fix is fully machine-assertable.
  §11 root-caused it: the type ramp's gate constrains *legal values*, not
  *semantic roles*, so Mission Control satisfies the gate while still being
  unreadable. Mapping each text role to a ramp token and asserting the
  **mapping** is a computed-style test. That can land, with confidence, while
  the verdict waits.
- **FB-08 / FB-15 / FB-17** are explicitly *"capture the variants, he picks."*
  The building and capturing is unattended work; only the pick is his.

If that distinction is right, an unattended run should front-load everything
mechanically verifiable and **stack a single review sitting** for his return —
one contact sheet, one batch of verdicts, many rows closing at once.

## 4. What already exists — use it, don't redesign it

- **`docs/phase10-workflow/SINGLE_PROVIDER_MODE.md`** — the adopted lane for
  exactly this outage. Compensating controls, what stays binding, and a
  reserved list of work that must wait for Codex: **the privacy boundary, the
  financial math core, and any gate change.** We checked: **§12a touches none
  of them**, so §12a is cleared for single-provider.
- **`PHASE10_SWAP_ROLES=1`** — now works. Both standing prompts were made
  actor-neutral today, so Claude can run either seat. Claude implementing *and*
  reviewing loses cross-model independence; SINGLE_PROVIDER_MODE already names
  the compensating controls for that.
- **`npm run phase10:evidence -- 11`** — one command: build, serve, measure the
  50ms gate, capture, verdict, tear down. Written today after the third capture
  round trip.
- **`npm run phase10:capture -- --section N`** — the shot-list harness.
  Fixture-capable, `/share` by default, secret-free.
- **`UNIVERSE_AUDIT.md` §4.2** already names three camera lanes: (1) the owner
  runs it, (2) **a cloud session runs it**, (3) fix the local sandbox for the
  one capture command. Only lane 1 has ever been used.

## 5. What we are asking you for

1. **Solve the camera.** This is the load-bearing question. Lane 2 or lane 3
   from audit §4.2, or something better. If neither can be made to work in two
   days, say so plainly and design around it instead of assuming it away.

2. **A run shape that survives being unattended.** Concretely: what does Devan
   type before he walks away, how many turns, and what does the relay do when
   it reaches something only he can judge — park it and carry on with the next
   independent item, or stop? If it can carry on, say exactly how state
   expresses "parked pending owner" without ever becoming "deferred."

3. **Re-sequence §12a for this window.** Order it so unattended turns spend
   themselves on work that can be verified without him, and everything
   requiring his taste arrives as **one batched sitting** with one contact
   sheet. Name what moves out of §12a if that helps.

4. **Resolve the budget contradiction.** Long sessions versus `--max-turns 4`
   and one burst a day. Give a number and the reasoning — one long run of N
   turns, or several? What is the failure mode if the budget runs out
   mid-section, and how does the workflow leave the repo safe if it does?

5. **A guard against the old failure.** Whatever you design, name the mechanism
   that prevents an unattended Claude-only stretch from quietly accumulating
   unverified visual work. The rule today is "no browser means stop." If turns
   are going to keep working past a capture wall, something else has to hold
   that line.

## 6. Standing constraints — non-negotiable

- `/share` is public: zero dollar amounts, zero owner-only fields, ever.
- No visual criterion may pass as `not_run`/`deferred`/`blocked`. DOM presence,
  source greps and build exits never satisfy a visual criterion.
- Rows close only on an owner quote or a committed capture. `landed` is not
  done; a criteria-ledger `pass` is not done.
- Never weaken, redefine, or except a gate. The 50ms long-task gate just
  cleared after six rounds precisely because nobody was allowed to soften it.
- One commit per section stage; never two agents in the tree at once.
- Never read, print, edit, stage or commit `.env*`. Never run `vercel --prod`.

## 7. Context worth having

Today ended well: five ledger rows closed on his own words (trails, cursor,
planet position, news, glow), the 50ms gate cleared, and the seven-report logo
mystery root-caused to two logo files that shipped their own opaque background
plate. What made the difference in every one of those was **a measurement
replacing an argument** — the profiler ended a six-round guess about shader
compilation in one run.

The failure mode to design against is the opposite: an agent that reasons
confidently about pixels it never saw. That is what produced eleven sections of
work that looked finished and wasn't.

Devan's own words on what he wants from this project: *"the purpose of it is to
be able to see complex data in a simple and understandable way without having
to spend too much time analyzing all the numbers."* He would rather have fewer
things that land than more things that half-land.
