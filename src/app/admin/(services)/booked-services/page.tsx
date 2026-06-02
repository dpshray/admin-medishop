"use client";

import { Layers, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import BookingServiceTable from "@/app/admin/(services)/booked-services/booking-service-table";
import { useGetServiceBookingTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";

export default function BookedServicesPage() {
  const { data, isLoading } = useGetServiceBookingTotals();
  const totals = data?.data;
  console.log(data);

  const dashboardCards = [
    {
      title: "Total Service Bookings",
      value: String(totals?.total_service_booking ?? 0),
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pending Bookings",
      value: String(totals?.total_pending_service_booking ?? 0),
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Approved Bookings",
      value: String(totals?.total_approved_service_booking ?? 0),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Cancelled Bookings",
      value: String(totals?.total_cancelled_service_booking ?? 0),
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Booked Services"
        icon={Layers}
        description="Manage and organize all services booked by users"
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
        <BookingServiceTable />
      </div>
    </div>
  );
}
