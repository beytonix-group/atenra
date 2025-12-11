import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'unknown';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';

  return NextResponse.json({
    origin: `${protocol}://${host}`,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    AUTH_URL: process.env.AUTH_URL || 'NOT SET',
    AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID_EXISTS: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET_EXISTS: !!process.env.AUTH_GOOGLE_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
    },
  });
}
