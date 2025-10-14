'use client';

import {ShoppingCart} from "lucide-react";
import dynamic from "next/dynamic";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import {adminVendorDashboardCards} from "@/data";


const VendorProductTable = dynamic(() => import("@/app/admin/vendor-product/vendor-product-table"), {
    ssr: false,
    loading: () => <p>Loading products...</p>,
});

export default function VendorProductDashboard() {
    return (
        <div className="min-h-screen mainContainer px-6 py-4">
            <PageHeader
                title="Vendor Product Dashboard"
                icon={ShoppingCart}
                description="Manage and track all vendor products"
            />
            <section className="my-4">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </section>
            <section className="mt-6">
                <VendorProductTable/>
            </section>
        </div>
    );
}
