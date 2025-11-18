'use client'

import {useParams, useRouter} from 'next/navigation'
import {useQuery} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'
import {AlertCircle, ArrowLeft, DollarSign, Package, Pill, ShoppingCart} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Alert, AlertDescription} from '@/components/ui/alert'
import vendorProductService from '@/service/product/vendor-product.service'
import {QUERY_STALE_TIME} from '@/config/app-constant'
import ProductPageDetailSkeleton from '@/app/vendor/products/[slug]/loading'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {cn} from '@/lib/utils'
import {STATUS_TYPE} from '@/types/enum'
import {DashboardCard} from '@/components/dashboard/dashboard-card'

interface Variation {
    variant_name: string
    size_value: string
    size_unit: string
    units_in_stock: number
    vendor_price: number
    batch_number: number | string
    manufacture: string
    expiry_date: string
}

interface ProductDetail {
    accepted: boolean | null
    product_name: string
    product_detail: string
    prescription_required: boolean
    brand_name: string
    variations: Variation[]
}

interface VariationItemProps {
    variation: Variation
    index: number
}

const VariationItem = ({variation, index}: VariationItemProps) => {
    const isLowStock = variation.units_in_stock < 10 && variation.units_in_stock > 0
    const isOutOfStock = variation.units_in_stock === 0

    return (
        <article
            className={cn('group relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2')}
            style={{animationDelay: `${index * 50}ms`}}
        >
            <div
                className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-900/10 rounded-bl-full opacity-40 pointer-events-none"
                aria-hidden="true"
            />
            <div className="relative p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start gap-3">
                            <div
                                className="flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-900/10 p-2 ring-1 ring-indigo-100 dark:ring-indigo-900/50"
                                aria-hidden="true"
                            >
                                <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                                    {variation.variant_name}
                                </h3>
                                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    <span className="font-medium">{variation.size_value}</span>
                                    <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">•</span>
                                    <span>{variation.size_unit}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}
                                className={cn(
                                    'px-2.5 py-1 text-xs font-medium',
                                    isLowStock && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                )}
                                aria-label={`${variation.units_in_stock} units in stock`}
                            >
                                <Package className="h-3 w-3 mr-1" aria-hidden="true"/>
                                {variation.units_in_stock} in stock
                            </Badge>
                            {isLowStock && (
                                <Badge
                                    variant="outline"
                                    className="border-amber-500 text-amber-700 dark:text-amber-400"
                                    aria-label="Low stock alert"
                                >
                                    Low Stock
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide font-medium">
                            Price
                        </p>
                        <p className="  font-bold text-slate-900 dark:text-white">
                            {FormatCurrency(variation.vendor_price)}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default function ProductPageDetail() {
    const {slug} = useParams()
    const router = useRouter()

    const {data: product, isLoading, isError} = useQuery<ProductDetail>({
        queryKey: ['vendor-product-detail', slug],
        queryFn: async () => vendorProductService.getVendorProductDetail(slug as string),
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
        return {totalStock, lowestPrice, highestPrice, avgPrice, lowStockCount, outOfStockCount, stockPercentage}
    }, [product])

    const statCards = useMemo(() => {
        if (!stats) return []
        return [
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
                value: product?.variations.length.toString() || '0',
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
        ]
    }, [stats, product])

    if (isLoading) return <ProductPageDetailSkeleton/>

    if (isError || !product) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={handleBack}
                            className="mb-6 gap-2 hover:gap-3 transition-all duration-300 font-medium group"
                            aria-label="Go back to products">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform"
                                   aria-hidden="true"/>
                        Back to Products
                    </Button>
                    <Alert variant="destructive" className="border-l-4" role="alert">
                        <AlertCircle className="h-5 w-5" aria-hidden="true"/>
                        <AlertDescription className="text-sm sm:text-base">Failed to load product details. Please try
                            again later.</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8">
                <nav aria-label="Breadcrumb">
                    <Button variant="ghost" onClick={handleBack}
                            className="gap-2 hover:gap-3 transition-all duration-300 font-medium group -ml-2"
                            aria-label="Go back to products">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform"
                                   aria-hidden="true"/>
                        <span className="hidden xs:inline">Back to Products</span>
                        <span className="xs:hidden">Back</span>
                    </Button>
                </nav>

                <header className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs font-medium" aria-label="Brand">
                                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400"/>
                                {product.brand_name}
                            </Badge>
                            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                                {product.product_name}
                            </h1>
                            <p
                                className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2"
                                dangerouslySetInnerHTML={{ __html: product.product_detail }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <StatusBadge status={product.accepted ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.PENDING}/>
                            {product.prescription_required && (
                                <Badge variant="outline"
                                       className={'border border-red-500 text-red-700 dark:border-red-400 dark:text-red-300'}>
                                    Prescription Required
                                </Badge>
                            )}
                        </div>
                    </div>

                    {stats && (stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
                        <Alert className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/10" role="alert">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" aria-hidden="true"/>
                            <AlertDescription className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                                {stats.outOfStockCount > 0 &&
                                    <span>{stats.outOfStockCount} variation{stats.outOfStockCount > 1 ? 's' : ''} out of stock. </span>}
                                {stats.lowStockCount > 0 &&
                                    <span>{stats.lowStockCount} variation{stats.lowStockCount > 1 ? 's' : ''} running low on stock.</span>}
                            </AlertDescription>
                        </Alert>
                    )}
                </header>

                {stats && (
                    <section className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                             aria-label="Product statistics">
                        {statCards.map((item, idx) => (
                            <DashboardCard key={`stat-${idx}`} {...item} index={idx}/>
                        ))}
                    </section>
                )}

                <section className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Product
                                Variations</h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Manage inventory
                                levels and pricing across variants</p>
                        </div>
                        <Badge variant="secondary"
                               className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-medium w-fit">
                            {product.variations.length} {product.variations.length === 1 ? 'Variation' : 'Variations'}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                        {product.variations.map((variation, idx) => (
                            <VariationItem key={`variation-${idx}`} variation={variation} index={idx}/>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
