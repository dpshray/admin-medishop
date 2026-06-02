"use client";

import { Layers } from "lucide-react";
import PageHeader from "@/components/headers/PageHeader";
import AdminServiceCategoryTable from "@/app/admin/(services)/service-categories/AdminServiceCategoryTable";

export default function ServiceCategoryPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Service Categories"
        icon={Layers}
        description="Manage and organize all service categories"
      />

      <div className="mt-6">
        <AdminServiceCategoryTable />
      </div>
    </div>
  );
}
