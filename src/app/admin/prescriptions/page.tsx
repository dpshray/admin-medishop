"use client";
import PageHeader from "@/components/headers/PageHeader";
import { HeartPlus } from "lucide-react";
import PrescriptionTable from "@/components/prescription/prescription-table";

export default function Prescriptions() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Prescription Dashboard"
        icon={HeartPlus}
        description="Manage prescriptions and their information"
      />

      <div className="mt-6 my-2">
        <PrescriptionTable />
      </div>
    </div>
  );
}
