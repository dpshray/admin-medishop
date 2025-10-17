'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
    ArrowLeft,
    Box,
    CheckCircle2,
    DollarSign,
    Loader2,
    Mail,
    Package,
    Store,
    Tag,
    TrendingUp,
    User,
    Warehouse,
    XCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ActionModal from '@/components/modal/ConfirmModal'
import { useParams } from 'next/navigation'
import vendorProductService from '@/service/product/vendor-product.service'
import { cn } from '@/lib/utils'

interface ProductVariation {
    id: number
    product_name: string
    product_image: string
    variation_name: string
    size_value: number
    size_unit: string
}

interface Vendor {
    id: number
    name: string
    email: string
}

interface VendorProductData {
    id: number
    price: number
    units_in_stock: number
    status?: string
    product_variation: ProductVariation
    vendor: Vendor
}

interface ActionDialog {
    open: boolean
    action: 'accept' | 'reject' | null
}

export default function VendorProductDetails() {
    const params = useParams()
    const id = Number(params.id)
    const queryClient = useQueryClient()
    const [actionDialog, setActionDialog] = useState<ActionDialog>({ open: false, action: null })

    const { data, isLoading, error } = useQuery<VendorProductData>({
        queryKey: ['vendor-product', id],
        queryFn: async () => await vendorProductService.vendorProductDetails(id),
        enabled: !isNaN(id) && id > 0,
    })

    const acceptMutation = useMutation({
        mutationFn: async () => await vendorProductService.acceptAndRejectVendorProduct(id, true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-product', id] })
            toast.success('Product accepted successfully')
            setActionDialog({ open: false, action: null })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to accept product')
        },
    })

    const rejectMutation = useMutation({
        mutationFn: async () => await vendorProductService.acceptAndRejectVendorProduct(id, false),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-product', id] })
            toast.success('Product rejected successfully')
            setActionDialog({ open: false, action: null })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject product')
        },
    })

    const handleAction = (action: 'accept' | 'reject') => {
        setActionDialog({ open: true, action })
    }

    const confirmAction = () => {
        if (actionDialog.action === 'accept') {
            acceptMutation.mutate()
        } else if (actionDialog.action === 'reject') {
            rejectMutation.mutate()
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Skeleton className="h-8 w-32 mb-6 sm:mb-8" />
                    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="lg:col-span-2">
                            <Skeleton className="h-[400px] sm:h-[600px] w-full rounded-2xl" />
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                            <Skeleton className="h-48 sm:h-64 w-full rounded-2xl" />
                            <Skeleton className="h-40 sm:h-48 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Alert variant="destructive" className="max-w-2xl mx-auto rounded-xl">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Alert className="max-w-2xl mx-auto rounded-xl">
                        <AlertDescription>No product details found.</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    const stockStatus = data.units_in_stock > 50 ? 'In Stock' : data.units_in_stock > 0 ? 'Low Stock' : 'Out of Stock'
    const stockColor = data.units_in_stock > 50 ? 'bg-emerald-500' : data.units_in_stock > 0 ? 'bg-amber-500' : 'bg-red-500'
    const totalValue = data.price * data.units_in_stock
    const isPending = !data.status || data.status.toLowerCase() === 'pending'
    const isAccepted = data.status?.toLowerCase() === 'accepted' || data.status?.toLowerCase() === 'approved'
    const isRejected = data.status?.toLowerCase() === 'rejected'
    const isProcessing = acceptMutation.isPending || rejectMutation.isPending

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="mb-6 sm:mb-8">
                        <Link
                            href="/admin/vendor-product"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#4a358e] dark:hover:text-[#6b4fd8] transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a358e] rounded"
                            aria-label="Back to Products"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back to Products
                        </Link>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Product Overview
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                                    Vendor Product ID: #{data.id}
                                </p>
                            </div>
                            {data.status && (
                                <Badge
                                    className={cn(
                                        'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white',
                                        isAccepted && 'bg-emerald-500 hover:bg-emerald-600',
                                        isRejected && 'bg-red-500 hover:bg-red-600',
                                        isPending && 'bg-amber-500 hover:bg-amber-600'
                                    )}
                                >
                                    {data.status}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {isPending && (
                        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-6 shadow-lg">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 rounded-full bg-amber-500/10" aria-hidden="true">
                                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                                            Approval Required
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                            Review and take action on this vendor product
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    <Button
                                        onClick={() => handleAction('reject')}
                                        variant="outline"
                                        disabled={isProcessing}
                                        className="flex-1 sm:flex-none gap-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 transition-all text-sm"
                                        aria-label="Reject product"
                                    >
                                        {rejectMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <XCircle className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAction('accept')}
                                        disabled={isProcessing}
                                        className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all text-sm"
                                        aria-label="Accept product"
                                    >
                                        {acceptMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        Accept Product
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isAccepted && (
                        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 sm:p-6 shadow-lg" role="status">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 rounded-full bg-emerald-500/10" aria-hidden="true">
                                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                                        Product Accepted
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                        This product has been approved and is active
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isRejected && (
                        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-6 shadow-lg" role="status">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 rounded-full bg-red-500/10" aria-hidden="true">
                                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                                        Product Rejected
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                        This product has been declined
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                        <article className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#4a358e] to-[#6b4fd8] px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3 text-white">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 backdrop-blur-sm" aria-hidden="true">
                                        <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-semibold">Product Information</h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-4">
                                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-[#4a358e]/20 shadow-lg group">
                                            <Image
                                                src={data.product_variation.product_image}
                                                alt={data.product_variation.product_name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                priority
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                                {data.product_variation.product_name}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs sm:text-sm border-[#4a358e]/30 text-[#4a358e] dark:text-[#8b7bd8]"
                                                >
                                                    <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                                                    {data.product_variation.variation_name}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs sm:text-sm">
                                                    ID: {data.product_variation.id}
                                                </Badge>
                                            </div>
                                        </div>

                                        <Separator className="bg-slate-200 dark:bg-slate-700" />

                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#4a358e] to-[#6b4fd8] p-4 sm:p-6 text-white shadow-lg">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                        <div className="p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm" aria-hidden="true">
                                                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <p className="text-xs sm:text-sm font-medium opacity-90">Current Price</p>
                                                    </div>
                                                    <p className="text-3xl sm:text-4xl font-bold">रू {data.price.toLocaleString()}</p>
                                                </div>
                                                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
                                            </div>

                                            <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className={cn('p-1.5 sm:p-2 rounded-full', `${stockColor}/10`)} aria-hidden="true">
                                                        <Warehouse className={cn('h-4 w-4 sm:h-5 sm:w-5', stockColor.replace('bg-', 'text-'))} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Stock Status</p>
                                                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                                            {data.units_in_stock} units
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={cn(stockColor, 'text-white text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full')}>
                          {stockStatus}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="p-1.5 sm:p-2 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                                                        <Box className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Package Size</p>
                                                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                                            {data.product_variation.size_value} {data.product_variation.size_unit}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <aside className="space-y-4 sm:space-y-6">
                            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#4a358e] to-[#6b4fd8] px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3 text-white">
                                        <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 backdrop-blur-sm" aria-hidden="true">
                                            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <h2 className="text-base sm:text-lg font-semibold">Vendor Details</h2>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 sm:p-3 rounded-full bg-[#4a358e]/10" aria-hidden="true">
                                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a358e]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                Vendor Name
                                            </p>
                                            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-words">
                                                {data.vendor.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 sm:p-3 rounded-full bg-[#4a358e]/10" aria-hidden="true">
                                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a358e]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                Email Address
                                            </p>
                                            <a
                                                href={`mailto:${data.vendor.email}`}
                                                className="text-sm sm:text-base font-medium text-[#4a358e] hover:text-[#6b4fd8] hover:underline break-all transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a358e] rounded"
                                            >
                                                {data.vendor.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Vendor ID:</span>
                                        <Badge variant="secondary" className="text-xs font-mono">
                                            {data.vendor.id}
                                        </Badge>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#4a358e] to-[#6b4fd8] px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3 text-white">
                                        <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 backdrop-blur-sm" aria-hidden="true">
                                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <h2 className="text-base sm:text-lg font-semibold">Inventory Stats</h2>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                                            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {data.units_in_stock}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mt-1">
                                                Units Available
                                            </p>
                                        </div>
                                        <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
                                            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 break-words">
                                                रू {totalValue.toLocaleString()}
                                            </p>
                                            <p className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                                                Total Value
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>

            <ActionModal
                open={actionDialog.open}
                setOpen={(open) => setActionDialog({ open, action: null })}
                title={actionDialog.action === 'accept' ? 'Accept Product' : 'Reject Product'}
                description={
                    actionDialog.action === 'accept'
                        ? `Are you sure you want to accept "${data.product_variation.product_name}"? This will make the product available in the system.`
                        : `Are you sure you want to reject "${data.product_variation.product_name}"? This action will decline the vendor's product submission.`
                }
                confirmLabel={actionDialog.action === 'accept' ? 'Confirm Accept' : 'Confirm Reject'}
                confirmVariant={actionDialog.action === 'accept' ? 'default' : 'destructive'}
                loading={isProcessing}
                onConfirm={confirmAction}
                buttonClassName={cn(actionDialog.action === 'accept' ? 'bg-emerald-500 hover:bg-emerald-600' : 'destructive')}
            />
        </>
    )
}