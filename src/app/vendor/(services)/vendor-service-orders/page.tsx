'use client'

import PageHeader from "@/components/headers/PageHeader";
import {Building2} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import VendorOrderServiceTable from "@/app/vendor/(services)/vendor-service-orders/VendorOrderServiceTable";

export default function VendorServiceOrders() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Assigned Vendor Service Orders"
                icon={Building2}
                description="View and manage the service orders assigned to you by the admin."
            />

            <div className="my-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <VendorOrderServiceTable/>
            </div>
        </div>
    );
}
