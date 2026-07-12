import BookingClient from '@/components/booking/BookingClient';
import { getVenueById } from '@/lib/services/customer.service';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const venue = await getVenueById(params.venueId);
  if (!venue) return { title: 'Venue Not Found' };
  
  return {
    title: `Book ${venue.name} - Sportix`,
    description: venue.description,
  };
}

export default async function BookingPage({ params }) {
  const { venueId } = params;
  
  // Fetch data di server (0 waterfall di client)
  const venueData = await getVenueById(venueId);

  if (!venueData) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{venueData.name}</h1>
        <p className="text-gray-500 mt-2">{venueData.address}</p>
      </div>

      {/* Oper data ke client component */}
      <BookingClient initialVenueData={venueData} />
    </main>
  );
}