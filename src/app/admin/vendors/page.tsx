"use client";

import { Building2, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { adminVendorDashboardCards } from "@/data";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import VendorTable from "@/app/admin/vendors/VenderTable";
import PageHeader from "@/components/headers/PageHeader";
import { useGetVendorTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";

export default function VendorPage() {
  const { data, isLoading } = useGetVendorTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Vendors",
      value: String(totals?.total_vendor ?? 0),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: undefined,
    },
    {
      title: "Active Vendors",
      value: String(totals?.active_vendors ?? 0),
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Inactive Vendors",
      value: String(totals?.inactive_vendors ?? 0),
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      changeType: "negative" as const,
    },
    {
      title: "New Vendors This Month",
      value: String(totals?.new_vendors_month ?? 0),
      icon: UserPlus,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        icon={Building2}
        title="Vendor Management"
        description={"Manage your vendors"}
      />

      <div className="my-4">
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

      <div className={" mt-6"}>
        <VendorTable />
      </div>
    </div>
  );
}
