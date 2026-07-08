import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import RegisterForm from "../../../components/auth/RegisterForm";
import LoginBanner from "../../../components/auth/LoginBanner";

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
        <RegisterForm />
      </div>

      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center order-1 lg:order-2 border-l border-zinc-800">
         <LoginBanner />
      </div>
    </div>
  );
}