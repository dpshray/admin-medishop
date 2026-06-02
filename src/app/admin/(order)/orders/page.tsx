"use client";

import {
  ShoppingCart,
  ClipboardList,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import AdminOrderTable from "@/components/order/admin/admin-order-table";
import { useGetOrderTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";

export default function OrderDashboard() {
  const { data, isLoading } = useGetOrderTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Orders",
      value: String(totals?.total_orders ?? 0),
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pending Orders",
      value: String(totals?.total_pending_orders ?? 0),
      icon: ClipboardList,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      changeType: "neutral" as const,
    },
    {
      title: "Delivered Orders",
      value: String(totals?.total_delivered_orders ?? 0),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Cancelled Orders",
      value: String(totals?.total_cancelled_orders ?? 0),
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      changeType: "negative" as const,
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Order Dashboard"
        icon={ShoppingCart}
        description="Manage and track all customer orders"
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
      <div className="mt-6">
        <AdminOrderTable />
      </div>
    </div>
  );
}
