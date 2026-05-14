import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_this_in_production"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const isPublicRoute = 
    pathname === "/" || 
    pathname === "/signup" || 
    pathname === "/auth/set-password" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password" ||
    pathname.startsWith("/api/auth");

  // Define routes that should redirect to dashboard if already authenticated
  const isAuthRoute = 
    pathname === "/signup" || 
    pathname === "/auth/forgot-password" || 
    pathname === "/auth/reset-password";

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // If already authenticated and trying to access auth routes, redirect based on role
      if (isAuthRoute || pathname === "/") {
        if (role === "member") {
          return NextResponse.redirect(new URL("/candidate", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Role-based access control
      if (role === "member") {
        // Members should only access /candidate routes and specific API routes
        const isCandidateRoute = 
          pathname.startsWith("/candidate") || 
          pathname.startsWith("/interview") || 
          pathname.startsWith("/api/candidate");
          
        if (!isCandidateRoute && !isPublicRoute && !pathname.startsWith("/api/")) {
          return NextResponse.redirect(new URL("/candidate", request.url));
        }
      } else if (role === "admin") {
        // Admins should not access /candidate routes (unless specifically allowed)
        if (pathname.startsWith("/candidate") && !pathname.startsWith("/candidates")) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch (e) {
      // Token invalid, clear it and allow public route if it is one, otherwise redirect to login
      if (!isPublicRoute) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("auth_token");
        return response;
      }
      const response = NextResponse.next();
      response.cookies.delete("auth_token");
      return response;
    }
  }

  if (!token && !isPublicRoute) {
    // Redirect to login if not authenticated and trying to access private route
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
