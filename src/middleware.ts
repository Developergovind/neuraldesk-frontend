import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isDisposableEmail } from '@/lib/disposableEmail';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const tenantCookie = request.cookies.get('tenant')?.value;
  const { pathname } = request.nextUrl;

  // Check if existing session cookie has a disposable email
  if (tenantCookie) {
    try {
      const tenant = JSON.parse(decodeURIComponent(tenantCookie));
      if (tenant?.email && isDisposableEmail(tenant.email)) {
        // Block & suspend session
        const response = NextResponse.redirect(new URL('/login?blocked=disposable', request.url));
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        response.cookies.delete('tenant');
        return response;
      }
    } catch {
      // Ignore JSON parse errors in cookie
    }
  }

  // Define public paths that don't require auth
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/auth');
  const isPublicPath = isAuthPage || 
    pathname === '/' || 
    pathname.startsWith('/about') || 
    pathname.startsWith('/changelog') || 
    pathname.startsWith('/contact') || 
    pathname.startsWith('/docs') || 
    pathname.startsWith('/privacy') || 
    pathname.startsWith('/terms');

  // If trying to access dashboard without token, redirect to login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login/register while already authenticated with a valid token, redirect to dashboard
  if (isAuthPage && token && !pathname.includes('reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/auth/:path*',
  ],
};
