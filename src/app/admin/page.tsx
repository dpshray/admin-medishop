"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, ShoppingCart, Package, Store, Tag } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CURRENCY_SYMBOL } from "@/config/app-constant";
import { useGetDashboardTotals } from "@/hooks/use-dashboard";
import DashboardCardSkeleton from "@/components/dashboard/DashboardCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import userService from "@/service/user.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/lib/helper";
import { STATUS_TYPE } from "@/types/enum";
import { UserTable } from "@/components/table/user-table";
import Link from "next/link";
import orderService from "@/service/order/order.service";
import { OrderType } from "@/components/order/admin/admin-order-table";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const { data, isLoading } = useGetDashboardTotals();
  const totals = data?.data;

  const dashboardCards = [
    {
      title: "Total Products",
      value: String(totals?.total_products ?? 0),
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Orders",
      value: String(totals?.total_orders ?? 0),
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Vendors",
      value: String(totals?.total_vendors ?? 0),
      icon: Store,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Users",
      value: String(totals?.total_users ?? 0),
      icon: Users,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Total Brands",
      value: String(totals?.total_brands ?? 0),
      icon: Tag,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  const { data: recentUser } = useQuery({
    queryKey: ["recent-users"],
    queryFn: () => userService.getAllUser({ page: 1, per_page: 10 }),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () =>
      orderService.getAllOrders({
        page: 1,
        per_page: 5,
      }),
  });

  return (
    <div className="mainContainer space-y-6 my-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back to your SaaS platform
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))
          : dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} index={index} />
            ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12 min-w-0">
        {/* Recent Customers */}
        <Card className="lg:col-span-8 min-w-0">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Latest customer subscriptions and activity
              </CardDescription>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Link href="/admin/users">View All Customers</Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[680px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sm:w-auto">Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead className="text-right sm:text-left">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recentUser?.items?.map((user: UserTable) => (
                      <TableRow key={user.uuid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.image} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          {user.total_orders}
                        </TableCell>

                        <TableCell className="font-medium">
                          {CURRENCY_SYMBOL} {user.total_purchase_amount}
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              user.status
                                ? STATUS_TYPE.VERIFIED
                                : STATUS_TYPE.UNVERIFIED
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Recent Orders */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest customer orders placed on the platform
              </CardDescription>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-2">
            {ordersLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-muted"
                  />
                ))
              : recentOrders?.items?.slice(0, 5).map((order: OrderType) => (
                  <div
                    key={order.order_uuid}
                    onClick={() =>
                      router.push(`/admin/orders/${order.order_uuid}`)
                    }
                    className="cursor-pointer p-4 rounded-xl border hover:bg-muted/60 transition-all active:scale-[0.985]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">
                            #{order.order_code}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>

                        <p className="text-sm text-muted-foreground truncate">
                          {order.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.email}
                        </p>
                      </div>

                      <div className="text-right sm:text-right shrink-0">
                        <p className="font-medium text-sm">
                          {order.no_of_ordered_items} Item
                          {order.no_of_ordered_items > 1 ? "s" : ""}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={order.payment_status} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
