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

export const userDetailsData ={
    "id": 3,
    "uuid": "22eb9d4a-3b11-4373-9d67-ea3ef374a8b6",
    "name": "user00",
    "email": "user@gmail.com",
    "mobile_number": "9828285118",
    "status": true,
    "email_verified": "Verified",
    "orders": [
        {
            "order_id": 1,
            "order_code": "I1q1k4pIf3L88f0zf1GB",
            "price": 9258.5,
            "payment_method": "Cash on Delivery",
            "payment_status": "UNPAID",
            "order_address": "Shyambhu, Kathmandu",
            "status": "PENDING",
            "created_at": "2025-10-24 10:56:46",
            "order_items_detail": [
                {
                    "item_type": "Product",
                    "product_name": "Fugiat sit molestias sit.",
                    "variant_name": "Variant-6",
                    "quantity": 1,
                    "price": 3258.5,
                    "total": 3258.5,
                    "featured_image": "http://192.168.100.18:8000/storage/516/tablets.jpg",
                    "gallery_images": "http://192.168.100.18:8000/storage/517/cream.jpg"
                },
                {
                    "item_type": "Package",
                    "product_name": null,
                    "variant_name": null,
                    "quantity": 1,
                    "price": 6000,
                    "total": 6000,
                    "featured_image": null,
                    "gallery_images": null
                }
            ]
        }
    ],
    "user_favourite": [
        {
            "type": "Product",
            "id": 138,
            "name": "Esse vel delectus omnis.",
            "slug": "esse-vel-delectus-omnis",
            "description": "<p>Doloribus voluptatibus sit dignissimos et hic. Tempore aut porro ut at. Sit maxime cum sunt quia voluptatem.</p><p>Aut sunt omnis asperiores omnis eius quo. Omnis fugiat sequi autem voluptas.</p><p>Odit officiis reprehenderit qui et. Placeat fugiat et blanditiis sit. Omnis et reprehenderit iure possimus impedit nesciunt consequatur. Sit incidunt eum ad dicta sed nihil. Dolorum eos iure incidunt.</p>",
            "featured_image": "http://192.168.100.18:8000/storage/776/visc-inhaler.jpg"
        }
    ],
    "user_wishlist": [
        {
            "type": "Product",
            "id": 86,
            "name": "Fugiat sit molestias sit.",
            "slug": "fugiat-sit-molestias-sit",
            "description": "<p>Sunt animi nulla corrupti rerum iure harum. Pariatur aspernatur natus voluptatibus sequi placeat aliquam.</p><p>Aliquid distinctio minus amet at. Illum optio debitis soluta reprehenderit exercitationem ea non illo. Accusamus iste tempore vero unde blanditiis alias sequi iste.</p><p>Soluta iusto iure accusantium neque velit beatae natus. Animi commodi laudantium quaerat autem. Dolore omnis optio eum et.</p>",
            "featured_image": "http://192.168.100.18:8000/storage/516/tablets.jpg"
        },
        {
            "type": "Package",
            "id": 5,
            "name": "Smart Kit",
            "slug": "smart-kit",
            "description": "<p>Aperiam quia sit non perspiciatis voluptates sit. Est quo distinctio est et ad nam. Blanditiis suscipit sit est amet et atque.</p><p>Velit hic atque voluptatem dolores consequatur. Voluptatibus est sed deserunt quasi qui ullam. Aut quis corporis velit odit qui ea vel.</p><p>Voluptas vitae accusamus sed consequatur est voluptatem nam velit. Nihil magni voluptatibus quaerat iure voluptatem excepturi. Officia eum consequatur vel ut magni repellendus dolorum. Consequatur ipsa expedita voluptatem qui et minima.</p>",
            "featured_image": "http://192.168.100.18:8000/storage/2611/package-1.jpg"
        }
    ],
    "User_cart": [
        {
            "cart_id": 1,
            "item_name": "Esse vel delectus omnis.",
            "item_slug": "esse-vel-delectus-omnis",
            "brand_name": "Sanofi",
            "variant_name": "Variant-2",
            "image": "http://192.168.100.18:8000/storage/776/visc-inhaler.jpg",
            "quantity": 1,
            "price": 1342,
            "subtotal": 1342
        }
    ]
}


