import { describe, expect, it } from "vitest";
import { containsBannedLanguage } from "./surface-copy";
import {
  INSIDER_FILINGS_SUBTITLE,
  RESEARCH_FOOTER_LINE,
  REDDIT_PENDING_MESSAGE,
  CROSS_SOURCE_SUBTITLE,
  RESEARCH_INTRO,
} from "./research-copy";

describe("/research static copy", () => {
  it("contains the exact required verbatim strings", () => {
    expect(INSIDER_FILINGS_SUBTITLE).toBe(
      "Public SEC Form 4 disclosures — filed when insiders trade their own company's stock.",
    );
    expect(RESEARCH_FOOTER_LINE).toBe("Public information aggregated for personal research — not investment advice.");
  });

  it("never uses imperative/advice language (extends the §2 banned-words check)", () => {
    for (const copy of [
      INSIDER_FILINGS_SUBTITLE,
      RESEARCH_FOOTER_LINE,
      REDDIT_PENDING_MESSAGE,
      CROSS_SOURCE_SUBTITLE,
      RESEARCH_INTRO,
    ]) {
      expect(containsBannedLanguage(copy)).toBe(false);
    }
  });

  it("never implies non-public or insider information", () => {
    expect(INSIDER_FILINGS_SUBTITLE.toLowerCase()).not.toContain("non-public");
    expect(INSIDER_FILINGS_SUBTITLE.toLowerCase()).toContain("public");
  });
});
