import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { getTournaments } from '@/lib/services/customer.service';

export const metadata = {
  title: 'Tournaments - Sportix',
  description: 'Join or watch upcoming sports tournaments.',
};

export default async function TournamentsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const tournaments = await getTournaments(supabase);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Tournaments</h1>
        <p className="text-gray-600 mt-2">Compete, watch, and be part of the community.</p>
      </header>

      {tournaments.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-500">No tournaments available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <article key={tournament.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {tournament.banner_url && (
                <div className="w-full h-48 relative">
                  <Image
                    src={tournament.banner_url}
                    alt={tournament.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{tournament.title}</h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    tournament.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-blue-600">
                    Rp {tournament.registration_fee.toLocaleString()}
                  </span>
                  <span className="text-gray-500">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}