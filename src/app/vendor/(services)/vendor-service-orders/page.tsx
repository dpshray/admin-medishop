"use client";

import PageHeader from "@/components/headers/PageHeader";
import { Building2 } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import VendorOrderServiceTable from "@/app/vendor/(services)/vendor-service-orders/VendorOrderServiceTable";

export default function VendorServiceOrders() {
  return (
    <div className="min-h-screen mainContainer">
      <div className="mt-6">
        <VendorOrderServiceTable />
      </div>
    </div>
  );
}
