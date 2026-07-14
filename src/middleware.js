import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';

// Peta routing dinamis berdasarkan role user
const ROLE_DASHBOARD_MAP = {
  SUPER_ADMIN: APP_CONFIG.routes.protected.superAdmin,
  ADMIN_VENUE: APP_CONFIG.routes.protected.admin,
  COACH: APP_CONFIG.routes.protected.coach,
  UMKM_SELLER: APP_CONFIG.routes.protected.seller,
  CUSTOMER: APP_CONFIG.routes.protected.customer,
};

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isPublicRoute = APP_CONFIG.routes.public.includes(pathname);

  // LOGIC 1: Block unauthenticated users dari halaman private
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = APP_CONFIG.routes.auth.login;
    return NextResponse.redirect(url);
  }

  // LOGIC 2: Dinamis Redirect jika authenticated user mengakses halaman auth
  if (user && (pathname === APP_CONFIG.routes.auth.login || pathname === APP_CONFIG.routes.auth.register)) {
    const userRole = user.user_metadata?.role || 'CUSTOMER';
    const targetDashboard = ROLE_DASHBOARD_MAP[userRole] || APP_CONFIG.routes.protected.customer;
    
    const url = request.nextUrl.clone();
    url.pathname = targetDashboard;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Mengecualikan aset statis dan API (API sudah diproteksi wrapper di endpoint masing-masing)
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};