// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Protect specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/tasks/:path*',
    '/api/auth/signup',
  ]
};

export default withAuth(
  function middleware(req: NextRequest) {
    // Extract client info
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'Unknown IP';
    const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

    // Clone the request URL
    const url = req.nextUrl.clone();

    // Add security headers
    const response = NextResponse.rewrite(url);
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Add client info to headers
    response.headers.set('x-client-ip', ip);
    response.headers.set('x-user-agent', userAgent);

    // If it's an API route, add CORS headers
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
      );
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);