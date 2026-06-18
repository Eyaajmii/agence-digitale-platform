import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from "@/auth"

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoggedIn  = !!session?.user;
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin     = pathname === "/auth/login";
  const isCallback  = pathname.startsWith("/api/auth"); // ← ne pas intercepter

  if (isCallback) return NextResponse.next(); // ← laisser passer

  if (isDashboard && !isLoggedIn)
    return NextResponse.redirect(new URL("/auth/login", request.url));

  if (isLogin && isLoggedIn)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
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
}