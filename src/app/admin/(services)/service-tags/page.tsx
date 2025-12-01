'use client'

import {Layers} from "lucide-react";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import {adminVendorDashboardCards} from "@/data";
import AdminServiceTagTable from "@/app/admin/(services)/service-tags/ServiceTagTable";

export default function ServiceTagPage() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Service Tags"
                icon={Layers}
                description="Manage and organize all service tags"
            />
            <div className="my-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div className="mt-6">
                <AdminServiceTagTable/>
            </div>
        </div>
    );
}
