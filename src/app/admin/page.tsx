"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Download, Edit3, Eye, MoreHorizontal, Plus, Settings, Users} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {adminDashboardData} from "@/data";
import {DashboardCard} from "@/components/dashboard/dashboard-card";

export default function AdminPage() {
    const recentActivities = [
        {
            type: "subscription",
            message: "New Pro subscription - $99.00/month",
            time: "2 min ago",
        },
        {
            type: "user",
            message: "New user registration: john@company.com",
            time: "15 min ago",
        },
        {
            type: "feature",
            message: "API usage limit reached for Basic plan",
            time: "1 hour ago",
        },
        {type: "alert", message: "Server response time increased", time: "2 hours ago"},
    ]

    const customers = [
        {
            id: 1,
            name: "Acme Corp",
            email: "admin@acme.com",
            plan: "Enterprise",
            status: "Active",
            mrr: 299,
            joinDate: "2024-01-15",
        },
        {
            id: 2,
            name: "TechStart Inc",
            email: "hello@techstart.com",
            plan: "Pro",
            status: "Active",
            mrr: 99,
            joinDate: "2024-02-03",
        },
        {
            id: 3,
            name: "Digital Agency",
            email: "contact@digital.com",
            plan: "Basic",
            status: "Trial",
            mrr: 0,
            joinDate: "2024-03-10",
        },
        {
            id: 4,
            name: "StartupXYZ",
            email: "team@startupxyz.com",
            plan: "Pro",
            status: "Cancelled",
            mrr: 0,
            joinDate: "2023-12-20",
        },
    ]

    const topFeatures = [
        {
            id: 1,
            name: "API Analytics Dashboard",
            usage: "2,456 requests",
            growth: "+12%",
            users: 89,
        },
        {
            id: 2,
            name: "Real-time Notifications",
            usage: "1,834 events",
            growth: "+8%",
            users: 67,
        },
    ]

    return (
        <div className="mainContainer space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back to your SaaS platform</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Last 30 days"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                {adminDashboardData.map((card, index) => (
                    <DashboardCard key={index} {...card} index={index}/>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Customers</CardTitle>
                        <CardDescription>Latest customer subscriptions and activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>MRR</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-sm text-muted-foreground">{customer.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                      <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                        {customer.plan}
                      </span>
                                        </TableCell>
                                        <TableCell>
                      <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              customer.status === "Active"
                                  ? "bg-green-50 text-green-700"
                                  : customer.status === "Trial"
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-red-50 text-red-700"
                          }`}
                      >
                        {customer.status}
                      </span>
                                        </TableCell>
                                        <TableCell className="font-medium">${customer.mrr}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4"/>
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit3 className="mr-2 h-4 w-4"/>
                                                        Edit customer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Features</CardTitle>
                        <CardDescription>Most used platform features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topFeatures.map((feature) => (
                                <div key={feature.id} className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm">{feature.name}</h4>
                                        <span className="text-xs text-muted-foreground">{feature.users} users</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{feature.usage}</span>
                                        <span className="text-green-600">{feature.growth}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your platform</CardDescription>
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
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[
                                {
                                    title: "Add New User",
                                    desc: "Invite team members or customers",
                                    icon: Plus,
                                },
                                {title: "Manage Subscriptions", desc: "View and update billing", icon: Users},
                                {
                                    title: "Analytics Report",
                                    desc: "Download usage analytics",
                                    icon: Download,
                                },
                                {
                                    title: "Platform Settings",
                                    desc: "Configure API and features",
                                    icon: Settings,
                                },
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <action.icon className="w-5 h-5 text-blue-600"/>
                                        <div>
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
