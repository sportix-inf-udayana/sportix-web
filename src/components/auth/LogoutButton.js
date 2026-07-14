'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/app/(auth)/_actions';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
      aria-label="Logout"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}