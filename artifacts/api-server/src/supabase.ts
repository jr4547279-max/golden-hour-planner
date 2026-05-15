import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./env";

function normalizeUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

let _supabase: SupabaseClient | null = null;

const url = normalizeUrl(ENV.supabaseUrl);
const key = ENV.supabaseAnonKey;

if (url && key) {
  try {
    _supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    console.log("[supabase] client initialized, url:", url);
  } catch (err) {
    console.error("[supabase] failed to create client:", err);
    _supabase = null;
  }
} else {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_ANON_KEY not set — Supabase client disabled");
}

export const supabase = _supabase;
