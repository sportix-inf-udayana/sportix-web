import React, { Suspense } from "react";
import LoginBanner from "../../components/auth/LoginBanner";
import LoginForm from "../../components/auth/LoginForm";

export const metadata = {
  title: "Login | Sportix",
  description: "Secure gateway to Sportix multi-tenant system."
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden select-none font-sans bg-background">
      {/* Komponen Visual Statis */}
      <LoginBanner />
      
      {/* Komponen Interaktif Form */}
      <div className="w-full md:w-1/2 min-h-full flex items-center justify-center p-6 md:p-12 lg:p-16 bg-black/40">
        <Suspense fallback={<div className="text-brand-emerald font-mono text-sm animate-pulse">MENYIAPKAN SESI...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}