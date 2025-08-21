import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          // Use req.cookies.getAll() for Next.js middleware compatibility
          return req.cookies.getAll();
        },
        setAll: (cookies) => {
          // Sets all cookies on the response
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // console.log("Middleware session:", session?.user);

  const pathname = req.nextUrl.pathname;

  // Protect /chat routes
  if (!user && pathname.startsWith("/chat")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from /login & /signup
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/chat";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/login", "/signup", "/chat/:path*"],
};
