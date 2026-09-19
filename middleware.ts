import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "drone_quote_admin_pw";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A página de login e a própria rota de login da API ficam sempre livres.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookiePassword = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated =
    !!process.env.ADMIN_PASSWORD && cookiePassword === process.env.ADMIN_PASSWORD;

  if (!isAuthenticated) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
