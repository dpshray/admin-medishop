'use client';

import {ShoppingCart} from "lucide-react";
import dynamic from "next/dynamic";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import PageHeader from "@/components/headers/PageHeader";
import {adminVendorDashboardCards} from "@/data";
import VendorProductTable from "@/components/vendor/vendor-product-table";


export default function VendorProductPage() {
    return (
        <div className="min-h-screen w-full">
            <div className="mainContainer px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    title="Admin Product Requests"
                    icon={ShoppingCart}
                    description="Review and manage all product requests submitted by vendors."
                />

                <section className="mt-6">
                    <div className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                            <DashboardCard key={index} {...card} index={index} />
                        ))}
                    </div>
                </section>

                <section className="mt-8 w-full">
                    <VendorProductTable />
                </section>
            </div>
        </div>
    );
}
