"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Download, Package, Plus, Settings} from "lucide-react"
import {cn} from "@/lib/utils"
import {DashboardCard} from "@/components/card/dashboard/dashboard-card"
import {RevenueChart} from "@/components/card/dashboard/revenue-chart"
import UsersTable from "@/components/card/dashboard/users-table"
import {Button} from "@/components/ui/button"
import {motion} from "framer-motion"
import {Badge} from "@/components/ui/badge"

export default function VendorPage() {
    const recentActivities = [
        {type: "vendor", message: "New vendor registration: fashionhub@store.com", time: "5 min ago"},
        {type: "product", message: "ElectroMart added 15 new products", time: "25 min ago"},
        {type: "sales", message: "MegaMart hit $10k sales milestone", time: "1 hour ago"},
        {type: "alert", message: "Delayed shipping reported for FreshFoods", time: "2 hours ago"},
    ]

    const topProducts = [
        {id: 1, name: "Wireless Headphones", sold: "1,200 units", growth: "+15%", vendors: 12},
        {id: 2, name: "Organic Apples Pack", sold: "890 units", growth: "+9%", vendors: 6},
    ]

    const dashboardCards = [
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

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8">
            <div
                className={cn('flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 p-6 rounded-xl text-white my-2')}>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between w-full">
                    <div className="space-y-4 max-w-lg">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Premium</Badge>
                        <h2 className="text-3xl font-bold">Welcome to Vendor Dashboard</h2>
                        <p className="text-white/80">Manage your vendors, products, and sales performance</p>
                        <div className="flex flex-wrap gap-3">
                            <Button className="rounded-2xl bg-white text-purple-700 hover:bg-white/90">
                                Explore Plans
                            </Button>
                            <Button variant="outline"
                                    className="rounded-2xl  !bg-white/10 border-white text-background hover:bg-white/10">
                                Take a Tour
                            </Button>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <motion.div
                            animate={{rotate: 360}}
                            transition={{duration: 50, repeat: Infinity, ease: "linear"}}
                            className="relative h-40 w-40"
                        >
                            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md"/>
                            <div className="absolute inset-4 rounded-full bg-white/20"/>
                            <div className="absolute inset-8 rounded-full bg-white/30"/>
                            <div className="absolute inset-12 rounded-full bg-white/40"/>
                            <div className="absolute inset-16 rounded-full bg-white/50"/>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                {dashboardCards.map((card, index) => (
                    <DashboardCard key={index} {...card} index={index}/>
                ))}
            </div>

            <div className="w-full overflow-x-auto mt-6">
                <RevenueChart/>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                <UsersTable onAddUser={function (): void {
                    throw new Error("Function not implemented.")
                }}/>
                <Card className="w-full lg:w-1/2">
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Most popular products this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.map((product) => (
                                <div key={product.id} className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm">{product.name}</h4>
                                        <span className="text-xs text-muted-foreground">{product.vendors} vendors</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{product.sold}</span>
                                        <span className="text-green-600">{product.growth}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7 mt-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from vendors</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Vendor management shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[
                                {title: "Add New Vendor", desc: "Register new sellers on the platform", icon: Plus},
                                {title: "Manage Products", desc: "View and update vendor products", icon: Package},
                                {title: "Download Sales Report", desc: "Export sales analytics", icon: Download},
                                {title: "Vendor Settings", desc: "Configure vendor accounts", icon: Settings},
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    className={cn(
                                        "w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors sm:text-sm"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <action.icon className="w-5 h-5 text-purple-600 flex-shrink-0"/>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{action.title}</div>
                                            <div className="text-xs text-gray-600">{action.desc}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
