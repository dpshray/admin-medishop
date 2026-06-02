"use client";

import PageHeader from "@/components/headers/PageHeader";
import { TicketPercent } from "lucide-react";
import PromoCouponsTable from "@/components/coupons/coupons-table";

export default function CouponPage() {
  return (
    <div className={"min-h-screen mainContainer"}>
      <PageHeader
        title={"Promo Coupons Dashboard"}
        icon={TicketPercent}
        description={"Manage your coupons"}
      />

      <div className={"mt-6  my-2"}>
        <PromoCouponsTable />
      </div>
    </div>
  );
}
