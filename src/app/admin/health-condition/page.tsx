"use client";
import HealthConditionTable from "@/components/healthCondition/health-conditon-table";
import PageHeader from "@/components/headers/PageHeader";
import { Package2 } from "lucide-react";
import { adminVendorDashboardCards } from "@/data";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

export default function HealthCondition() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Health Condition Dashboard"
        icon={Package2}
        description="Manage health conditions and their information"
      />

      <div className="mt-6 my-2">
        <HealthConditionTable />
      </div>
    </div>
  );
}
