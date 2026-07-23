/**
 * The five Phase 10 Observatory chapters, named and ordered per
 * PRODUCT_DIRECTION.md's "Information model" (the authoritative source —
 * it overrides any design-option mockup naming, e.g. Field Journal's
 * mockup plate labels "Observation/Drivers/History/Method").
 */
export type ObservatoryChapterId = "pulse" | "forces" | "structure" | "timeline" | "lab";

export type ObservatoryChapter = {
  id: ObservatoryChapterId;
  /** 0-based position, stable across renders — drives CSS orbit placement. */
  index: number;
  /** Instrument-style plate number, e.g. "01". */
  number: string;
  label: string;
  question: string;
};

export const OBSERVATORY_CHAPTERS: readonly ObservatoryChapter[] = [
  {
    id: "pulse",
    index: 0,
    number: "01",
    label: "Pulse",
    question: "How is the portfolio behaving relative to the market?",
  },
  {
    id: "forces",
    index: 1,
    number: "02",
    label: "Forces",
    question: "What holdings, flows, and market moves are driving it?",
  },
  {
    id: "structure",
    index: 2,
    number: "03",
    label: "Structure",
    question: "Where are concentration, correlation, and risk located?",
  },
  {
    id: "timeline",
    index: 3,
    number: "04",
    label: "Timeline",
    question: "How did decisions, composition, cash flows, and important events evolve?",
  },
  {
    id: "lab",
    index: 4,
    number: "05",
    label: "Lab",
    question: "How do methods, simulations, calculations, and limitations change the interpretation?",
  },
] as const;

export const DEFAULT_OBSERVATORY_CHAPTER_ID: ObservatoryChapterId = "pulse";

const CHAPTER_IDS = OBSERVATORY_CHAPTERS.map((c) => c.id);

function isObservatoryChapterId(value: string): value is ObservatoryChapterId {
  return (CHAPTER_IDS as string[]).includes(value);
}

/** Resolves a raw searchParams value to a known chapter, defaulting to Pulse for anything unrecognized. */
export function resolveObservatoryChapter(raw: string | string[] | undefined): ObservatoryChapter {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (slug && isObservatoryChapterId(slug)) {
    return OBSERVATORY_CHAPTERS.find((c) => c.id === slug)!;
  }
  return OBSERVATORY_CHAPTERS[0];
}

export function observatoryChapterHref(basePath: string, id: ObservatoryChapterId): string {
  return `${basePath}?chapter=${id}`;
}
