import { JSDOM } from "jsdom";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const publicBase =
  process.env.PHASE10_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
const privateBase =
  process.env.PHASE10_PRIVATE_BASE_URL ?? "http://127.0.0.1:3100";
const password = process.env.PHASE10_REVIEW_PASSWORD;
const output = path.resolve(
  "docs/phase10-baseline/section-11/raw-review-http.json",
);

if (!password) {
  throw new Error("PHASE10_REVIEW_PASSWORD is required.");
}

function visibleText(html) {
  const document = new JSDOM(html).window.document;
  document.querySelectorAll("script,style").forEach((node) => node.remove());
  return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function scan(html) {
  const text = visibleText(html);
  return {
    visibleCurrency: text.match(/(?:[$€£¥]\s*\d|\bUSD\s+\d)/g) ?? [],
    visibleDraft: /\bDRAFT\b/.test(text),
    visibleValueHeading: /\bVALUE\b/.test(text),
    visibleReset: /RESET TO BOOK/.test(text),
    rawOwnerFieldKeys: [
      "totalValue",
      "totalCost",
      "shares",
      "costBasis",
      "realizedGain",
      "unrealizedGain",
    ].filter((key) => html.includes(key)),
  };
}

const publicResponse = await fetch(`${publicBase}/share`);
const publicHtml = await publicResponse.text();
const loginResponse = await fetch(`${privateBase}/api/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password }),
  redirect: "manual",
});
const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
if (!cookie) {
  throw new Error(`Private login did not issue a session cookie (${loginResponse.status}).`);
}
const privateResponse = await fetch(
  `${privateBase}/?focus=portfolio&camera=command`,
  { headers: { cookie } },
);
const privateHtml = await privateResponse.text();
const compareResponse = await fetch(`${publicBase}/compare`, {
  redirect: "manual",
});

const result = {
  public: {
    status: publicResponse.status,
    bytes: Buffer.byteLength(publicHtml),
    ...scan(publicHtml),
  },
  private: {
    status: privateResponse.status,
    bytes: Buffer.byteLength(privateHtml),
    ...scan(privateHtml),
  },
  compareStatus: compareResponse.status,
  conclusions: {
    publicHasNoCurrency: scan(publicHtml).visibleCurrency.length === 0,
    publicHasNoDraftMarkup: !scan(publicHtml).visibleDraft,
    publicHasNoOwnerFields: scan(publicHtml).rawOwnerFieldKeys.length === 0,
    privateHasDraftLatch: scan(privateHtml).visibleDraft,
    privateHasValueHeading: scan(privateHtml).visibleValueHeading,
    compareRetired: compareResponse.status === 404,
  },
};

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
