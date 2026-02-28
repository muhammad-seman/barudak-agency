import { NextResponse } from 'next/server';
import { supabase } from './lib/supabase';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionToken = request.cookies.get('ba_session')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token against Supabase
  if (supabase) {
    const { data: auth, error } = await supabase
      .from('auth')
      .select('token')
      .eq('token', sessionToken)
      .single();

    if (error || !auth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // If supabase is not initialized (e.g. during build or missing env), 
    // we might want to redirect to login if it's not a public path
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
