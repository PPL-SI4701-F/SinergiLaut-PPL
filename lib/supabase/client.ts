import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a no-op stub during build/prerender when env vars aren't available
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: {}, error: new Error("No Supabase URL") }),
        signUp: async () => ({ data: {}, error: new Error("No Supabase URL") }),
        signOut: async () => ({} as { error: null }),
        resetPasswordForEmail: async () => ({ error: new Error("No Supabase URL") }),
      },
      from: (_table: string) => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }) }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({ eq: async () => ({ data: null, error: null }) }),
        delete: () => ({ eq: async () => ({ data: null, error: null }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}

