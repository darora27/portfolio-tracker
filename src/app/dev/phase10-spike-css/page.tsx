import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { OBSERVATORY_CHAPTERS, resolveObservatoryChapter } from "@/lib/observatory/chapters";
import styles from "./spike.module.css";

export const metadata: Metadata = {
  title: "Phase 10 §1 spike — CSS 3D",
  robots: { index: false, follow: false },
};

/**
 * Phase 10 §1 technical spike (CSS 3D branch). Isolated, non-production
 * route: same semantic content/controls as the R3F spike at
 * /dev/phase10-spike-r3f, no network data, five spatial objects max, no
 * post-processing. Selecting a body is real navigation (?chapter=...) so
 * it is fully keyboard-, touch-, screen-reader-, and no-JS-operable.
 * Append ?no3d=1 to force the static concentric fallback for evidence
 * capture without needing a live reduced-motion emulation.
 */
export default async function CssSpikePage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; no3d?: string }>;
}) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Phase 10 §1 spike — CSS 3D</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  const params = await searchParams;
  const active = resolveObservatoryChapter(params.chapter);
  const forceNo3d = params.no3d === "1";

  return (
    <div className={styles.stage} data-force-no-3d={forceNo3d ? "true" : "false"}>
      <div className={styles.lead}>
        <h1 className={styles.leadHeading}>Phase 10 §1 spike — CSS 3D</h1>
        <p className={styles.leadSub}>
          Isolated prototype. Synthetic content only — no portfolio data. Compare with{" "}
          <a href="/dev/phase10-spike-r3f" style={{ color: "var(--obs-evidence)" }}>
            the R3F spike
          </a>
          . Append <code>?no3d=1</code> to force the static fallback.
        </p>
      </div>

      <div className={styles.orbitWrap}>
        <nav aria-label="Observatory chapters (spike)" className={styles.orbit}>
          {OBSERVATORY_CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`/dev/phase10-spike-css?chapter=${chapter.id}${forceNo3d ? "&no3d=1" : ""}`}
              data-index={chapter.index}
              aria-current={chapter.id === active.id ? "page" : undefined}
              className={styles.body}
            >
              <span aria-hidden="true">{chapter.number}</span>
              <span className="sr-only">{chapter.label}</span>
            </a>
          ))}
          <div className={styles.inspector} aria-live="off">
            <p className={styles.inspectorNumber}>{active.number}</p>
            <p className={styles.inspectorLabel}>{active.label}</p>
            <p className={styles.inspectorQuestion}>{active.question}</p>
          </div>
        </nav>
      </div>

      <article className={styles.plate} aria-labelledby="spike-plate-heading">
        <h2 id="spike-plate-heading" className="sr-only">
          {active.label} plate
        </h2>
        <p className={styles.plateFinding}>
          Synthetic finding for &ldquo;{active.label}&rdquo; — evidence plate placeholder.
        </p>
        <div className={styles.plateEvidence} aria-hidden="true" />
      </article>
    </div>
  );
}
