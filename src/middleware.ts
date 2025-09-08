import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export function middleware(request: NextRequest) {
  // Workaround for Cloudflare Pages root route issue
  const response = NextResponse.next();
  
  // Add cache headers for root path
  if (request.nextUrl.pathname === '/') {
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('cache-control', 'no-cache, no-store, must-revalidate');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};