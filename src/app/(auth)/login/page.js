import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import LoginForm from "../../../components/auth/LoginForm";
import LoginBanner from "../../../components/auth/LoginBanner";

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const role = user.user_metadata?.role || 'CUSTOMER';
    
    if (role === 'SUPER_ADMIN') redirect('/super-admin/verifications');
    if (role === 'ADMIN_VENUE') redirect('/admin-venue/slots');
    if (role === 'UMKM_SELLER') redirect('/seller-umkm/products');
    if (role === 'COACH') redirect('/coach/schedule');
    redirect('/'); 
  }

  const callbackUrl = searchParams?.callback || "/";

  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative items-center justify-center border-r border-zinc-800">
        <LoginBanner />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}