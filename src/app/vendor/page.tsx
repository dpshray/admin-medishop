"use client";

import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import vendorService from "@/service/vendor.service";
import { useGetVendorDashboardChart } from "@/hooks/use-report";

export default function VendorPage() {
  const { data } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: () => vendorService.vendorDashboard(),
  });

  const dashboardData = [
    {
      title: "Total Uploaded Products",
      value: data?.data?.total_uploaded_products_count || 0,
      changeType: "neutral" as const,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Assigned Orders",
      value: data?.data.total_assigned_orders_count || 0,
      changeType: "neutral" as const,
      icon: Package,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Delivered Orders",
      value: data?.data.total_delivered_orders_count || 0,
      changeType: "neutral" as const,
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Vendor Earnings",
      value: data?.data.total_vendor_earning || 0,
      changeType: "neutral" as const,
      icon: Package,
      color: "text-pink-500",
      bgColor: "bg-pink-100",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div
        className={cn(
          "flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 p-6 rounded-xl text-white my-2",
        )}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between w-full">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold">Welcome to Vendor Dashboard</h2>
            <p className="text-white/80">
              Manage your vendors, products, and sales performance
            </p>
          </div>
          <div className="hidden lg:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="relative h-20 w-20"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
              <div className="absolute inset-4 rounded-full bg-white/20" />
              <div className="absolute inset-8 rounded-full bg-white/30" />
              <div className="absolute inset-12 rounded-full bg-white/40" />
              <div className="absolute inset-16 rounded-full bg-white/50" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        {dashboardData.map((card, index) => (
          <DashboardCard key={index} {...card} index={index} />
        ))}
      </div>

      <div className="w-full overflow-x-auto mt-6">
        <RevenueChart />
      </div>
    </div>
  );
}
