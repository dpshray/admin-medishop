"use client";

import AdminProductTable from "@/components/product/admin-product-table";
import PageHeader from "@/components/headers/PageHeader";
import {
  Building2,
  Package,
  PackageCheck,
  PackageX,
  PackagePlus,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useGetProductTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";
import { useState } from "react";
import { useGetDisclaimer } from "@/hooks/useProduct";
import { DisclaimerDialog } from "@/components/modal/DisclaimerDialog";

export default function ProductPage() {
  const { data, isLoading } = useGetProductTotals();
  const totals = data?.data;

  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const { data: disclaimerData } = useGetDisclaimer();
  const hasDisclaimer = !!disclaimerData?.data?.disclaimer;

  const dashboardCards = [
    {
      title: "Total Products",
      value: String(totals?.total_products ?? 0),
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Products",
      value: String(totals?.active_products ?? 0),
      icon: PackageCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Inactive Products",
      value: String(totals?.inactive_products ?? 0),
      icon: PackageX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      changeType: "negative" as const,
    },
    {
      title: "New Products This Month",
      value: String(totals?.new_products_month ?? 0),
      icon: PackagePlus,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Products Dashboard"
        icon={Building2}
        description="Manage your products"
        actionLabel={hasDisclaimer ? "Edit Disclaimer" : "Add Disclaimer"}
        onAction={() => setDisclaimerOpen(true)}
      />
      <div className="my-2">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))
            : dashboardCards.map((card, index) => (
                <DashboardCard key={index} {...card} index={index} />
              ))}
        </div>
      </div>
      <div className="mt-6 my-2">
        <AdminProductTable />
      </div>

      <DisclaimerDialog
        open={disclaimerOpen}
        onOpenChange={setDisclaimerOpen}
      />
    </div>
  );
}
