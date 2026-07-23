"use client";

import { useEffect, useRef } from "react";

type Props = {
  activeChapterId: string;
  headingId: string;
};

/**
 * Progressive-enhancement only: moves focus to the active chapter's
 * heading whenever the chapter changes (including browser back/forward,
 * since App Router re-renders this tree with a new `activeChapterId` prop
 * on history navigation too). Skips the very first mount so landing on the
 * page never yanks focus away from the top — nothing here is required for
 * the shell to function; without JS, chapter switching is a normal
 * document navigation and the browser's own default focus handling
 * applies.
 */
export function ChapterFocusManager({ activeChapterId, headingId }: Props) {
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const heading = document.getElementById(headingId);
    heading?.focus();
  }, [activeChapterId, headingId]);

  return null;
}
