import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware placeholder for frontend session checks & JWT verification
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/brand/:path*', '/influencer/:path*'],
};
