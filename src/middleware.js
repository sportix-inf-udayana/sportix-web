import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const ACCESS_RULES = [
  { pattern: /^\/(super-admin|api\/verifications|api\/withdrawals(?!Layout|\/request))/, required: "SUPER_ADMIN" },
  { pattern: /^\/(admin-venue|api\/slots\/manage|api\/scan)/, required: "ADMIN_VENUE" },
  { pattern: /^\/(coach|api\/coaches\/(?!list|search|view))/, required: "COACH" },
  { pattern: /^\/(seller-umkm|api\/umkm\/(?!checkout|catalog|products\/list))/, required: "UMKM_SELLER" }
];
const PRIVATE_ROUTES = ["/super-admin", "/admin-venue", "/coach", "/seller-umkm", "/profile", "/booking"];

function checkAccessViolation(url, user) {
  const isApiRoute = url.pathname.startsWith("/api");
  const isTransactionalRoute = url.pathname.startsWith("/checkout") || url.pathname.startsWith("/booking");

  if (!user) {
    if (isApiRoute) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
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
    if (isApiRoute) return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }
  return null;
}

export async function middleware(request) {
  const url = request.nextUrl.clone();

  // Bypass route webhook & cron job tanpa injeksi header berlebih
  if (url.pathname.startsWith("/api/cron") || url.pathname.startsWith("/api/payments/webhook")) {
    return NextResponse.next();
  }

  // CORE FIX: Injeksi Pathname ke Header untuk Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', url.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const routeResponse = checkAccessViolation(url, user);
  
  return routeResponse || supabaseResponse;
}

// Hapus rute statis dari matcher agar middleware lebih ringan
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};