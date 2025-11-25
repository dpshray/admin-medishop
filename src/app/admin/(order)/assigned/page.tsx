'use client'
import AdminAssignedOrders from "@/app/admin/(order)/assigned/admin-assigned-orders";
import PageHeader from "@/components/headers/PageHeader";
import {ShoppingCart} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import {Suspense} from "react";

export default function Assigned() {
    return (
        <div className="min-h-screen mainContainer">
            <PageHeader
                title="Owing Orders"
                icon={ShoppingCart}
                description="Manage and track all customer orders i.e. orders assigned to Admin"
            />
            <div className="my-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div className="mt-6">
                <Suspense fallback={<div>Loading...</div>}>
                    <AdminAssignedOrders/>
                </Suspense>
            </div>
        </div>
    )

}