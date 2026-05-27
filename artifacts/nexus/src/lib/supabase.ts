import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Create a mock supabase client if env vars are not set (for UI demo)
const createMockClient = () => {
  const mockSession = null;
  const mockUser = null;
  
  return {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        // Immediately call with null session for demo mode
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - auth disabled' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - auth disabled' } }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: { url: null, provider: null }, error: { message: 'Demo mode - auth disabled' } }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null }),
        }),
        order: () => ({ data: [], error: null }),
      }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  } as unknown as SupabaseClient;
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: "nexus_auth",
      },
    })
  : createMockClient();

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;
