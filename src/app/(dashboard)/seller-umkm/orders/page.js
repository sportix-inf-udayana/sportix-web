import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ShipmentDispatcherClient from "../../../../components/umkm/ShipmentDispatcherClient";

export const dynamic = 'force-dynamic';

export default async function UmkmOrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'UMKM_SELLER') redirect("/login");

  const { data: orders, error: orderError } = await supabase
    .from("umkm_orders")
    .select("id, status, total_price, created_at, quantity, umkm_products(name, image_url), users(raw_user_meta_data)")
    .order("created_at", { ascending: false });

  if (orderError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [DATABASE ERROR]: Spionase industri digagalkan atau koneksi terputus. {orderError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase">Manajemen Pesanan Logistik</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Pusat komando logistik UMKM (Encrypted Bearer Token).</p>
      </div>
      
      <ShipmentDispatcherClient initialOrders={orders || []} />
    </div>
  );
}