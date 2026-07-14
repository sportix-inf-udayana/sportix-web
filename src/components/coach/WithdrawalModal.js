"use client";

import React, { useState } from "react";
import { X, Loader2, CheckCircle2, AlertCircle, Building2, CreditCard, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function WithdrawalModal({ isOpen, onClose, availableBalance }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);
  const supabase = getSupabase();

  const withdrawalSchema = z.object({
    amount: z.coerce
      .number({ invalid_type_error: "Masukkan nominal yang valid" })
      .min(50000, "Minimal penarikan Rp 50.000")
      .max(availableBalance, "Melebihi saldo tersedia"),
    bank_name: z.string().min(2, "Bank tujuan wajib diisi"),
    account_number: z.string().min(5, "Nomor rekening tidak valid"),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { amount: "", bank_name: "BCA", account_number: "" }
  });

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    setSubmitError(null);
    setSuccess(false);
    onClose();
  };

  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Akses ditolak. Silakan login kembali.");

      const response = await fetch("/api/coach/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Gagal memproses penarikan.");

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 2000);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative slide-in-from-bottom-4">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">Tarik Saldo</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">WITHDRAWAL REQUEST</p>
          </div>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Permintaan Diproses</h4>
              <p className="text-xs text-zinc-400 font-mono">Dana akan masuk ke rekening Anda dalam 1x24 jam kerja.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 font-mono text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Nominal Penarikan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input 
                    disabled={isSubmitting} 
                    type="number" 
                    placeholder="50000" 
                    {...register("amount")} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
                  />
                </div>
                {errors.amount && <p className="text-red-400 text-[10px] font-mono mt-1 uppercase">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Bank Tujuan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select 
                    disabled={isSubmitting} 
                    {...register("bank_name")} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm appearance-none"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="GOPAY">GoPay</option>
                    <option value="DANA">DANA</option>
                    <option value="OVO">OVO</option>
                  </select>
                </div>
                {errors.bank_name && <p className="text-red-400 text-[10px] font-mono mt-1 uppercase">{errors.bank_name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Nomor Rekening / E-Wallet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input 
                    disabled={isSubmitting} 
                    type="text" 
                    placeholder="Masukkan no. rekening" 
                    {...register("account_number")} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
                  />
                </div>
                {errors.account_number && <p className="text-red-400 text-[10px] font-mono mt-1 uppercase">{errors.account_number.message}</p>}
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between gap-4">
                <button 
                  type="button" 
                  onClick={handleClose} 
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl font-bold font-mono text-xs transition-all disabled:opacity-50 tracking-widest uppercase cursor-pointer"
                >
                  BATAL
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-3.5 bg-brand-emerald hover:bg-emerald-400 text-black rounded-xl font-black font-mono text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none tracking-widest uppercase cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "PROSES"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}