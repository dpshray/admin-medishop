"use client";

import PageHeader from "@/components/headers/PageHeader";
import {DashboardCard} from "@/components/card/dashboard/dashboard-card";
import {adminVendorDashboardCards} from "@/data";
import TagsAdminTable from "@/app/admin/tags/tags-admin-table";

export default function TagPages() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Tags Management"
                description="Manage your tags for products"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 my-2">
                {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                    <DashboardCard key={index} {...card} index={index}/>
                ))}
            </div>
            <TagsAdminTable/>
        </div>
    );
}
