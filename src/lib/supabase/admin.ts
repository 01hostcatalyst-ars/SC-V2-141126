import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  supabaseAdmin ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return supabaseAdmin;
}
