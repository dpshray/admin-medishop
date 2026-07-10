"use client";

import VendorRequestedServiceTable from "@/app/admin/(services)/vendor-service-request/VendorRequestedServiceTable";

export default function VendorRequestedServices() {
  return (
    <div className="min-h-screen mainContainer">
      <div className="mt-6">
        <VendorRequestedServiceTable />
      </div>
    </div>
  );
}
