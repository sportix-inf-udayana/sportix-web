import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // 1. Validasi Otorisasi & Peran
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    // Ambil data user untuk memastikan dia adalah SUPER_ADMIN
    const { data: adminUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ success: false, message: "Forbidden. Audit requires Super Admin privilege." }), { status: 403 });
    }

    const body = await req.json();
    const { withdrawalId, action } = body; // action = 'APPROVE' or 'REJECT'

    if (!withdrawalId || !action) {
      return new Response(JSON.stringify({ success: false, message: "Missing required audit parameters." }), { status: 400 });
    }

    // 2. Kunci transaksi log pencairan (Serializable Check)
    const { data: withdrawal, error: fetchErr } = await supabase
      .from("withdrawal_logs")
      .select("*")
      .eq("id", withdrawalId)
      .eq("status", "PENDING")
      .single();

    if (fetchErr || !withdrawal) {
      return new Response(JSON.stringify({ success: false, message: "Withdrawal not found or already processed." }), { status: 404 });
    }

    if (action === 'APPROVE') {
      // 3. Verifikasi saldo mencukupi sebelum approve
      const { data: balanceData } = await supabase
        .from("balances")
        .select("amount")
        .eq("user_id", withdrawal.user_id)
        .single();

      if (!balanceData || Number(balanceData.amount) < Number(withdrawal.amount)) {
        return new Response(JSON.stringify({ success: false, message: "Insufficient partner balance for this withdrawal." }), { status: 400 });
      }

      // 4. Update status menjadi APPROVED
      await supabase.from("withdrawal_logs").update({ 
        status: "APPROVED",
        resolved_by: user.id 
      }).eq("id", withdrawalId);

      // 5. Eksekusi Ledger: Otomatis memicu fungsi 'trigger_update_balance' di database
      await supabase.from("ledger_transactions").insert({
        user_id: withdrawal.user_id,
        transaction_type: "DEBIT",
        source: "WITHDRAWAL",
        amount: withdrawal.amount,
        withdrawal_id: withdrawalId
      });

    } else if (action === 'REJECT') {
      await supabase.from("withdrawal_logs").update({ 
        status: "REJECTED",
        resolved_by: user.id 
      }).eq("id", withdrawalId);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Withdrawal successfully ${action}D.`,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}