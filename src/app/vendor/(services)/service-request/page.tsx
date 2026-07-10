"use client";

import ServiceRequestTable from "@/app/vendor/(services)/service-request/service-request-table";

export default function ServiceRequestPage() {
  return (
    <div className="min-h-screen mainContainer">
      <div className="mt-6 my-2">
        <ServiceRequestTable />
      </div>
    </div>
  );
}
