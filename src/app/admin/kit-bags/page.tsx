"use client";

import PageHeader from "@/components/headers/PageHeader";
import { Package2 } from "lucide-react";
import KitBagsTable from "@/components/kit-bag/kit-bags-table";

export default function KitBagPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Kitbags Management"
        icon={Package2}
        description="Manage your kitbags"
      />

      <div className="mt-6 my-2">
        <KitBagsTable />
      </div>
    </div>
  );
}
