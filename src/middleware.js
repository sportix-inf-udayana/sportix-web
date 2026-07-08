import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const ACCESS_RULES = [
  { pattern: /^\/(super-admin|api\/verifications|api\/withdrawals(?!Layout|\/request))/, required: "SUPER_ADMIN" },
  { pattern: /^\/(admin-venue|api\/slots\/manage|api\/scan)/, required: "ADMIN_VENUE" },
  { pattern: /^\/(coach|api\/coaches\/(?!list|search|view))/, required: "COACH" },
  { pattern: /^\/(seller-umkm|api\/umkm\/(?!checkout|catalog|products\/list))/, required: "UMKM_SELLER" }
];
const PRIVATE_ROUTES = ["/super-admin", "/admin-venue", "/coach", "/seller-umkm", "/profile"];

// Helper untuk isolasi aturan akses rute
function checkAccessViolation(url, user) {
  const isApiRoute = url.pathname.startsWith("/api");
  const isTransactionalRoute = url.pathname.startsWith("/checkout") || url.pathname.startsWith("/booking");

  if (!user) {
    if (isApiRoute) return NextResponse.json({ success: false, message: "Unauthorized. JWT Missing." }, { status: 401 });
    if (isTransactionalRoute || PRIVATE_ROUTES.some(route => url.pathname.startsWith(route))) {
      const redirectUrl = url.clone();
      redirectUrl.pathname = "/login";
      if (isTransactionalRoute) redirectUrl.search = `?callback=${encodeURIComponent(url.pathname + url.search)}`;
      return NextResponse.redirect(redirectUrl);
    }
    return null;
  }

  const role = user.user_metadata?.role || "CUSTOMER";
  const violation = ACCESS_RULES.find(rule => rule.pattern.test(url.pathname) && role !== rule.required);
  
  if (violation) {
    if (isApiRoute) return NextResponse.json({ success: false, message: "Forbidden. Role mismatch." }, { status: 403 });
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return null;
}

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });
  const url = request.nextUrl.clone();

  // Handle route statis pengecualian utama
  if (url.pathname.startsWith("/api/cron")) {
    if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, message: "Forbidden. Invalid Signature." }, { status: 403 });
    }
    return supabaseResponse;
  }
  if (url.pathname.startsWith("/api/payments/webhook")) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const routeResponse = checkAccessViolation(url, user);
  const finalResponse = routeResponse || supabaseResponse;

  if (finalResponse !== supabaseResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });
  }

  return finalResponse;
}

export const config = {
  matcher: [
    "/api/:path*", "/super-admin/:path*", "/admin-venue/:path*", 
    "/coach/:path*", "/seller-umkm/:path*", "/profile/:path*", 
    "/checkout/:path*", "/booking/:path*"
  ],
};