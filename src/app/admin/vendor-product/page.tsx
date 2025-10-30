'use client';

import {ShoppingCart} from "lucide-react";
import dynamic from "next/dynamic";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import {adminVendorDashboardCards} from "@/data";


const VendorProductRequestTable = dynamic(() => import("@/components/vendor/VendorProductRequestTable"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
                <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
        </div>
    ),
});

export default function VendorProductDashboard() {
    return (
        <div className="min-h-screen w-full">
            <div className="mainContainer px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    title="Vendor Product Dashboard"
                    icon={ShoppingCart}
                    description="Manage and track all vendor products"
                />

                <section className="mt-6">
                    <div className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                            <DashboardCard key={index} {...card} index={index}/>
                        ))}
                    </div>
                </section>

                <section className="mt-8 w-full">
                    <VendorProductRequestTable/>
                </section>
            </div>
        </div>
    );
}