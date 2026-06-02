"use client";

import BrandAdminTable from "@/app/admin/brands/brand-admin-table";
import PageHeader from "@/components/headers/PageHeader";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useGetBrandTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";
import { Tag, CheckCircle, XCircle, Star, TrendingUp } from "lucide-react";

export default function BrandPage() {
  const { data, isLoading } = useGetBrandTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Brands",
      value: String(totals?.total_brands ?? 0),
      icon: Tag,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Brands",
      value: String(totals?.active_brands ?? 0),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Inactive Brands",
      value: String(totals?.inactive_brands ?? 0),
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      changeType: "negative" as const,
    },
    {
      title: "Featured Brands",
      value: String(totals?.total_featured ?? 0),
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Popular Brands",
      value: String(totals?.total_popular ?? 0),
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Brand Management"
        description="Manage your pharmaceutical brand portfolio"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 my-2">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))
          : dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} index={index} />
            ))}
      </div>
      <div className="mt-6">
        <BrandAdminTable />
      </div>
    </div>
  );
}
