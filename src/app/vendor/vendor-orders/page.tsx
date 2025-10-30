'use client'
import PageHeader from "@/components/headers/PageHeader";
import {Building2} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import VendorOrderTable from "@/components/vendor/vendor-order-table";

export default function VendorOrderPage() {


    return (
        <div className={'min-h-screen mainContainer'}>
            <PageHeader title={'Vendor Orders Dashboard'}
                        icon={Building2}
                        description={'Manage your assigned orders here'}/>
            <div className=" my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div
                className={'mt-6  my-2'}>
                <VendorOrderTable/>
            </div>
        </div>
    )
}