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
  const isCronRoute = url.pathname.startsWith("/api/cron");
  const isPublicWebhook = url.pathname.startsWith("/api/payments/webhook");
  const isTransactionalRoute = url.pathname.startsWith("/checkout") || url.pathname.startsWith("/booking");

  // PROTEKSI TERMINAL CRON: Menepis serangan DoS manipulasi waktu sewa lapangan
  if (isCronRoute) {
    const cronSecret = request.headers.get("x-cron-secret");
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.warn(`[SECURITY ALERT]: Percobaan pemicuan ilegal fungsi otomatisasi cron dari IP luar.`);
      return new NextResponse(
        JSON.stringify({ success: false, message: "Forbidden. Invalid Cron Secret Key Signature." }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
    return supabaseResponse;
  }

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

  // PENEGAKAN RBAC GRANULAR: Menyediakan jalur logis untuk interaksi konsumen (Customer Loop)
  if (user) {
    const role = user.user_metadata?.role || 'CUSTOMER';

    const accessRules = [
      { pattern: /^\/(super-admin|api\/verifications|api\/withdrawals(?!Layout|\/request))/, required: "SUPER_ADMIN" },
      { pattern: /^\/(admin-venue|api\/slots\/manage|api\/scan)/, required: "ADMIN_VENUE" },
      
      // Menggunakan teknik Negative Lookahead untuk mengecualikan API pencarian/pendaftaran umum pelatih
      { pattern: /^\/(coach|api\/coaches\/(?!list|search|view))/, required: "COACH" },
      
      // Menggunakan teknik Negative Lookahead untuk memberikan hak akses transaksi belanja bagi akun pembeli
      { pattern: /^\/(seller-umkm|api\/umkm\/(?!checkout|catalog|products\/list))/, required: "UMKM_SELLER" }
    ];

    for (const rule of accessRules) {
      if (rule.pattern.test(url.pathname) && role !== rule.required) {
        console.warn(`SECURITY ALERT: Pengguna ${user.id} dengan role ${role} mencoba mengakses rute terisolasi ${url.pathname}`);
        if (isApiRoute) {
          return new NextResponse(
            JSON.stringify({ success: false, message: "Forbidden. Hak akses peran Anda tidak memadai." }),
            { status: 403, headers: { "content-type": "application/json" } }
          );
        }
        url.pathname = "/"; 
        finalResponse = NextResponse.redirect(url);
        break;
      }
    }
  }

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