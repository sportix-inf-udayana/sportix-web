// src/app/(customer)/page.js
import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedVenues, getUmkmProducts } from '@/lib/services/customer.service';
import { getSupabaseAdmin } from '@/lib/supabase';
import HeroSection from '@/components/customer/HeroSection';
import MarketplaceClient from '@/components/customer/MarketplaceClient';

export const metadata = {
  title: 'Dashboard - Sportix',
  description: 'Book venues, join tournaments, and gear up.',
};

export const revalidate = 60; 

export default async function CustomerDashboard() {
  const supabase = getSupabaseAdmin();
  
  const [venues, products] = await Promise.all([
    getFeaturedVenues(supabase).catch(() => []),
    getUmkmProducts(supabase).catch(() => [])
  ]);

  return (
    <main className="w-full">
      <HeroSection />
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-16 my-8">
        
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Venues</h2>
            <Link href="/venues" className="text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          
          {venues.length === 0 ? (
            <div className="p-6 bg-white border rounded-xl text-center text-gray-500">
              No venues available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {venues.map(venue => (
                <Link 
                  key={venue.id} 
                  href={`/booking/${venue.id}`} 
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative h-40 bg-gray-200 w-full overflow-hidden">
                    {venue.images?.[0] ? (
                      <Image 
                        src={venue.images[0]} 
                        alt={venue.name} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{venue.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 truncate">{venue.address}</p>
                    <p className="text-blue-600 font-semibold">
                      Rp {Number(venue.price_per_hour).toLocaleString('id-ID')}
                      <span className="text-gray-400 text-sm font-normal"> /hour</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sport Equipment</h2>
            <Link href="/umkm" className="text-blue-600 hover:underline font-medium">View Store</Link>
          </div>
          <MarketplaceClient initialProducts={products} />
        </section>
        
      </div>
    </main>
  );
}