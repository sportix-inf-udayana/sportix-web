'use client';

import { useState } from 'react';
import { loginAction } from '@/app/(auth)/_actions';

export default function LoginForm() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
      
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="border p-2 rounded" />
      </div>
      
      <div className="flex flex-col gap-1">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="border p-2 rounded" />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Log In'}
      </button>
    </form>
  );
}