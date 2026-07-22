import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values.",
  );
}

// Anon-key client, safe to use in Server Components. RLS grants public read
// on every table and denies all writes, so this can never be used to mutate data.
export const supabase = createClient<Database>(url, anonKey);
