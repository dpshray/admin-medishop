"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/app-constant";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendPoint {
  label: string;
  value: number;
}

interface CategoryPoint {
  id: number;
  category_name: string;
  units_sold: string;
  revenue: string;
}

interface SalesChartsProps {
  revenueTrend?: TrendPoint[];
  ordersTrend?: TrendPoint[];
  salesByCategory?: CategoryPoint[];
  isLoading: boolean;
}

const formatNPR = (value: number) =>
  `${CURRENCY_SYMBOL} ${value.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DONUT_COLORS = [
  "#4a358e",
  "#6d5cb5",
  "#9b8fd4",
  "#c4b8e8",
  "#e0d9f5",
  "#f0ecfb",
];

const ChartSkeleton = ({ height = 220 }: { height?: number }) => (
  <Skeleton className="w-full rounded-lg" style={{ height }} />
);

const ChartEmpty = ({
  height = 220,
  label = "No data for selected period",
}: {
  height?: number;
  label?: string;
}) => (
  <div
    className="flex flex-col items-center justify-center gap-2 w-full rounded-lg border border-dashed border-gray-200 bg-gray-50/50"
    style={{ height }}
  >
    <BarChart2 size={28} className="text-gray-300" strokeWidth={1.5} />
    <p className="text-xs text-gray-400 font-medium">{label}</p>
  </div>
);

export function SalesCharts({
  revenueTrend,
  ordersTrend,
  salesByCategory,
  isLoading,
}: SalesChartsProps) {
  const hasRevenue = revenueTrend && revenueTrend.length > 0;
  const hasOrders = ordersTrend && ordersTrend.length > 0;
  const hasCategory = salesByCategory && salesByCategory.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {isLoading ? (
            <ChartSkeleton height={220} />
          ) : !hasRevenue ? (
            <ChartEmpty height={220} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={revenueTrend}
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a358e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4a358e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    `${CURRENCY_SYMBOL}${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [formatNPR(value), "Revenue"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4a358e"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ fill: "#4a358e", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sales by Category - Donut */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Sales by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {isLoading ? (
            <ChartSkeleton height={220} />
          ) : !hasCategory ? (
            <ChartEmpty height={220} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={salesByCategory.map((cat) => ({
                      ...cat,
                      revenue: Number(cat.revenue),
                    }))}
                    dataKey="revenue"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {salesByCategory.map((_, i) => (
                      <Cell
                        key={i}
                        fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name, props) => [
                      formatNPR(Number(value)),
                      props.payload?.category_name ?? "Revenue",
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1.5 px-2">
                {salesByCategory.map((cat, i) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            DONUT_COLORS[i % DONUT_COLORS.length],
                        }}
                      />
                      <span className="text-gray-600 truncate">
                        {cat.category_name}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 tabular-nums ml-2">
                      {CURRENCY_SYMBOL} {Number(cat.revenue).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Trend */}
      <Card className="lg:col-span-3 border border-gray-100 shadow-sm">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Orders Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {isLoading ? (
            <ChartSkeleton height={180} />
          ) : !hasOrders ? (
            <ChartEmpty height={180} />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={ordersTrend}
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Orders"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#4a358e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
