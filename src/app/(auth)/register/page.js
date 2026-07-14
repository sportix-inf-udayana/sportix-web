import RegisterForm from '@/components/auth/RegisterForm';
import LoginBanner from '@/components/auth/LoginBanner';

export const metadata = {
  title: 'Register - Sportix',
  description: 'Create a new Sportix account',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <LoginBanner 
          title="Create Account" 
          subtitle="Join Sportix to get started" 
        />
        
        <RegisterForm />
      </div>
    </main>
  );
}