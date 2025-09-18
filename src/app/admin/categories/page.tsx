'use client'
import CategoryTable from "@/app/admin/categories/CategoryTable";
import PageHeader from "@/components/headers/PageHeader";
import {Building2} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/card/dashboard/dashboard-card";

export default function CategoryPage() {

    return (
        <div className={'min-h-screen'}>
            <PageHeader title={'Categories Dashboard'}
                        icon={Building2}
                        description={'Manage your categories'}/>
            <div className=" my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div
                className={'mt-6  my-2'}>
                <CategoryTable/>
            </div>
        </div>
    )
}