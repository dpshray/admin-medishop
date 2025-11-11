'use client'
import HealthConditionTable from "@/components/healthCondition/health-conditon-table";
import PageHeader from "@/components/headers/PageHeader";
import {Package2} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";


export default function HealthCondition() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Health Condition Dashboard"
                icon={Package2}
                description="Manage your kitbags"
            />

            <div className="my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>

            <div className="mt-6 my-2">
            <HealthConditionTable/>
            </div>
        </div>
    )
}