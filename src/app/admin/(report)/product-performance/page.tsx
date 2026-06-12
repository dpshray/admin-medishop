"use client";

import PageHeader from "@/components/headers/PageHeader";
import ProductPerformanceTable from "@/components/table/ProductPerformanceTable";
import { TrendingUp } from "lucide-react";
export default function BrandPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Product Performance"
        description="Track sales, revenue, and return rates across your product catalog"
        icon={TrendingUp}
      />

      <div className="mt-6">
        <ProductPerformanceTable />
      </div>
    </div>
  );
}
