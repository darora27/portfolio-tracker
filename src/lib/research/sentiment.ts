// Dead-simple, title-only, fixed-lexicon sentiment — no NLP, no model,
// deterministic and free. PHASE9.md §4's exact word lists.
const POSITIVE_WORDS = ["beat", "beats", "surge", "soars", "record", "upgrade", "rally", "jump", "jumps", "gains", "tops"];
const NEGATIVE_WORDS = ["miss", "misses", "plunge", "falls", "cuts", "downgrade", "probe", "lawsuit", "warns", "layoffs", "slump"];

export type SentimentLean = "positive" | "negative" | "neutral";

function countMatches(text: string, words: string[]): number {
  return words.reduce((n, word) => n + (new RegExp(`\\b${word}\\b`, "i").test(text) ? 1 : 0), 0);
}

/** Item score = (#pos − #neg) distinct lexicon words present in the title; lean = sign of the score. */
export function sentimentLean(title: string): { score: number; lean: SentimentLean } {
  const pos = countMatches(title, POSITIVE_WORDS);
  const neg = countMatches(title, NEGATIVE_WORDS);
  const score = pos - neg;
  const lean: SentimentLean = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  return { score, lean };
}
