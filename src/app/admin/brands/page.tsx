"use client";

import BrandAdminTable from "@/app/admin/brands/brand-admin-table";
import PageHeader from "@/components/headers/PageHeader";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import {adminVendorDashboardCards} from "@/data";

export default function BrandPage() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Brand Management"
                description="Manage your pharmaceutical brand portfolio"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 my-2">
                {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                    <DashboardCard key={index} {...card} index={index}/>
                ))}
            </div>
            <BrandAdminTable/>
        </div>
    );
}
