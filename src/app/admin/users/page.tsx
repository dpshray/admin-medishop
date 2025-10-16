'use client'

import PageHeader from "@/components/headers/PageHeader"
import {User} from "lucide-react"
import {DashboardCard} from "@/components/dashboard/dashboard-card"

import {adminDashboardData} from "@/data";
import UserTable from "@/components/table/user-table"; // 👈 replace with your own component


export default function UserDashboardPage() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="User Dashboard"
                icon={User}
                description="View your recent activity, orders, and account insights"
            />

            {/* Cards Section */}
            <div className="my-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminDashboardData.map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>

            {/* Orders / Activity Table */}
            <div className="mt-6 my-2">
                <UserTable/>
            </div>
        </div>
    )
}
