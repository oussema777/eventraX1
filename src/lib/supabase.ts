import { createClient } from '@supabase/supabase-js';

// Access environment variables using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

const tokenEndpoint = `${supabaseUrl?.replace(/\/+$/, '')}/auth/v1/token`;

const fetchWithSessionLifetime: typeof fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.split('?')[0] !== tokenEndpoint) return fetch(input, init);

  const requestedAt = Math.floor(Date.now() / 1000);
  const response = await fetch(input, init);
  if (!response.ok) return response;

  const grant = await response.clone().json();
  if (!grant?.access_token || !Number.isFinite(grant.expires_in) || grant.expires_in <= 0) return response;

  // The SDK compares expires_at to the device clock on every data request.
  // Schedule refresh from the issued lifetime, even if those clocks disagree.
  grant.expires_at = requestedAt + grant.expires_in;
  return Response.json(grant, { status: response.status, headers: response.headers });
};

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  { global: { fetch: fetchWithSessionLifetime } }
);
