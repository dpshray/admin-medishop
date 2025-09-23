import {User} from "@/components/dashboard/users-table";
import {Download, Package, Settings} from "lucide-react";

export const users: User[] = [
    {
        id: 1,
        name: 'Alex Johnson',
        email: 'alex@example.com',
        avatar: 'https://i.pravatar.cc/40?img=1',
        role: 'Admin',
        status: 'active',
        joinDate: '2024-01-15',
        location: 'New York, US'
    },
    {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://i.pravatar.cc/40?img=2',
        role: 'User',
        status: 'active',
        joinDate: '2024-02-20',
        location: 'San Francisco, US'
    },
    {
        id: 3,
        name: 'Michael Brown',
        email: 'michael@example.com',
        avatar: 'https://i.pravatar.cc/40?img=3',
        role: 'Moderator',
        status: 'inactive',
        joinDate: '2024-01-08',
        location: 'London, UK'
    },
]

export const vendorDashboardCards = [
    {
        title: "Total Vendors",
        value: "1,245",
        change: "+12%",
        changeType: "positive" as const,
        icon: Package,
        color: "text-blue-500",
        bgColor: "bg-blue-100"
    },
    {
        title: "Total Products",
        value: "8,432",
        change: "+8%",
        changeType: "positive" as const,
        icon: Package,
        color: "text-green-500",
        bgColor: "bg-green-100"
    },
    {
        title: "Sales",
        value: "$23,450",
        change: "-3%",
        changeType: "negative" as const,
        icon: Download,
        color: "text-red-500",
        bgColor: "bg-red-100"
    },
    {
        title: "Active Orders",
        value: "1,120",
        change: "+5%",
        changeType: "positive" as const,
        icon: Settings,
        color: "text-purple-500",
        bgColor: "bg-purple-100"
    },
]

export const adminVendorDashboardCards = [
    {
        title: "Total Vendors",
        value: "1,245",
        change: "+12%",
        changeType: "positive" as const,
        icon: Package,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
    },
    {
        title: "Active Vendors",
        value: "1,120",
        change: "+10%",
        changeType: "positive" as const,
        icon: Settings,
        color: "text-green-500",
        bgColor: "bg-green-100",
    },
    {
        title: "New Vendors",
        value: "125",
        change: "+18%",
        changeType: "positive" as const,
        icon: Package,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
    },
    {
        title: "Vendor Products",
        value: "8,432",
        change: "+8%",
        changeType: "positive" as const,
        icon: Package,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100",
    },
    {
        title: "Sales",
        value: "$23,450",
        change: "-3%",
        changeType: "negative" as const,
        icon: Download,
        color: "text-red-500",
        bgColor: "bg-red-100",
    },
    {
        title: "Active Orders",
        value: "1,120",
        change: "+5%",
        changeType: "positive" as const,
        icon: Settings,
        color: "text-indigo-500",
        bgColor: "bg-indigo-100",
    },
]

export const adminDashboardData = [
    {
        title: "Monthly Revenue",
        value: "$45,200",
        change: "+15%",
        changeType: "positive" as const,
        icon: Download,
        color: "text-green-500",
        bgColor: "bg-green-100",
    },
    {
        title: "Total Vendors",
        value: "1,245",
        change: "+12%",
        changeType: "positive" as const,
        icon: Package,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
    },
    {
        title: "Total Payments",
        value: "$120,540",
        change: "+9%",
        changeType: "positive" as const,
        icon: Settings,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
    },
    {
        title: "Total Orders",
        value: "3,452",
        change: "-2%",
        changeType: "negative" as const,
        icon: Package,
        color: "text-red-500",
        bgColor: "bg-red-100",
    },
]


