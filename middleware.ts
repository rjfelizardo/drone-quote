import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isApi = pathname.startsWith("/api/admin");

  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const isCompaniesArea =
    pathname.startsWith("/admin/empresas") ||
    pathname.startsWith("/api/admin/companies");

  if (isCompaniesArea && session.role !== "super_admin") {
    if (isApi) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
