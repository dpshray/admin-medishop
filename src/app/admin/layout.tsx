"use client";

import type React from "react";
import type { NavGroup } from "@/components/sidebar/app-sidebar";
import type { DropdownGroup } from "@/components/sidebar/user-dropdown";
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Home,
  ImageIcon,
  Layers,
  MessageSquare,
  Package,
  ShoppingCart,
  Tag,
  TicketPercent,
  TrendingUp,
  UserPen,
  Users,
  Warehouse,
} from "lucide-react";
import ReusableSidebar from "@/components/sidebar/resuable-sidebar";
import { notifications } from "@/data";
import { useGetOrderTotals } from "@/hooks/use-dashboard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data } = useGetOrderTotals();
  const pendingOrders = data?.data?.total_pending_orders ?? 0;

  const navGroups: NavGroup[] = [
    {
      label: "Dashboard",
      items: [
        { label: "Overview", href: "/admin", icon: Home },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Vendors", href: "/admin/vendors", icon: Users },
      ],
    },
    {
      label: "Products & Catalog",
      items: [
        { label: "Brands", href: "/admin/brands", icon: Package },
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Categories", href: "/admin/categories", icon: Layers },
        { label: "Tags", href: "/admin/tags", icon: Tag },
        { label: "Promo Coupons", href: "/admin/coupons", icon: TicketPercent },
        { label: "Packages", href: "/admin/package", icon: Warehouse },
        { label: "Banners", href: "/admin/banners", icon: ImageIcon },
        { label: "Generic Names", href: "/admin/generic-name", icon: Package },
        { label: "Kit Bags", href: "/admin/kit-bags", icon: Package },
      ],
    },
    {
      label: "Orders",
      items: [
        {
          label: "Orders",
          href: "/admin/orders",
          icon: ShoppingCart,
          ...(pendingOrders > 0 && { badge: pendingOrders }),
        },
        {
          label: "Products Request",
          href: "/admin/vendor-product",
          icon: Package,
        },
        {
          label: "Booked Services Order",
          href: "/admin/booked-services",
          icon: Package,
        },
        { label: "Assigned Orders", href: "/admin/assigned", icon: Package },
      ],
    },
    {
      label: "Services",
      items: [
        {
          label: "Service Categories",
          href: "/admin/service-categories",
          icon: Layers,
        },
        {
          label: "Service Providers",
          href: "/admin/service-providers",
          icon: FileText,
        },
        { label: "Service Tags", href: "/admin/service-tags", icon: Tag },
        {
          label: "Vendor Service Request",
          href: "/admin/vendor-service-request",
          icon: FileText,
        },
      ],
    },
    {
      label: "Health Records",
      items: [
        {
          label: "Health Conditions",
          href: "/admin/health-condition",
          icon: FileText,
        },
        {
          label: "Prescriptions",
          href: "/admin/prescriptions",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: "Reports & Analytics",
      items: [
        { label: "Sales Report", href: "/admin/sales-report", icon: BarChart3 },
        {
          label: "Product Performance",
          href: "/admin/product-performance",
          icon: Package,
        },
        {
          label: "Vendor Performance",
          href: "/admin/vendor-performance",
          icon: TrendingUp,
        },
      ],
    },
    {
      label: "Settings",
      items: [
        { label: "Notification", href: "/admin/notification", icon: Bell },
        { label: "Grievance", href: "/admin/grievance", icon: MessageSquare },
        { label: "Profile", href: "/admin/profile", icon: UserPen },
      ],
    },
  ];

  const sortedNavGroups = navGroups.map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => a.label.localeCompare(b.label)),
  }));

  const dropdownGroups: DropdownGroup[] = [
    {
      items: [{ label: "Profile", href: "/admin/profile", icon: UserPen }],
    },
  ];

  return (
    <ReusableSidebar
      navGroups={sortedNavGroups}
      title="Admin Dashboard"
      subtitle="Admin Dashboard"
      currentHref="/admin"
      // notifications={notifications}
      dropdownGroups={dropdownGroups}
    >
      <main className="grow">{children}</main>
    </ReusableSidebar>
  );
}
