"use client"

import { memo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Calendar } from "lucide-react"

interface RevenueData {
    month: string
    revenue: number
}

const data: RevenueData[] = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5500 },
    { month: "Jul", revenue: 7000 },
    { month: "Aug", revenue: 6500 },
    { month: "Sep", revenue: 8000 },
    { month: "Oct", revenue: 7500 },
    { month: "Nov", revenue: 9000 },
    { month: "Dec", revenue: 8500 },
]

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "#34D399",
    },
} satisfies ChartConfig

export const RevenueChart: React.FC = memo(() => (
    <Card className="rounded-xl border bg-card/40 w-full">
        <CardHeader className="flex justify-between pb-6">
            <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Revenue Analytics
                </CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
            </div>
            <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Last 6 Months
            </Button>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                        dataKey="revenue"
                        fill={chartConfig.revenue.color}
                        radius={[4, 4, 0, 0]} // rounded top corners
                    />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
))

RevenueChart.displayName = "RevenueChart"
