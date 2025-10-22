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
export   const notifications = [
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

export const userDetailsData = {
    id: 1,
    uuid: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Doe",
    email: "john.doe@example.com",
    mobile_number: "+1-555-123-4567",
    status: true,
    email_verified: "2025-10-01T12:30:00Z",
    role: "customer",
    profile_image: "https://randomuser.me/api/portraits/men/32.jpg",
    date_joined: "2023-05-15T09:00:00Z",
    last_login: "2025-10-20T18:45:00Z",
    account_status: "active",
    total_orders: 15,
    total_items_purchased: 42,
    total_purchase_amount: 1240.5,
    preferred_payment_method: "Credit Card",
    shipping_address: {
        full_name: "John Doe",
        phone: "+1-555-123-4567",
        address_line_1: "123 Main St",
        address_line_2: "Apt 4B",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        postal_code: "90001"
    },
    billing_address: {
        full_name: "John Doe",
        phone: "+1-555-123-4567",
        address_line_1: "123 Main St",
        address_line_2: "Apt 4B",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        postal_code: "90001"
    },
    orders: [
        {
            order_id: "ORD-1001",
            date: "2025-09-20T14:30:00Z",
            status: "delivered",
            items_count: 3,
            total_amount: 250.75,
            payment_method: "Credit Card",
            delivery_date: "2025-09-25T16:00:00Z"
        },
        {
            order_id: "ORD-1002",
            date: "2025-10-01T11:15:00Z",
            status: "pending",
            items_count: 1,
            total_amount: 99.99,
            payment_method: "PayPal",
            delivery_date: null
        }
    ],
    wishlist: [
        {
            product_id: 101,
            name: "Wireless Headphones",
            category: "Electronics",
            price: 149.99,
            in_stock: true,
            image_url: "https://example.com/products/headphones.jpg"
        },
        {
            product_id: 102,
            name: "Smart Watch",
            category: "Wearables",
            price: 199.99,
            in_stock: false,
            image_url: "https://example.com/products/smartwatch.jpg"
        }
    ],
    payment_methods: [
        {
            type: "Credit Card",
            last_used: "2025-09-25T16:00:00Z"
        },
        {
            type: "PayPal",
            last_used: "2025-10-01T11:15:00Z"
        }
    ],
    notifications: {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true
    }
}

