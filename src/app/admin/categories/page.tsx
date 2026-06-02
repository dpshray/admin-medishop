"use client";

import CategoryTable from "@/components/categories/CategoryTable";
import PageHeader from "@/components/headers/PageHeader";
import { LayoutGrid } from "lucide-react";

export default function CategoryPage() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Categories Dashboard"
        icon={LayoutGrid}
        description="Manage your categories"
      />

      <div className="mt-6 my-2">
        <CategoryTable />
      </div>
    </div>
  );
}
