import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionToken = request.cookies.get('ba_session')?.value;
  const validToken = process.env.AUTH_TOKEN;

  // If AUTH_TOKEN is missing in prod, we might have a config issue
  if (!validToken && process.env.NODE_ENV === 'production') {
    console.error('Middleware: AUTH_TOKEN is not defined in production environment.');
  }

  if (!sessionToken || sessionToken !== validToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
