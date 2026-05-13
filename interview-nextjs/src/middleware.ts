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
    pathname.startsWith("/api/auth");

  // Define routes that should redirect to dashboard if already authenticated
  const isAuthRoute = pathname === "/signup";

  if (!token && !isPublicRoute) {
    // Redirect to login if not authenticated and trying to access private route
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && isAuthRoute) {
    // Redirect to dashboard if already authenticated and trying to access signup
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (e) {
      // Token invalid, clear it and allow public route
      const response = NextResponse.next();
      response.cookies.delete("auth_token");
      return response;
    }
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
