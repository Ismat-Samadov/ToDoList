// middleware.ts (at the root of your project)
import { NextResponse } from 'next/server';

export function middleware(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  // Add IP and User-Agent as query parameters for downstream processing
  const url = req.nextUrl.clone();
  url.searchParams.set('x-client-ip', ip);
  url.searchParams.set('x-user-agent', userAgent);

  return NextResponse.rewrite(url);
}
