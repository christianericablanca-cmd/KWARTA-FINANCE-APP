import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  if (typeof window === 'undefined') {
    return {} as ReturnType<typeof createBrowserClient>;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error('Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel.');
    return {} as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
};
