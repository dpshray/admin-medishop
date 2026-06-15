"use client";

import PageHeader from "@/components/headers/PageHeader";
import CommissionPayoutTable from "@/components/table/CommissionPayoutTable";
import { useRequestVendorCommissionPayout } from "@/hooks/use-report";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function CommissionPayoutPage() {
  const { mutate: requestPayout, isPending } =
    useRequestVendorCommissionPayout();

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Commission Payouts"
        description="View your payout history and request settlements for earned commissions"
        icon={Wallet}
      >
        <Button
          onClick={() => requestPayout()}
          disabled={isPending}
          size="sm"
          className="gap-2 bg-primaryColor border-primaryColor shadow-sm hover:shadow w-full sm:w-auto"
        >
          {isPending ? <Spinner /> : <Wallet className="h-4 w-4 shrink-0" />}
          <span>{isPending ? "Requesting…" : "Request Payout"}</span>
        </Button>
      </PageHeader>

      <div className="mt-6">
        <CommissionPayoutTable />
      </div>
    </div>
  );
}
