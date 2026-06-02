"use client";

import PageHeader from "@/components/headers/PageHeader";
import { Boxes, BoxSelect, PackageX } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PackageTable from "@/app/admin/package/package-table";
import { useGetPackageTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";

export default function PackagePage() {
  const { data, isLoading } = useGetPackageTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Packages",
      value: String(totals?.total_packages ?? 0),
      icon: Boxes,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Packages",
      value: String(totals?.active_packages ?? 0),
      icon: BoxSelect,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Inactive Packages",
      value: String(totals?.inactive_packages ?? 0),
      icon: PackageX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      changeType: "negative" as const,
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Package Dashboard"
        icon={Boxes}
        description="Manage your packages"
      />
      <div className="my-2">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))
            : dashboardCards.map((card, index) => (
                <DashboardCard key={index} {...card} index={index} />
              ))}
        </div>
      </div>
      <div className="mt-6 my-2">
        <PackageTable />
      </div>
    </div>
  );
}
