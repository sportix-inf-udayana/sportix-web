import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  // Cegah layout shift atau flicker dengan mengeksekusi auth check di Edge
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
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

  const url = request.nextUrl.clone();
  const isApiRoute = url.pathname.startsWith("/api");
  const isDashboardRoute = url.pathname.startsWith("/super-admin") || 
                           url.pathname.startsWith("/admin-venue") || 
                           url.pathname.startsWith("/coach") || 
                           url.pathname.startsWith("/seller-umkm");

  // Pengecualian mutlak: Webhook Midtrans dan Cron Scheduler tidak boleh diblokir oleh JWT user
  const isPublicWebhook = url.pathname.startsWith("/api/payments/webhook") || url.pathname.startsWith("/api/cron");

  if (!user && !isPublicWebhook) {
    if (isApiRoute) {
      // Tolak akses langsung API yang tidak terautentikasi
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized. JWT Missing or Invalid." }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    
    if (isDashboardRoute || url.pathname.startsWith("/profile")) {
      // Redirect UI jika mencoba akses dasbor tanpa login
      url.pathname = "/login";
      return NextResponse.redirect(url);
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