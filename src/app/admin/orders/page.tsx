'use client'

import { ShoppingCart } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import { adminVendorDashboardCards } from "@/data";
import AdminOrderTable from "@/app/admin/orders/admin-order-table";

export default function OrderDashboard() {
    return (
        <div className="min-h-screen mainContainer" >
            <PageHeader
                title="Order Table"
                icon={ShoppingCart}
                description="Manage and track all customer orders"
            />
            <div className="my-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index} />
                    ))}
                </div>
            </div>
            <div className="mt-6">
              <AdminOrderTable/>
            </div>
        </div>
    );
}
