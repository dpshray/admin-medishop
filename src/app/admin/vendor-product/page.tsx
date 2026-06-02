"use client";

import { ShoppingCart, ClipboardList, Clock, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import { useGetProductRequestTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";

const AdminProductRequestsTable = dynamic(
  () => import("@/components/vendor/AdminProductRequestsTable"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    ),
  },
);

export default function AdminProductRequestsPage() {
  const { data, isLoading } = useGetProductRequestTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Product Requests",
      value: String(totals?.total_product_request ?? 0),
      icon: ClipboardList,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pending Requests",
      value: String(totals?.total_pending_product_request ?? 0),
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      changeType: "neutral" as const,
    },
    {
      title: "Approved Requests",
      value: String(totals?.total_approved_product_request ?? 0),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="mainContainer px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Admin Product Requests"
          icon={ShoppingCart}
          description="Review and manage all product requests submitted by vendors."
        />

        <section className="mt-6">
          <div className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <DashboardCardSkeleton key={i} />
                ))
              : dashboardCards.map((card, index) => (
                  <DashboardCard key={index} {...card} index={index} />
                ))}
          </div>
        </section>

        <section className="mt-8 w-full">
          <AdminProductRequestsTable />
        </section>
      </div>
    </div>
  );
}
