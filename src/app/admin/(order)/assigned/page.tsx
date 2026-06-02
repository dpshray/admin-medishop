"use client";
import AdminAssignedOrders from "@/app/admin/(order)/assigned/admin-assigned-orders";
import PageHeader from "@/components/headers/PageHeader";
import { ShoppingCart } from "lucide-react";
import { Suspense } from "react";

export default function Assigned() {
  return (
    <div className="min-h-screen mainContainer">
      <PageHeader
        title="Owing Orders"
        icon={ShoppingCart}
        description="Manage and track all customer orders i.e. orders assigned to Admin"
      />

      <div className="mt-6">
        <Suspense fallback={<div>Loading...</div>}>
          <AdminAssignedOrders />
        </Suspense>
      </div>
    </div>
  );
}
