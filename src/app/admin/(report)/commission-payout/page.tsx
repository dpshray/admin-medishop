"use client";

import PageHeader from "@/components/headers/PageHeader";
import AdminCommissionPayoutTable from "@/components/table/AdminCommissionPayoutTable";
import { Banknote } from "lucide-react";

export default function CommissionPayoutPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Commission Payout"
        description="Track vendor commission rates, gross sales, and net payable amounts"
        icon={Banknote}
      />

      <div className="mt-6">
        <AdminCommissionPayoutTable />
      </div>
    </div>
  );
}
