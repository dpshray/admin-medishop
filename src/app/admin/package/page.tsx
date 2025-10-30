'use client'
import CategoryTable from "@/components/categories/CategoryTable";
import PageHeader from "@/components/headers/PageHeader";
import {Building2} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import PackageTable from "@/app/admin/package/package-table";

export default function PackagePage() {

    return (
        <div className={'min-h-screen mainContainer'}>
            <PageHeader title={'Package Dashboard'}
                        icon={Building2}
                        description={'Manage your packages'}/>
            <div className=" my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div
                className={'mt-6  my-2'}>
                <PackageTable/>
            </div>
        </div>
    )
}