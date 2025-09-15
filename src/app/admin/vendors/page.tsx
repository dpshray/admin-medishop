'use client'

import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { adminVendorDashboardCards } from "@/data"
import { DashboardCard } from "@/components/card/dashboard/dashboard-card"
import VendorTable from "@/app/admin/vendors/VenderTable"

export default function VendorPage() {
    const router = useRouter()
    return (
        <div className="min-h-screen">
            <div className="container  py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your pharmaceutical brand portfolio</p>
                    </div>
                </div>
            </div>

            <div className="">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index} />
                    ))}
                </div>
            </div>

            <div className={' mt-6'}>
                <VendorTable />
            </div>
        </div>
    )
}
