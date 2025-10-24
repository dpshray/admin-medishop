'use client'
import PageHeader from "@/components/headers/PageHeader";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import BannerTable from "@/components/table/banner-table";

export default function BannerDashboard() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Banner Dashboard"
                description="Manage your banners"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 my-2">
                {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                    <DashboardCard key={index} {...card} index={index}/>
                ))}
            </div>
            <BannerTable/>
        </div>
    )
}