"use client";

import PageHeader from "@/components/headers/PageHeader";
import VendorPerformanceTable from "@/components/table/VendorPerformanceTable";
import { TrendingUp } from "lucide-react";

export default function VendorPerformancePage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Vendor Performance"
        description="Track orders, revenue, and fulfillment metrics across all vendors"
        icon={TrendingUp}
      />

      <div className="mt-6">
        <VendorPerformanceTable />
      </div>
    </div>
  );
}
