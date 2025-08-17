import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Use getSession instead of getUser
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log("Middleware triggered. Session:", session?.user, "Error:", error);

  const pathname = req.nextUrl.pathname;

  // Protect /chat (requires login)
  if (!session?.user && pathname.startsWith("/chat")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from /login and /signup
  if (session?.user && (pathname === "/login" || pathname === "/signup")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/chat";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/login", "/signup", "/chat/:path*"],
};
