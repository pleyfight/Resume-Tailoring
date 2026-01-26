import { NextRequest } from 'next/server';
import { getAuthedServerSupabase } from './supabase';

export interface AuthResult {
  user: {
    id: string;
    email?: string;
  } | null;
  error: string | null;
}

export interface AuthedSupabaseResult extends AuthResult {
  token: string | null;
  supabase: ReturnType<typeof getAuthedServerSupabase> | null;
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/**
 * Authenticate a request using Supabase Auth
 * Extracts JWT token from Authorization header and validates it
 * 
 * @param request - Next.js request object
 * @returns Object with user data or error message
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = getBearerToken(request);
  if (!token) return { user: null, error: 'Missing authorization header' };

  try {
    const supabase = getAuthedServerSupabase(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user: { id: user.id, email: user.email }, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export async function getAuthedSupabase(request: NextRequest): Promise<AuthedSupabaseResult> {
  const token = getBearerToken(request);
  if (!token) return { user: null, token: null, supabase: null, error: 'Missing authorization header' };

  try {
    const supabase = getAuthedServerSupabase(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return { user: null, token, supabase: null, error: 'Invalid or expired token' };
    return { user: { id: user.id, email: user.email }, token, supabase, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, token, supabase: null, error: 'Authentication failed' };
  }
}

/**
 * Demo mode authentication - uses hardcoded user ID when Supabase is not configured
 * WARNING: Only use for development/demo purposes
 * 
 * @returns Demo user object
 */
export function getDemoUser() {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'demo@example.com'
  };
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(supabaseUrl && !supabaseUrl.includes('placeholder'));
}
