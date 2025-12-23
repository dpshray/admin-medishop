'use client';

import { Bell } from "lucide-react";
import PageHeader from "@/components/headers/PageHeader";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { adminVendorDashboardCards } from "@/data";
import NotificationTable from "@/components/notification/notification-table";

export default function NotificationPage() {
    return (
        <div className="min-h-screen w-full">
            <div className="mainContainer px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    title="Admin Notifications"
                    icon={Bell}
                    description="View and manage all system notifications."
                />

                <section className="mt-6">
                    <div className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                            <DashboardCard key={index} {...card} index={index} />
                        ))}
                    </div>
                </section>

                <section className="mt-8 w-full">
                    <NotificationTable />
                </section>
            </div>
        </div>
    );
}
