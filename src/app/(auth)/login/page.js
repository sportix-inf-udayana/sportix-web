// src/app/(auth)/login/page.js
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import LoginBanner from '@/components/auth/LoginBanner';
import { APP_CONFIG } from '@/lib/constants';

export const metadata = {
  title: 'Login - Sportix',
  description: 'Sign in to your Sportix account',
};

export default function LoginPage({ searchParams }) {
  const isRegistered = searchParams?.registered === 'true';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 font-sans selection:bg-brand-emerald/30 selection:text-brand-emerald relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <LoginBanner 
          title="Authorization" 
          subtitle="Provide your credentials" 
        />
        
        {isRegistered && (
          <div className="mb-6 p-3 text-[10px] font-mono font-bold tracking-widest text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 rounded-lg text-center uppercase">
            Registration complete. Proceed to authorize.
          </div>
        )}
        
        <LoginForm />

        <div className="mt-8 text-center border-t border-zinc-800/60 pt-6">
          <p className="text-xs text-zinc-500 font-mono">
            Belum memiliki akses?{' '}
            <Link href={APP_CONFIG.routes.auth.register} className="text-white hover:text-brand-emerald transition-colors font-bold underline decoration-zinc-700 underline-offset-4">
              Inisialisasi Entitas
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}