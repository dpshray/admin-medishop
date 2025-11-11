import {TrendingDown, TrendingUp} from "lucide-react";
import React from "react";

interface MetricCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    trend?: { value: number; isPositive: boolean }
    description?: string
}

const ProductMetricCard = ({title, value, icon: Icon, trend, description}: MetricCardProps) => (
    <div
        className="group bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <Icon className="h-4 w-4 text-slate-600"/>
                    </div>
                    <span className="text-sm font-medium text-slate-600">{title}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
                {description && (
                    <p className="text-xs text-slate-500">{description}</p>
                )}
            </div>
        </div>
        {trend && (
            <div className="flex items-center gap-1 mt-4 pt-4 border-t border-slate-100">
                {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-emerald-600"/>
                ) : (
                    <TrendingDown className="h-3 w-3 text-red-600"/>
                )}
                <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-slate-500 ml-1">vs last month</span>
            </div>
        )}
    </div>
)

export default ProductMetricCard
