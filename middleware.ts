// middleware.ts (at the root of your project)
import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  const url = req.nextUrl.clone();

  // Ensure headers are preserved
  req.headers.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  url.searchParams.set('x-client-ip', ip);
  url.searchParams.set('x-user-agent', userAgent);

  return NextResponse.rewrite(url);
}
