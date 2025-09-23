'use client'
import AdminProductTable from "@/components/product/admin-product-table";
import PageHeader from "@/components/headers/PageHeader";
import {Building2} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";

export default function ProductPage() {
    return (
        <div className={'min-h-screen mainContainer'}>
            <PageHeader title={'Products Dashboard'}
                        icon={Building2}
                        description={'Manage your products'}/>
            <div className=" my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div
                className={'mt-6  my-2'}>
                <AdminProductTable/>
            </div>
        </div>
    )
}