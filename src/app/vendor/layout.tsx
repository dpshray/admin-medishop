"use client"

import type React from "react"
import type {NavGroup} from "@/components/sidebar/app-sidebar"
import type {DropdownGroup} from "@/components/sidebar/user-dropdown"
import {Home, Package, ShoppingCart, UserPen,} from "lucide-react"
import ReusableSidebar from "@/components/sidebar/resuable-sidebar"
import {ProtectedRoute} from "@/config/ProtectedRoutes";

export default function VendorLayout({children}: { children: React.ReactNode }) {
    const navGroups: NavGroup[] = [
        {
            label: "Main",
            items: [
                {label: "Dashboard", href: "/vendor", icon: Home},
            ],
        },
        {
            label: "Products",
            items: [
                {label: "Products", href: "/vendor/products", icon: Package},
            ],
        },
        {
            label: "Orders",
            items: [
                {label: "Orders", href: "/vendor/vendor-orders", icon: ShoppingCart},

            ],
        },

        {
            label: "Settings",
            items: [
                {label: "Profile", href: "/vendor/profile", icon: UserPen},
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
                    href: "/vendor/profile",
                    icon: UserPen,
                },
            ],
        },
    ]

    return (
        // <ProtectedRoute requiredRoles={["vendor"]}>
        <ReusableSidebar
            navGroups={navGroups}
            title="Vendor Dashboard"
            subtitle="Manage your store"
            currentHref="/vendor"
            notifications={notifications}
            dropdownGroups={dropdownGroups}
        >
            {children}
        </ReusableSidebar>
        // </ProtectedRoute>
    )
}
