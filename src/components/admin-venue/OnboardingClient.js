'use client';

import { useState, useTransition } from 'react';
import { submitVenueOnboardingAction } from '@/app/(dashboard)/admin-venue/_actions';

export default function OnboardingClient() {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitVenueOnboardingAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto mt-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Venue Registration</h2>
        <p className="text-gray-500 text-sm mt-1">Please provide your venue details to partner with us.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
          <input type="text" id="name" name="name" required disabled={isPending} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
          <input type="tel" id="phone" name="phone" required disabled={isPending} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
          <textarea id="address" name="address" required rows="3" disabled={isPending} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description / Facilities</label>
          <textarea id="description" name="description" rows="4" disabled={isPending} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}