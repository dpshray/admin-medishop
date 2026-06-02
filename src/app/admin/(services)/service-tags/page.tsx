"use client";

import { Layers } from "lucide-react";
import PageHeader from "@/components/headers/PageHeader";
import AdminServiceTagTable from "@/app/admin/(services)/service-tags/ServiceTagTable";

export default function ServiceTagPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Service Tags"
        icon={Layers}
        description="Manage and organize all service tags"
      />

      <div className="mt-6">
        <AdminServiceTagTable />
      </div>
    </div>
  );
}
