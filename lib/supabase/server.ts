import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Browser-session-aware client — respects RLS via the user's cookies.
 * Create a fresh instance per request; never share across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      } catch {
        // In case we're in an environment where cookies can't be set (like API routes),
        // we catch the error to prevent the entire request from failing. The client will still work,
        // but without the ability to persist sessions across requests. --- IGNORE ---
      }
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
}

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
        'Add it to your .env.local and Vercel environment variables.'
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // Prevent the admin client from persisting or auto-refreshing any session.
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}