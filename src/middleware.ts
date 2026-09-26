import { type NextRequest, NextResponse } from "next/server";

const COOKIE = "step365_session";
const SESSION_DAYS = 30;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const sessionId = request.cookies.get(COOKIE)?.value;
  if (sessionId) {
    const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    response.cookies.set(COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
