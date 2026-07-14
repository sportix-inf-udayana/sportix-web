import LoginForm from '@/components/auth/LoginForm';
import LoginBanner from '@/components/auth/LoginBanner';

export const metadata = {
  title: 'Login - Sportix',
  description: 'Sign in to your Sportix account',
};

export default function LoginPage({ searchParams }) {
  // Menangkap parameter dari registerAction
  const isRegistered = searchParams?.registered === 'true';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <LoginBanner 
          title="Welcome Back" 
          subtitle="Please sign in to continue" 
        />
        
        {isRegistered && (
          <div className="mb-6 p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg text-center font-medium">
            Account created successfully. You can now log in.
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}