import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  if (typeof window === 'undefined') {
    return {} as ReturnType<typeof createBrowserClient>;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are not set.');
  }

  return createBrowserClient(url, key);
};
