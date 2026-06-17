"use client";
import PageHeader from "@/components/headers/PageHeader";
import { Layers } from "lucide-react";
import ProductFormTable from "@/components/table/ProductFormTable";

export default function ProductForms() {
  return (
    <div className="mainContainer">
      <PageHeader
        title="Product Forms"
        icon={Layers}
        description="Manage product form types, package types, and units"
      />

      <div className="mt-6 my-2">
        <ProductFormTable />
      </div>
    </div>
  );
}
