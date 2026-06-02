"use client";

import { Layers } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import { adminVendorDashboardCards } from "@/data";
import AdminServiceProviderTable from "@/app/admin/(services)/service-providers/ServiceProviderTable";

export default function ServiceProviderPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Service Provided"
        icon={Layers}
        description="Manage and organize all service Provided "
      />

      <div className="mt-6">
        <AdminServiceProviderTable />
      </div>
    </div>
  );
}
