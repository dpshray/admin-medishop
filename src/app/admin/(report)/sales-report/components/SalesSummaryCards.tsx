"use client";

import {
  TrendingUp,
  ShoppingCart,
  Package,
  RotateCcw,
  Wallet,
  BadgePercent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY_SYMBOL } from "@/config/app-constant";

interface SummaryCards {
  total_gmv: number;
  total_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  total_refunds: number;
  net_revenue: number;
  commission_earned: number;
}

interface SalesSummaryCardsProps {
  data?: SummaryCards;
  isLoading: boolean;
}

const formatNPR = (value: number) =>
  `${CURRENCY_SYMBOL} ${value.toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CARDS = [
  {
    key: "total_gmv",
    label: "Total GMV",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    format: formatNPR,
  },
  {
    key: "total_orders",
    label: "Total Orders",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "avg_order_value",
    label: "Avg Order Value",
    icon: Wallet,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    format: formatNPR,
  },
  {
    key: "total_items_sold",
    label: "Items Sold",
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-50",
    format: (v: number) => v.toLocaleString(),
  },
  // {
  //   key: "net_revenue",
  //   label: "Net Revenue",
  //   icon: TrendingUp,
  //   color: "text-teal-600",
  //   bg: "bg-teal-50",
  //   format: formatNPR,
  // },
  // {
  //   key: "total_refunds",
  //   label: "Total Refunds",
  //   icon: RotateCcw,
  //   color: "text-red-600",
  //   bg: "bg-red-50",
  //   format: formatNPR,
  // },
  {
    key: "commission_earned",
    label: "Commission Earned",
    icon: BadgePercent,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    format: formatNPR,
  },
] as const;

export function SalesSummaryCards({ data, isLoading }: SalesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon, color, bg, format }) => (
        <Card key={key} className="border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-20 mt-3" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${bg}`}
                >
                  <Icon size={16} className={color} strokeWidth={2} />
                </div>
                <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">
                  {data ? format(data[key] as number) : "—"}
                </p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
