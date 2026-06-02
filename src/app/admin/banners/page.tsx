"use client";

import PageHeader from "@/components/headers/PageHeader";
import BannerTable from "@/components/table/banner-table";

export default function BannerDashboard() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader title="Banner Management" description="Manage your banners" />
      <div className="mt-6 my-2">
        <BannerTable />
      </div>
    </div>
  );
}
