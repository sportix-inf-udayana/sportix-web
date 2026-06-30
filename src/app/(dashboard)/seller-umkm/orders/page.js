import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ShipmentDispatcherClient from "../../../../components/umkm/ShipmentDispatcherClient";

// FIX 1: Amankan sirkulasi order baru dengan mematikan cache static HTML
export const dynamic = 'force-dynamic';

export default async function SellerUmkmOrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // FIX 2: Proteksi SSR RBAC
  if (!user || user.user_metadata?.role !== 'UMKM_SELLER') {
    redirect("/login");
  }

  // Tarik jangkar profil toko jualan merchant
  const { data: store } = await supabase
    .from("umkm_stores")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .single();

  if (!store || store.status !== 'APPROVED') {
    redirect("/seller-umkm/pending");
  }

  // Ambil manifes pesanan masuk yang sudah lunas terbayar (PREPARING) atau yang sudah dikirim (SHIPPED)
  const { data: rawOrders } = await supabase
    .from("umkm_orders")
    .select(`
      id, status, quantity, delivery_address, created_at,
      umkm_products ( name, price )
    `)
    .eq("store_id", store.id)
    .in("status", ["PREPARING", "SHIPPED"])
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-black font-display text-white uppercase tracking-tight">
          Mitra Lokapasar UMKM
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase">
          Pengelola Toko: <span className="text-purple-400">{store.name}</span>
        </p>
      </div>

      <ShipmentDispatcherClient initialOrders={rawOrders || []} />
    </div>
  );
}