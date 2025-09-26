"use client"

import type React from "react"
import type {NavGroup} from "@/components/sidebar/app-sidebar"
import type {DropdownGroup} from "@/components/sidebar/user-dropdown"
import {
    BarChart3,
    Box,
    ClipboardCheck,
    ClipboardList,
    FileText,
    History,
    Home,
    Layers,
    Package,
    Settings,
    ShoppingCart,
    Tag,
    Truck,
    UserPen,
    Users,
    Warehouse,
} from "lucide-react"
import ReusableSidebar from "@/components/sidebar/resuable-sidebar";


export default function AdminLayout({children}: { children: React.ReactNode }) {
    const navGroups: NavGroup[] = [
        {
            label: "Main",
            items: [
                {label: "Dashboard", href: "/admin", icon: Home},
                {label: "Vendors", href: "/admin/vendors", icon: Users},
            ],
        },
        {
            label: "Products",
            items: [
                {label: "Brands", href: "/admin/brands", icon: Package},
                {label: "Products", href: "/admin/products", icon: Package},
                {label: "Categories", href: "/admin/categories", icon: Layers},
                {label: "Tags", href: "/admin/tags", icon: Tag},
                {label: "Inventories", href: "/admin/inventories", icon: Warehouse},
            ],
        },
        {
            label: "Orders",
            items: [
                {label: "Orders", href: "/admin/orders", icon: ShoppingCart},
                {label: "Order History", href: "/admin/order-history", icon: History},
            ],
        },
        {
            label: "Prescriptions",
            items: [
                {label: "Prescriptions", href: "/admin/prescriptions", icon: ClipboardList},
                {
                    label: "Prescription History",
                    href: "/admin/prescription-history",
                    icon: FileText,
                },
            ],
        },
        {
            label: "Reports",
            items: [
                {label: "Reports", href: "/admin/reports", icon: BarChart3},
                {label: "Report History", href: "/admin/report-history", icon: ClipboardCheck},
            ],
        },
        {
            label: "Settings",
            items: [
                {label: "Profile", href: "/admin/profile", icon: UserPen},
                {label: "Preferences", href: "/admin/preferences", icon: Settings},
            ],
        },
    ]

    const notifications = [
        {
            id: 1,
            user: "Chris Tompson",
            action: "requested review on",
            target: "PR #42: Feature implementation",
            timestamp: "15 minutes ago",
            unread: true,
        },
        {
            id: 2,
            user: "Emma Davis",
            action: "shared",
            target: "New component library",
            timestamp: "45 minutes ago",
            unread: true,
        },
        {
            id: 3,
            user: "James Wilson",
            action: "assigned you to",
            target: "API integration task",
            timestamp: "4 hours ago",
            unread: false,
        },
        {
            id: 4,
            user: "Alex Morgan",
            action: "replied to your comment in",
            target: "Authentication flow",
            timestamp: "12 hours ago",
            unread: false,
        },
        {
            id: 5,
            user: "Sarah Chen",
            action: "commented on",
            target: "Dashboard redesign",
            timestamp: "2 days ago",
            unread: false,
        },
        {
            id: 6,
            user: "Miky Derya",
            action: "mentioned you in",
            target: "Origin UI open graph image",
            timestamp: "2 weeks ago",
            unread: false,
        },
    ]

    const dropdownGroups: DropdownGroup[] = [
        {
            items: [
                {
                    label: "Profile",
                    href: "/admin/profile",
                    icon: UserPen,
                },
            ],
        },
    ]

    return (
        <ReusableSidebar
            navGroups={navGroups}
            title="Admin Dashboard"
            subtitle="Admin Dashboard"
            currentHref="/admin"
            logo={<Box className="h-5 w-5 text-primary-foreground"/>}
            notifications={notifications}
            dropdownGroups={dropdownGroups}
        >
            {children}
        </ReusableSidebar>
    )
}
