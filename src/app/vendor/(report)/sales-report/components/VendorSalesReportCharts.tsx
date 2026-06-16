"use client";

import { CURRENCY_SYMBOL } from "@/config/app-constant";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface RevenueTrendItem {
  label: string;
  revenue: number;
  order_count: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  units_sold: string;
  revenue: string;
}

interface Props {
  revenueTrend?: RevenueTrendItem[];
  topProducts?: TopProduct[];
  isLoading?: boolean;
}

const BAR_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

function ChartSkeleton() {
  return <div className="h-52 w-full bg-gray-50 rounded-lg animate-pulse" />;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(val);
}

export default function VendorSalesReportCharts({
  revenueTrend = [],
  topProducts = [],
  isLoading,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Revenue Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Daily revenue over selected period
          </p>
        </div>

        {isLoading ? (
          <ChartSkeleton />
        ) : revenueTrend.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-gray-400">
            No revenue data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <AreaChart
              data={revenueTrend}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${CURRENCY_SYMBOL} ${v}`}
                width={48}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${CURRENCY_SYMBOL} ${value}`,
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Top Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Best performing products by revenue
          </p>
        </div>

        {isLoading ? (
          <ChartSkeleton />
        ) : topProducts.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-gray-400">
            No product data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <BarChart
              data={topProducts.map((p) => ({
                name:
                  p.product_name.length > 14
                    ? p.product_name.slice(0, 14) + "…"
                    : p.product_name,
                revenue: parseFloat(p.revenue),
                units: parseInt(p.units_sold),
              }))}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${CURRENCY_SYMBOL} ${v}`}
                width={48}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "revenue"
                    ? [`${CURRENCY_SYMBOL} ${value}`, "Revenue"]
                    : [value, "Units Sold"]
                }
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {topProducts.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
