"use client";
import PageHeader from "@/components/headers/PageHeader";
import { Package2 } from "lucide-react";
import GenericNameTable from "@/components/generic-name/generic-name-table";

export default function GenericName() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Generic Name Dashboard"
        icon={Package2}
        description="Manage your Pharmaceutical Generic Names"
      />

      <div className="mt-6 my-2">
        <GenericNameTable />
      </div>
    </div>
  );
}
