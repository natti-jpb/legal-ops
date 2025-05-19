import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define routes that require authentication
const protectedRoutes = [
  '/cases',
  '/api/cases',
  '/api/files',
  '/api/search',
];

// Define routes that are exempt from authentication checks
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for public routes and static files
  if (publicRoutes.some(route => path.startsWith(route)) || 
      path.includes('/_next') || 
      path.includes('/public')) {
    return NextResponse.next();
  }
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // If accessing API route, return unauthorized response
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Otherwise redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      // In production, verify the token
      // const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
      // await jwtVerify(token, JWT_SECRET);
      
      // For demonstration purposes, we'll skip actual verification
      return NextResponse.next();
    } catch (error) {
      // If token is invalid
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure the matcher for routes where middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 