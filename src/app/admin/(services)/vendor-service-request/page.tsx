'use client'

import { Layers } from "lucide-react"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import PageHeader from "@/components/headers/PageHeader"
import { adminVendorDashboardCards } from "@/data"
import VendorRequestedServiceTable from "@/app/admin/(services)/vendor-service-request/VendorRequestedServiceTable";


export default function VendorRequestedServices() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Vendor Services"
                icon={Layers}
                description="Manage and monitor all services requested by vendors"
            />
            <div className="my-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index} />
                    ))}
                </div>
            </div>
            <div className="mt-6">
                <VendorRequestedServiceTable />
            </div>
        </div>
    )
}
