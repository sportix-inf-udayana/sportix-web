import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';

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

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = APP_CONFIG.routes.auth.login;
    return NextResponse.redirect(url);
  }

  // Mencegah user login mengakses halaman otentikasi kembali
  if (user && (pathname === APP_CONFIG.routes.auth.login || pathname === APP_CONFIG.routes.auth.register)) {
    const url = request.nextUrl.clone();
    url.pathname = APP_CONFIG.routes.protected.customer; // Atau logic routing dinamis berdasarkan role user
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};