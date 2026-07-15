// src/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';

const ROLE_MAP = {
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
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
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
  
  const isPublicRoute = APP_CONFIG.routes.public.some(route => pathname === route || pathname.startsWith('/api/payments/webhook'));
  const isAuthRoute = pathname === APP_CONFIG.routes.auth.login || pathname === APP_CONFIG.routes.auth.register;

  if (!user && !isPublicRoute && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = APP_CONFIG.routes.auth.login;
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const role = user.user_metadata?.role || 'CUSTOMER';
    const target = ROLE_MAP[role] || ROLE_MAP.CUSTOMER;
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};