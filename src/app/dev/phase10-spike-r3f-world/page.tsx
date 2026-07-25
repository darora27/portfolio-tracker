import { cookies } from "next/headers";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";
import { R3fWorld } from "./R3fWorld";

export const metadata: Metadata = {
  title: "Phase 10 §7 spike — R3F spatial world",
  robots: { index: false, follow: false },
};

export default async function R3fWorldSpikePage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; forceFail?: string }>;
}) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">
          Phase 10 §7 spike — R3F spatial world
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  const params = await searchParams;
  return (
    <R3fWorld
      activeChapterId={resolveObservatoryChapter(params.chapter).id}
      forceWebglFailure={params.forceFail === "1"}
    />
  );
}
