import React from "react";
import CustomerHeader from "../../components/customer/CustomerHeader";
import CustomerFooter from "../../components/customer/CustomerFooter";

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <CustomerHeader />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <CustomerFooter />
    </div>
  );
}