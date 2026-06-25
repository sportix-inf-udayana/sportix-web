import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
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
  const url = request.nextUrl.clone();
  
  const isApiRoute = url.pathname.startsWith("/api");
  const isPublicWebhook = url.pathname.startsWith("/api/payments/webhook") || url.pathname.startsWith("/api/cron");

  // 1. Blokir akses tanpa otentikasi
  if (!user && !isPublicWebhook) {
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized. JWT Missing." }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    
    // Rute terproteksi harus dialihkan ke login
    if (url.pathname.startsWith("/super-admin") || 
        url.pathname.startsWith("/admin-venue") || 
        url.pathname.startsWith("/coach") || 
        url.pathname.startsWith("/seller-umkm") ||
        url.pathname.startsWith("/profile")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 2. BLIND SPOT PATCHED: Penegakan RBAC (Role-Based Access Control)
  // Asumsi arsitektur: Role disimpan di user_metadata saat registrasi agar bisa dibaca Edge Middleware
  if (user) {
    const role = user.user_metadata?.role || 'CUSTOMER';

    const roleMap = {
      "/super-admin": "SUPER_ADMIN",
      "/admin-venue": "ADMIN_VENUE",
      "/coach": "COACH",
      "/seller-umkm": "UMKM_SELLER"
    };

    for (const [route, requiredRole] of Object.entries(roleMap)) {
      if (url.pathname.startsWith(route) && role !== requiredRole) {
        // Logika brutal: Tendang pengguna yang mencoba eskalasi hak akses kembali ke beranda
        console.warn(`SECURITY ALERT: User ${user.id} (${role}) attempted to access ${route}`);
        url.pathname = "/"; 
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/super-admin/:path*",
    "/admin-venue/:path*",
    "/coach/:path*",
    "/seller-umkm/:path*",
    "/profile/:path*",
  ],
};