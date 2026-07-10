"use client";

import VendorServiceTable from "@/app/vendor/(services)/vendor-service/vendor-service-table";

export default function VendorServicePage() {
  return (
    <div className={"min-h-screen mainContainer"}>
      <div className={"mt-6  my-2"}>
        <VendorServiceTable />
      </div>
    </div>
  );
}
