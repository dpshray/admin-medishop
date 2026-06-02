"use client";

import { Bell } from "lucide-react";
import PageHeader from "@/components/headers/PageHeader";
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

        <section className="mt-8 w-full">
          <NotificationTable />
        </section>
      </div>
    </div>
  );
}
