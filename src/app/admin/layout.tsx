"use client"

import type React from "react"
import type { NavGroup } from "@/components/sidebar/app-sidebar"
import type { DropdownGroup } from "@/components/sidebar/user-dropdown"
import {
    BarChart3,
    Box,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GalleryHorizontalIcon,
    History,
    Home,
    Layers,
    Package,
    Settings,
    ShoppingCart,
    Tag,
    UserPen,
    Users,
    Warehouse,
} from "lucide-react"
import ReusableSidebar from "@/components/sidebar/resuable-sidebar"
import { notifications } from "@/data"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
                { label: "Packages", href: "/admin/package", icon: Warehouse },
                { label: "Banners", href: "/admin/banners", icon: GalleryHorizontalIcon },
            ],
        },
        {
            label: "Orders",
            items: [
                { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
                { label: "Vendor Products", href: "/admin/vendor-product", icon: Package },
                { label: "Order History", href: "/admin/order-history", icon: History },
            ],
        },
        {
            label: "Prescriptions",
            items: [
                { label: "Prescriptions", href: "/admin/prescriptions", icon: ClipboardList },
                { label: "Prescription History", href: "/admin/prescription-history", icon: FileText },
            ],
        },
        {
            label: "Reports & Analytics",
            items: [
                { label: "Reports", href: "/admin/reports", icon: BarChart3 },
                { label: "Report History", href: "/admin/report-history", icon: ClipboardCheck },
            ],
        },
        {
            label: "Settings",
            items: [
                { label: "Profile", href: "/admin/profile", icon: UserPen },
                { label: "Preferences", href: "/admin/preferences", icon: Settings },
            ],
        },
    ]

    const dropdownGroups: DropdownGroup[] = [
        {
            items: [
                { label: "Profile", href: "/admin/profile", icon: UserPen },
            ],
        },
    ]

    return (
        <ReusableSidebar
            navGroups={navGroups}
            title="Admin Dashboard"
            subtitle="Admin Dashboard"
            currentHref="/admin"
            notifications={notifications}
            dropdownGroups={dropdownGroups}
        >
            {children}
        </ReusableSidebar>
    )
}
