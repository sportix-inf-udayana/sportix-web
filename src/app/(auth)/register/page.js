import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoginBanner from "../../../components/auth/LoginBanner";
import RegisterForm from "../../../components/auth/RegisterForm";

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/"); 

  return (
    <div className="min-h-screen w-full flex bg-zinc-950 font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block mb-2">
              SPORTIX<span className="text-brand-emerald">.</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-4 uppercase">Inisiasi Akun</h1>
            <p className="text-zinc-500 text-sm mt-2">
              Bergabunglah dengan ekosistem olahraga otonom dan dapatkan akses ke jaringan arena terverifikasi.
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-zinc-500">
            Sudah memiliki otorisasi?{" "}
            <Link href="/login" className="text-brand-emerald font-bold hover:text-emerald-400 transition-colors">
              Akses sistem di sini.
            </Link>
          </p>
          
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center order-1 lg:order-2 border-l border-zinc-800">
         <LoginBanner />
      </div>
    </div>
  );
}