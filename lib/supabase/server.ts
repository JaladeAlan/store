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
        // In environments where cookies can't be set (e.g. read-only RSC),
        // we swallow the error — the client still works for reads.
      }
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
}

/**
 * Service-role client — bypasses RLS. Use only in trusted server contexts
 * (API routes, webhooks, server actions). Never expose to the browser.
 *
 */
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
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}