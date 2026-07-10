"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useGetVendorDashboardChart } from "@/hooks/use-report";
import SearchSelectField from "../field/search-select";
import { CURRENCY_SYMBOL } from "@/config/app-constant";

const FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

interface ChartPoint {
  label: string;
  revenue: number;
  order_count: number;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#34D399",
  },
} satisfies ChartConfig;

// Formats "2026-06-24" -> "Jun 24" for a cleaner x-axis
function formatLabel(label: string) {
  const date = new Date(label);
  if (isNaN(date.getTime())) return label;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RevenueChart() {
  const [filter, setFilter] = useState<FilterValue>("last_7_days");

  const { data, isLoading } = useGetVendorDashboardChart({ filter });

  const chartData: ChartPoint[] = useMemo(() => {
    const charts = data?.data?.charts ?? [];
    return charts.map((item: ChartPoint) => ({
      ...item,
      label: formatLabel(item.label),
    }));
  }, [data]);

  return (
    <Card className="rounded-xl border bg-card/40 w-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Revenue performance overview</CardDescription>
        </div>

        <SearchSelectField
          options={
            FILTER_OPTIONS as unknown as { value: string; label: string }[]
          }
          value={filter}
          onChange={(value) => setFilter(value as FilterValue)}
          placeholder="Select range"
          className="w-full sm:w-[180px]"
          maxHeight={240}
        />
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-[350px] w-full items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[350px] w-full items-center justify-center text-sm text-muted-foreground">
            No revenue data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.label
                    }
                    formatter={(value, name, item) => (
                      <div className="flex w-full flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-mono font-medium">
                            {CURRENCY_SYMBOL} {Number(value).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Orders</span>
                          <span className="font-mono font-medium">
                            {item.payload.order_count}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill={chartConfig.revenue.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
