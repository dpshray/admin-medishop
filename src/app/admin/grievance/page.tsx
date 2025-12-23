'use client';

import { MessageSquare } from "lucide-react";
import PageHeader from "@/components/headers/PageHeader";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { adminVendorDashboardCards } from "@/data";
import GrievanceTable from "@/components/grievance/grievance-table";

export default function GrievancePage() {
    return (
        <div className="min-h-screen w-full">
            <div className="mainContainer px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    title="Admin Grievances"
                    icon={MessageSquare}
                    description="Review, track, and resolve grievances raised by users and vendors."
                />

                <section className="mt-6">
                    <div className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {adminVendorDashboardCards.slice(0, 4).map((card, index) => (
                            <DashboardCard key={index} {...card} index={index} />
                        ))}
                    </div>
                </section>

                <section className="mt-8 w-full">
                    <GrievanceTable />
                </section>
            </div>
        </div>
    );
}
