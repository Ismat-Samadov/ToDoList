// middleware.ts (at the root of your project)
import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  // Clone the request URL to add query parameters
  const url = req.nextUrl.clone();
  url.searchParams.set('x-client-ip', ip);
  url.searchParams.set('x-user-agent', userAgent);

  // Rewrite the request with modified URL
  return NextResponse.rewrite(url);
}

// Specify the matcher if you want this middleware to run for specific routes
export const config = {
  matcher: ['/api/:path*'], // Apply to all API routes
};

