import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import styles from "./universe-nav.module.css";

export type UniverseDestination = "universe" | "history" | "research";

/**
 * R7-W7. Real navigation, replacing two things that were not navigation.
 *
 * Devan, three times, most recently in capitals: "I KEEP TELLING YOU THAT WE
 * DO NOT NEED THOSE TABS AT THE TOP. The only reason why tabs at the top
 * would be useful was if we were switching to another page but all of those
 * tabs are LOCATED ON THE SAME PAGE. I would be okay if the tabs took you to
 * different pages maybe one showing history and one showing research."
 *
 * He is describing the difference between navigation and a table of
 * contents. Mission Control's strip was anchor links that scrolled the page
 * you were already on — it looked like navigation and behaved like an index,
 * which is why it read as pointless. Those are gone; sections are still
 * reachable by scrolling, which is what they always actually were.
 *
 * The other thing this replaces is `components/layout/NavBar` — the old
 * design system's header, still sitting on /history, /research and /stock.
 * That is the "old UI for the project which I do not like" he reported
 * seeing at the top of the Chart Room. Same nav, one design, three real
 * destinations.
 */
export function UniverseNav({
  active,
  showLogout = true,
}: {
  active: UniverseDestination;
  /** The public share view has no session to end. */
  showLogout?: boolean;
}) {
  const destinations: { id: UniverseDestination; href: string; label: string }[] = [
    { id: "universe", href: "/", label: "MISSION CONTROL" },
    { id: "history", href: "/history", label: "HISTORY" },
    { id: "research", href: "/research", label: "RESEARCH" },
  ];

  return (
    <header className={styles.universeNav}>
      <nav aria-label="Sections">
        {destinations.map((destination) => (
          <Link
            key={destination.id}
            href={destination.href}
            aria-current={destination.id === active ? "page" : undefined}
          >
            {destination.label}
          </Link>
        ))}
      </nav>
      {showLogout ? <LogoutButton /> : null}
    </header>
  );
}
