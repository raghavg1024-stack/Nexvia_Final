import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/assessment") ||
    request.nextUrl.pathname.startsWith("/roadmap") ||
    request.nextUrl.pathname.startsWith("/jobs") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/mentor") ||
    request.nextUrl.pathname.startsWith("/community") ||
    request.nextUrl.pathname.startsWith("/certificates") ||
    request.nextUrl.pathname.startsWith("/readiness") ||
    request.nextUrl.pathname.startsWith("/mock-interview") ||
    request.nextUrl.pathname.startsWith("/resume-analysis") ||
    request.nextUrl.pathname.startsWith("/parent") ||
    request.nextUrl.pathname.startsWith("/rewards") ||
    request.nextUrl.pathname.startsWith("/recruiter") ||
    request.nextUrl.pathname.startsWith("/academia") ||
    request.nextUrl.pathname.startsWith("/scholarships");

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessment/:path*",
    "/roadmap/:path*",
    "/jobs/:path*",
    "/profile/:path*",
    "/mentor/:path*",
    "/community/:path*",
    "/certificates/:path*",
    "/readiness/:path*",
    "/mock-interview/:path*",
    "/resume-analysis/:path*",
    "/parent/:path*",
    "/rewards/:path*",
    "/recruiter/:path*",
    "/academia/:path*",
    "/scholarships/:path*",
    "/login/:path*",
    "/signup/:path*",
  ],
};
