import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = new Set(["/", "/login", "/register"]);

export default auth((request) => {
  const { nextUrl } = request;
  const { pathname } = nextUrl;
  const isAuthenticated = Boolean(request.auth?.user?.email);

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicRoute = publicRoutes.has(pathname);

  if (
    !isAuthenticated &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/interview") ||
      pathname.startsWith("/review"))
  ) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isPublicRoute || isApiAuthRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
