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

  const isTransactionalRoute = url.pathname.startsWith("/checkout") || url.pathname.startsWith("/booking");

  let finalResponse = supabaseResponse;

  if (!user && !isPublicWebhook) {
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized. JWT Missing." }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    
    if (isTransactionalRoute) {
      const callbackPath = encodeURIComponent(url.pathname + url.search);
      url.pathname = "/login";
      url.search = `?callback=${callbackPath}`;
      finalResponse = NextResponse.redirect(url);
    } else if (
      url.pathname.startsWith("/super-admin") || 
      url.pathname.startsWith("/admin-venue") || 
      url.pathname.startsWith("/coach") || 
      url.pathname.startsWith("/seller-umkm") ||
      url.pathname.startsWith("/profile")
    ) {
      url.pathname = "/login";
      finalResponse = NextResponse.redirect(url);
    }
  }

  // RBAC (Role-Based Access Control)
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
        console.warn(`SECURITY ALERT: User ${user.id} (${role}) attempted to access ${route}`);
        url.pathname = "/"; 
        finalResponse = NextResponse.redirect(url);
        break; // Hentikan loop setelah menemukan violation
      }
    }
  }

  // Senior Edge-Case: Jika redirect terjadi, pindahkan token/cookie terbaru yang mungkin di-refresh di atas 
  // ke dalam response redirect yang baru agar auth state tidak terhapus.
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