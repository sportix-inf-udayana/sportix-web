import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Pindahkan Rules ke Global Scope untuk efisiensi memori (tidak di-recreate tiap request)
const ACCESS_RULES = [
  { pattern: /^\/(super-admin|api\/verifications|api\/withdrawals(?!Layout|\/request))/, required: "SUPER_ADMIN" },
  { pattern: /^\/(admin-venue|api\/slots\/manage|api\/scan)/, required: "ADMIN_VENUE" },
  { pattern: /^\/(coach|api\/coaches\/(?!list|search|view))/, required: "COACH" },
  { pattern: /^\/(seller-umkm|api\/umkm\/(?!checkout|catalog|products\/list))/, required: "UMKM_SELLER" }
];

const PRIVATE_ROUTES = ["/super-admin", "/admin-venue", "/coach", "/seller-umkm", "/profile"];

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });
  const url = request.nextUrl.clone();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  const isApiRoute = url.pathname.startsWith("/api");
  const isCronRoute = url.pathname.startsWith("/api/cron");
  const isPublicWebhook = url.pathname.startsWith("/api/payments/webhook");
  const isTransactionalRoute = url.pathname.startsWith("/checkout") || url.pathname.startsWith("/booking");

  // PROTEKSI TERMINAL CRON
  if (isCronRoute) {
    if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, message: "Forbidden. Invalid Cron Secret." }, { status: 403 });
    }
    return supabaseResponse;
  }

  let finalResponse = supabaseResponse;

  // HANDLE UNAUTHENTICATED
  if (!user && !isPublicWebhook) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, message: "Unauthorized. JWT Missing." }, { status: 401 });
    }
    
    if (isTransactionalRoute) {
      url.pathname = "/login";
      url.search = `?callback=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
      finalResponse = NextResponse.redirect(url);
    } else if (PRIVATE_ROUTES.some(route => url.pathname.startsWith(route))) {
      url.pathname = "/login";
      finalResponse = NextResponse.redirect(url);
    }
  }

  // HANDLE RBAC GRANULAR (AUTHENTICATED)
  if (user) {
    const role = user.user_metadata?.role || "CUSTOMER";

    const violation = ACCESS_RULES.find(rule => rule.pattern.test(url.pathname) && role !== rule.required);
    if (violation) {
      if (isApiRoute) {
        return NextResponse.json({ success: false, message: "Forbidden. Invalid Role." }, { status: 403 });
      }
      url.pathname = "/";
      finalResponse = NextResponse.redirect(url);
    }
  }

  // Sinkronisasi cookie jika ada redirect
  if (finalResponse !== supabaseResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });
  }

  return finalResponse;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/super-admin/:path*",
    "/admin-venue/:path*",
    "/coach/:path*",
    "/seller-umkm/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/booking/:path*",
  ],
};