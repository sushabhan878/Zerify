import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('zerify_token')?.value;
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from public landing & auth pages directly to dashboard
  if (token && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*', '/brand/:path*', '/influencer/:path*'],
};
