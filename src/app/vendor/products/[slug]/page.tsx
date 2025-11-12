'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { AlertCircle, ArrowLeft, DollarSign, Package, Pill, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import vendorProductService from '@/service/product/vendor-product.service'
import { QUERY_STALE_TIME } from '@/config/app-constant'
import ProductPageDetailSkeleton from '@/app/vendor/products/[slug]/loading'
import { FormatCurrency, StatusBadge } from '@/lib/helper'
import { cn } from '@/lib/utils'
import { STATUS_TYPE } from "@/types/enum"
import { DashboardCard } from "@/components/dashboard/dashboard-card"

interface ProductVariation {
    variant_name: string
    size_value: string
    size_unit: string
    units_in_stock: number
    vendor_price: number
}

interface Product {
    product_name: string
    accepted: boolean
    prescription_required: boolean
    brand_name: string
    variations: ProductVariation[]
}

interface VariationItemProps {
    variation: ProductVariation
    index: number
}

const VariationItem = ({ variation, index }: VariationItemProps) => {
    const isLowStock = variation.units_in_stock < 10
    const isOutOfStock = variation.units_in_stock === 0

    return (
        <div
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-900/10 rounded-bl-full opacity-50" />

            <div className="relative p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-900/10 p-2.5 ring-1 ring-indigo-100 dark:ring-indigo-900/50">
                                <Pill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate mb-1">
                                    {variation.variant_name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{variation.size_value}</span>
                                    <span className="text-slate-400 dark:text-slate-500">•</span>
                                    <span>{variation.size_unit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium",
                                    isLowStock && !isOutOfStock && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                )}
                            >
                                <Package className="h-3 w-3 mr-1" />
                                {variation.units_in_stock} in stock
                            </Badge>
                            {isLowStock && !isOutOfStock && (
                                <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                                    Low Stock Alert
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide font-medium">Price</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            {FormatCurrency(variation.vendor_price)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProductPageDetail() {
    const { slug } = useParams()
    const router = useRouter()

    const { data: product, isLoading, isError } = useQuery<Product>({
        queryKey: ['vendor-product-detail', slug],
        queryFn: async () => await vendorProductService.getVendorProductDetail(slug as string),
        staleTime: QUERY_STALE_TIME,
        enabled: !!slug,
    })

    const handleBack = useCallback(() => router.back(), [router])

    const stats = useMemo(() => {
        if (!product?.variations?.length) return null
        const totalStock = product.variations.reduce((sum, v) => sum + v.units_in_stock, 0)
        const prices = product.variations.map(v => v.vendor_price)
        const lowestPrice = Math.min(...prices)
        const highestPrice = Math.max(...prices)
        const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)

        const lowStockCount = product.variations.filter(v => v.units_in_stock < 10 && v.units_in_stock > 0).length
        const outOfStockCount = product.variations.filter(v => v.units_in_stock === 0).length
        const maxPossibleStock = product.variations.length * 100
        const stockPercentage = Math.min(Math.round((totalStock / maxPossibleStock) * 100), 100)

        return { totalStock, lowestPrice, highestPrice, avgPrice, lowStockCount, outOfStockCount, stockPercentage }
    }, [product])

    const statCards = useMemo(
        () =>
            stats
                ? [
                    {
                        title: 'Total Inventory',
                        value: stats.totalStock.toString(),
                        icon: ShoppingCart,
                        color: 'text-blue-600 dark:text-blue-400',
                        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                        changeType: stats.totalStock > 100 ? 'positive' : stats.totalStock < 50 ? 'negative' : 'neutral' as const,
                        change: stats.totalStock > 100 ? '+15%' : stats.totalStock < 50 ? '-8%' : '0%',
                        progressValue: stats.stockPercentage,
                    },
                    {
                        title: 'Product Variations',
                        value: (product?.variations.length || 0).toString(),
                        icon: Package,
                        color: 'text-purple-600 dark:text-purple-400',
                        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                        changeType: 'neutral' as const,
                    },
                    {
                        title: 'Lowest Price',
                        value: FormatCurrency(stats.lowestPrice),
                        icon: DollarSign,
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                        changeType: 'positive' as const,
                        change: 'Best Value',
                    },
                    {
                        title: 'Average Price',
                        value: FormatCurrency(stats.avgPrice),
                        icon: DollarSign,
                        color: 'text-amber-600 dark:text-amber-400',
                        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                        changeType: 'neutral' as const,
                    },
                ]
                : [],
        [stats, product]
    )

    if (isLoading) return <ProductPageDetailSkeleton />

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="gap-2 hover:gap-3 transition-all duration-300 font-medium group"
                        aria-label="Go back to products"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Products</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                    <Alert variant="destructive" className="border-l-4" role="alert">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="text-base">
                            Failed to load product details. Please try again later.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 space-y-8">
                <nav aria-label="Breadcrumb">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="gap-2 hover:gap-3 transition-all duration-300 font-medium group"
                        aria-label="Go back to products"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Products</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </nav>

                <header className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    {product.brand_name}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-stretch-semi-expanded font-serif text-slate-900 dark:text-white tracking-tight leading-tight">
                                {product.product_name}
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <StatusBadge status={product.accepted ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.PENDING}/>
                            {product.prescription_required && (
                                <Badge variant="outline"
                                       className="px-4 py-2 text-sm font-semibold border-2 border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10">
                                    Prescription Required
                                </Badge>
                            )}
                        </div>
                    </div>

                    {stats && (stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
                        <Alert className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/10">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            <AlertDescription className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                                {stats.outOfStockCount > 0 && (
                                    <span>{stats.outOfStockCount} variation{stats.outOfStockCount > 1 ? 's' : ''} out of stock. </span>
                                )}
                                {stats.lowStockCount > 0 && (
                                    <span>{stats.lowStockCount} variation{stats.lowStockCount > 1 ? 's' : ''} running low on stock.</span>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </header>

                {stats && (
                    <section
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
                        aria-label="Product statistics"
                    >
                        {statCards.map((item, idx) => (
                            <DashboardCard key={idx} {...item} index={idx} />
                        ))}
                    </section>
                )}

                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                Product Variations
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Manage inventory levels and pricing across variants
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-sm px-4 py-2 font-medium w-fit">
                            {product.variations.length} {product.variations.length === 1 ? 'Variation' : 'Variations'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {product.variations.map((variation, idx) => (
                            <VariationItem key={idx} variation={variation} index={idx} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}