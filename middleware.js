import { auth } from "auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
  );

  // If user is not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If user is logged in and needs onboarding
  if (
    isLoggedIn &&
    req.auth?.user?.needsOnboarding &&
    nextUrl.pathname !== "/onboarding"
  ) {
    console.log("User needs onboarding, redirecting to /onboarding");
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // If user is logged in and trying to access auth pages, redirect to profile
  if (isLoggedIn && ["/login", "/sign-up"].includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/profile", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
