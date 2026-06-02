"use client";

import PageHeader from "@/components/headers/PageHeader";
import { User, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

import UserTable from "@/components/table/user-table";
import { useGetUserTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";

export default function UserDashboardPage() {
  const { data, isLoading } = useGetUserTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Users",
      value: String(totals?.total_user ?? 0),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: undefined,
    },
    {
      title: "Active Users",
      value: String(totals?.active_users ?? 0),
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      changeType: "positive" as const,
    },
    {
      title: "Inactive Users",
      value: String(totals?.inactive_users ?? 0),
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      changeType: "negative" as const,
    },
    {
      title: "New Users This Month",
      value: String(totals?.new_users_month ?? 0),
      icon: UserPlus,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="User Dashboard"
        icon={User}
        description="View your recent activity, orders, and account insights"
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

      <div className="mt-6 my-2">
        <UserTable />
      </div>
    </div>
  );
}
