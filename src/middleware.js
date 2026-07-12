import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Gunakan Set untuk pencarian O(1) pada rute privat absolut
const PRIVATE_ROUTES = new Set(["/profile", "/booking"]);

// Gunakan mapping untuk performa dan keamanan
const ROLE_REQUIREMENTS = {
  "/super-admin": "SUPER_ADMIN",
  "/api/verifications": "SUPER_ADMIN",
  "/api/withdrawals": "SUPER_ADMIN",
  "/admin-venue": "ADMIN_VENUE",
  "/api/slots/manage": "ADMIN_VENUE",
  "/api/scan": "ADMIN_VENUE",
  "/coach": "COACH",
  "/seller-umkm": "UMKM_SELLER",
};

/**
 * Validasi otorisasi berbasis Role-Based Access Control (RBAC)
 */
function checkAccessViolation(url, user) {
  const path = url.pathname;
  const isApiRoute = path.startsWith("/api");
  const isTransactional = path.startsWith("/checkout") || path.startsWith("/booking");

  // Pengecualian rute spesifik yang bersifat publik meski berada di bawah prefix API
  if (path.startsWith("/api/withdrawals/request") || path.startsWith("/api/coaches/list")) {
    return null; 
  }

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    
    // Cek rute privat menggunakan Set (lebih cepat dari Array.some)
    const isPrivateRoute = PRIVATE_ROUTES.has(path) || Object.keys(ROLE_REQUIREMENTS).some(r => path.startsWith(r));
    
    if (isPrivateRoute || isTransactional) {
      const redirectUrl = url.clone();
      redirectUrl.pathname = "/login";
      if (isTransactional) {
        redirectUrl.searchParams.set("callback", `${path}${url.search}`);
      }
      return NextResponse.redirect(redirectUrl);
    }
    return null;
  }

  // RBAC Check
  const role = user.user_metadata?.role || "CUSTOMER";
  const requiredRoleEntry = Object.entries(ROLE_REQUIREMENTS).find(([route]) => path.startsWith(route));

  if (requiredRoleEntry) {
    const [_, requiredRole] = requiredRoleEntry;
    if (role !== requiredRole) {
      if (isApiRoute) {
        return NextResponse.json({ success: false, message: "Forbidden. Akses ditolak." }, { status: 403 });
      }
      const redirectUrl = url.clone();
      redirectUrl.pathname = "/"; // Tendang kembali ke home jika mencoba akses dashboard lain
      return NextResponse.redirect(redirectUrl);
    }
  }

  return null;
}

export async function middleware(request) {
  const url = request.nextUrl;

  if (url.pathname.startsWith("/api/cron") || url.pathname.startsWith("/api/payments/webhook")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", url.pathname);

  let response = NextResponse.next({
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
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Gunakan getSession di middleware (lebih ringan, baca dari JWT). 
  // getUser() hanya digunakan di layer backend/service yang butuh validitas real-time ke DB.
  const { data: { session } } = await supabase.auth.getSession();
  
  const violationResponse = checkAccessViolation(url, session?.user);
  
  return violationResponse || response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};