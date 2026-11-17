import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isJwtExpired } from "@/lib/auth-token";

const sessionCookieName = "next-auth.session-token-website";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });

  const accessToken = token?.accessToken as string | undefined;
  const isExpired =
    !token ||
    token.error === "AccessTokenExpired" ||
    (accessToken ? isJwtExpired(accessToken) : false);

  if (isExpired) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    const response = NextResponse.redirect(loginUrl);
    // Delete session cookies so the expired session is thoroughly cleaned up
    response.cookies.delete(sessionCookieName);
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
