"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm text-zinc-500 hover:underline">
      Sign out
    </button>
  );
}
