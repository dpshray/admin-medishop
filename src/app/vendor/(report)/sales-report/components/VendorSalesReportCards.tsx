"use client";

import { TrendingUp, ShoppingCart, Package, BarChart2 } from "lucide-react";
import { useGetVendorSalesReport } from "@/hooks/use-report";
import { CURRENCY_SYMBOL } from "@/config/app-constant";

interface SummaryCards {
  my_revenue: number;
  my_orders: number;
  items_sold: number;
  avg_order_value: number;
}

interface CardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  isLoading,
}: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
          {label}
        </p>
        {isLoading ? (
          <div className="mt-1 h-6 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="mt-0.5 text-xl font-bold text-gray-900 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  data?: SummaryCards;
  isLoading?: boolean;
}

export default function VendorSalesReportCards({ data, isLoading }: Props) {
  const cards: CardProps[] = [
    {
      label: "My Revenue",
      value: data ? `${CURRENCY_SYMBOL} ${data.my_revenue}` : "—",
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "My Orders",
      value: data ? String(data.my_orders) : "—",
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Items Sold",
      value: data ? String(data.items_sold) : "—",
      icon: Package,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      label: "Avg Order Value",
      value: data ? `${CURRENCY_SYMBOL} ${data.avg_order_value}` : "—",
      icon: BarChart2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
