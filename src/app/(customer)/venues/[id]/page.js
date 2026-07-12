import { getVenueById } from '@/lib/services/customer.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// SEO Dinamis berdasarkan data venue
export async function generateMetadata({ params }) {
  const venue = await getVenueById(params.id);
  if (!venue) return { title: 'Venue Not Found' };
  
  return {
    title: `${venue.name} - Sportix Venues`,
    description: venue.description || `Book ${venue.name} at Sportix`,
  };
}

export default async function VenueDetailPage({ params }) {
  const { id } = params;
  
  // Fetch di server
  const venue = await getVenueById(id);

  if (!venue) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Banner Area */}
        <div className="w-full h-64 md:h-96 bg-gray-200 relative">
          {venue.images?.[0] ? (
            <Image
              src={venue.images[0]}
              alt={venue.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{venue.name}</h1>
            <p className="text-gray-500 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {venue.address}
            </p>
            
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">About this venue</h3>
              <p>{venue.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Pricing & Booking Card */}
          <div className="w-full md:w-80 bg-gray-50 p-6 rounded-xl border border-gray-200 shrink-0">
            <div className="mb-6">
              <span className="text-gray-500 block mb-1">Starting from</span>
              <span className="text-3xl font-bold text-gray-900">Rp {venue.price_per_hour.toLocaleString()}</span>
              <span className="text-gray-500"> /hour</span>
            </div>
            
            <Link 
              href={`/booking/${venue.id}`}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}