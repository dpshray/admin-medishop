"use client";

import PageHeader from "@/components/headers/PageHeader";
import TagsAdminTable from "@/app/admin/tags/tags-admin-table";

export default function TagPages() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Tags Management"
        description="Manage your tags for products"
      />

      <div className="mt-6 my-2">
        <TagsAdminTable />
      </div>
    </div>
  );
}
