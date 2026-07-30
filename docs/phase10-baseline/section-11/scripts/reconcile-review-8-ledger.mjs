import { readFileSync, writeFileSync, existsSync } from "node:fs";

const path = "docs/phase10-workflow/acceptance/section-11.json";
const ledger = JSON.parse(readFileSync(path, "utf8"));
const DIR = "docs/phase10-baseline/section-11/";

const fixes = {
  "BHV-10": { required: ["raw-review-3-audit.json","raw-review-3-overview-postzoom.png","raw-review-3-room-scrolled.png"], addEvidence: ["raw-review-3-overview-postzoom.png","raw-review-3-room-scrolled.png"] },
  "BHV-11": { required: ["captures/asml-panel-type.png","raw-mission-control-type-root-cause.md"] },
  "BHV-12": { required: ["raw-review-3-audit.json","captures/asml-panel-type.png"] },
  "BHV-13": { required: ["raw-review-3-audit.json","captures/asml-selected.png"], addEvidence: ["captures/asml-selected.png"] },
  "BHV-14": { required: ["raw-review-3-audit-2.json","raw-review-3-room-scrolled.png"], addEvidence: ["raw-review-3-room-scrolled.png"] },
  "BHV-15": { required: ["scripts/review-return-toggle.test.tsx","captures/range-since-buy.png"], addEvidence: ["captures/range-since-buy.png"] },
  "BHV-16": { required: ["raw-review-3-audit.json","captures/asml-panel-type.png"], addEvidence: ["captures/asml-panel-type.png"] },
  "BHV-17": { required: ["raw-review-3-audit.json","raw-review-3-overview-postzoom.png"], addEvidence: ["raw-review-3-overview-postzoom.png"] },
  "BHV-18": { required: ["raw-review-3-audit-2.json","raw-review-3-room-scrolled.png"], addEvidence: ["raw-review-3-room-scrolled.png"] },
  "BHV-19": { required: ["raw-news-hyperlinks.json"], addEvidence: ["raw-news-hyperlinks.json"] },
  "BHV-20": { required: ["raw-legend-first-visit.json","raw-review-8-legend-first-visit.png"], addEvidence: ["raw-review-8-legend-first-visit.png"] },
  "BHV-21": { required: ["raw-review-3-audit.json","raw-review-3-overview-postzoom.png"], addEvidence: ["raw-review-3-overview-postzoom.png"] },
  "BHV-31": { required: ["raw-review-5-bhv31-keyboard-siphon.json","raw-review-4-draft-rig.png"], addEvidence: ["raw-review-4-draft-rig.png"] },
  "BHV-32": { required: ["raw-review-4-owner-audit.json","raw-review-4-draft-reduced-motion.png"] },
  "BHV-33": { required: ["raw-review-4-owner-audit.json","raw-review-4-draft-rig.png"], addEvidence: ["raw-review-4-draft-rig.png"] },
  "BHV-34": { required: ["raw-review-5-bhv34-keyboard.json","raw-review-4-draft-rig.png"], addEvidence: ["raw-review-4-draft-rig.png"] },
  "BHV-35": { required: ["raw-review-4-owner-audit.json","raw-review-4-draft-rig.png"], addEvidence: ["raw-review-4-draft-rig.png"] },
  "BHV-05": { required: ["captures/asml-mark-phase-0.png","raw-shipped-mark-measurement.json"] },
  "VIS-10": { required: ["raw-panel-geometry.json","captures/panel-width-460.png"] },
  "VIS-11": { required: ["captures/asml-panel-type.png"] },
  "VIS-12": { required: ["raw-review-3-audit.json","raw-review-3-owner-audit.json","captures/asml-panel-type.png"], addEvidence: ["captures/asml-panel-type.png"] },
  "VIS-13": { required: ["captures/asml-selected.png"], addEvidence: ["captures/asml-selected.png"] },
  "VIS-14": { required: ["raw-review-4-audit.json","captures/asml-panel-type.png","raw-review-4-room.png"], addEvidence: ["captures/asml-panel-type.png","raw-review-4-room.png"] },
  "VIS-15": { required: ["raw-review-3-audit.json","raw-review-3-audit-2.json","raw-review-3-room-scrolled.png"], addEvidence: ["raw-review-3-room-scrolled.png"] },
  "VIS-16": { required: ["raw-review-6-ring-farside.json","raw-review-6-overview-ring-check.png"] },
  "VIS-17": { required: ["raw-radar-ellipse-count.json","raw-review-3-room-scrolled.png"], addEvidence: ["raw-radar-ellipse-count.json","raw-review-3-room-scrolled.png"] },
  "VIS-18": { required: ["raw-review-3-sun-ring-pixels.json","raw-review-3-sun-overview.png"] },
  "VIS-19": { required: ["raw-review-4-followup.json","raw-review-4-vis19.png"] },
  "VIS-20": { required: ["raw-review-4-owner-audit.json","raw-review-3-draft-rig.png"], addEvidence: ["raw-review-3-draft-rig.png"] },
  "VIS-02": { required: ["captures/all-eight-texture-marks.png","scripts/measure-shipped-marks.mjs"] },
  "DEF-02": { required: ["captures/all-eight-texture-marks.png","raw-shipped-mark-measurement.json","scripts/measure-shipped-marks.mjs"] },
  "MOB-10": { required: ["raw-review-4-audit.json","raw-review-4-fallback-390.png"], addEvidence: ["raw-review-4-fallback-390.png"] },
  "ACC-10": { required: ["raw-review-3-owner-audit.json","raw-review-3-draft-rig.png"], addEvidence: ["raw-review-3-draft-rig.png"] },
  "ACC-11": { required: ["raw-review-3-owner-audit.json","raw-review-3-draft-rig.png"], addEvidence: ["raw-review-3-draft-rig.png"] },
  "ACC-13": { required: ["raw-review-4-owner-audit.json","raw-review-4-reduced-motion-mc.png"] },
  "TST-13": { required: ["raw-npm-test.txt"], addEvidence: ["raw-npm-test.txt"] },
  "TST-03": { addEvidence: ["pixel-samples/temporal-trail-samples.png"] },
  "BLD-10": { addEvidence: ["raw-review-3-draft-rig.png"] },
  "BLD-11": { addEvidence: ["raw-review-3-room-scrolled.png"] },
  "BLD-12": { required: ["raw-npm-build.txt"], addEvidence: ["raw-npm-build.txt"] },
  "PRV-12": { addEvidence: ["raw-review-3-draft-rig.png"] },
  "PRV-14": { addEvidence: ["raw-review-3-draft-rig.png"] },
};

let changed = 0;
for (const c of ledger.criteria) {
  const fix = fixes[c.id];
  if (!fix) continue;
  if (fix.required) {
    for (const r of fix.required) {
      if (!existsSync(DIR + r)) throw new Error(`Missing file for ${c.id}: ${DIR}${r}`);
    }
    c.required_artifacts = fix.required.map((r) => DIR + r);
  }
  if (fix.addEvidence) {
    for (const e of fix.addEvidence) {
      if (!existsSync(DIR + e)) throw new Error(`Missing evidence file for ${c.id}: ${DIR}${e}`);
      const full = DIR + e;
      if (!c.reviewer.evidence.includes(full)) c.reviewer.evidence.push(full);
    }
  }
  changed++;
}
console.log(`Reconciled ${changed} criteria.`);
writeFileSync(path, `${JSON.stringify(ledger, null, 2)}\n`);
