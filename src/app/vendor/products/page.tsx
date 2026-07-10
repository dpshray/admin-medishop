"use client";

import VendorProductTable from "@/components/vendor/vendor-product-table";

export default function VendorProductPage() {
  return (
    <div className="min-h-screen w-full">
      <div className="mainContainer px-4 py-6 sm:px-6 lg:px-8">
        <section className="mt-8 w-full">
          <VendorProductTable />
        </section>
      </div>
    </div>
  );
}
