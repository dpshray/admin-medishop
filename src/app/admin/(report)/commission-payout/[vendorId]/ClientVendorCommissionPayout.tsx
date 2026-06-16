"use client";

import PageHeader from "@/components/headers/PageHeader";
import AdminVendorCommissionPayoutTable from "@/components/table/AdminVendorCommissionPayoutTable";
import { Banknote, ChevronsLeft } from "lucide-react";
import Link from "next/link";

export default function ClientVendorCommissionPayout({
  vendorId,
}: {
  vendorId: number;
}) {
  return (
    <div className="min-h-screen mainContainer">
      <Link
        href="/admin/commission-payout"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronsLeft size={16} />
        Back to Commission Payouts
      </Link>
      <PageHeader
        title="Vendor Payout History"
        description="View and manage individual payout records for this vendor"
        icon={Banknote}
      />

      <div className="mt-6">
        <AdminVendorCommissionPayoutTable vendorId={vendorId} />
      </div>
    </div>
  );
}
