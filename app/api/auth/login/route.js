import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const body = await request.json();
  const { username, password } = body;

  // Fetch auth from Supabase
  const { data: auth, error } = await supabase
    .from('auth')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !auth) {
    return Response.json({ error: 'Username atau password salah.' }, { status: 401 });
  }

  const response = Response.json({ success: true });
  const isProd = process.env.NODE_ENV === 'production';
  response.headers.set(
    'Set-Cookie',
    `ba_session=${auth.token}; Path=/; HttpOnly; SameSite=Lax; ${isProd ? 'Secure;' : ''} Max-Age=${60 * 60 * 24 * 30}`
  );
  return response;
}
