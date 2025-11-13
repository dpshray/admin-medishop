'use client'

import PageHeader from "@/components/headers/PageHeader";
import {TicketPercent} from "lucide-react";
import {adminVendorDashboardCards} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import PromoCouponsTable from "@/components/coupons/coupons-table";

export default function CouponPage() {
    return (
        <div className={'min-h-screen mainContainer'}>
            <PageHeader title={'Coupons Dashboard'}
                        icon={TicketPercent}
                        description={'Manage your coupons'}/>
            <div className=" my-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                        <DashboardCard key={index} {...card} index={index}/>
                    ))}
                </div>
            </div>
            <div className={'mt-6  my-2'}>
                <PromoCouponsTable/>
            </div>
        </div>
    )
}
