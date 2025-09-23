'use client'

import {Building2} from "lucide-react"
import {adminVendorDashboardCards} from "@/data"
import {DashboardCard} from "@/components/dashboard/dashboard-card"
import VendorTable from "@/app/admin/vendors/VenderTable"
import PageHeader from "@/components/headers/PageHeader";

export default function VendorPage() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                icon={Building2}
                title="Vendor Management"
                description={'Manage your vendors'}
            />


            <div className="my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>

            <div className={' mt-6'}>
                <VendorTable/>
            </div>
        </div>
    )
}
