import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isDisposableEmail } from '@/lib/disposableEmail';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value || request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;


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
