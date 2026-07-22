import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill in your Supabase project values.",
  );
}

// Service-role client. Bypasses RLS — only import this from server-only code
// (route handlers, server actions, scripts): the cron snapshot job, the
// trade-entry route, and scripts/import.ts. Never from a Client Component.
export const supabaseAdmin = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false },
});
