'use client'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import {useState} from 'react'
import {
    ArrowLeft,
    Box,
    CheckCircle2,
    DollarSign,
    Loader2,
    Mail,
    Package,
    Store,
    User,
    Warehouse,
    XCircle,
} from 'lucide-react'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {toast} from 'sonner'
import ActionModal from '@/components/modal/ConfirmModal'
import {useParams} from 'next/navigation'
import vendorProductService from '@/service/product/vendor-product.service'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {STATUS_TYPE} from '@/types/enum'

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
    status?: boolean | null
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
    const [actionDialog, setActionDialog] = useState<ActionDialog>({open: false, action: null})

    const {data, isLoading, error} = useQuery<VendorProductData>({
        queryKey: ['vendor-product', id],
        queryFn: () => vendorProductService.vendorProductDetails(id),
        enabled: !isNaN(id) && id > 0,
    })

    const acceptMutation = useMutation({
        mutationFn: () => vendorProductService.acceptAndRejectVendorProduct(id, true),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vendor-product', id]})
            toast.success('Product accepted successfully')
            setActionDialog({open: false, action: null})
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to accept product')
        },
    })

    const rejectMutation = useMutation({
        mutationFn: () => vendorProductService.acceptAndRejectVendorProduct(id, false),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vendor-product', id]})
            toast.success('Product rejected successfully')
            setActionDialog({open: false, action: null})
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject product')
        },
    })

    const handleAction = (action: 'accept' | 'reject') => {
        setActionDialog({open: true, action})
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Skeleton className="h-8 w-32 mb-6"/>
                    <Skeleton className="h-[600px] w-full rounded-lg"/>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Alert variant="destructive">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Alert>
                        <AlertDescription>No product details found.</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    const {product_variation, vendor, price, units_in_stock, status} = data
    const isPending = acceptMutation.isPending || rejectMutation.isPending
    const showActionButtons = status === null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Link
                    href="/vendor-products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-6"
                    aria-label="Back to products list"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true"/>
                    Back to Products
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-0">
                        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
                            <Image
                                src={product_variation.product_image}
                                alt={`${product_variation.product_name} - ${product_variation.variation_name}`}
                                fill
                                className="object-contain p-8"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>

                        <div className="p-6 sm:p-8 flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="flex-1 min-w-0">
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Product Name</p>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                            {product_variation.product_name}
                                        </h1>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Variation Name</p>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            {product_variation.variation_name}
                                        </h2>
                                    </div>
                                </div>
                                {status !== null && (
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                                        <StatusBadge status={status ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.REJECTED}/>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 flex-1">
                                <section aria-labelledby="product-details-heading">
                                    <h2 id="product-details-heading" className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
                                        Product Details
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg flex-shrink-0" aria-hidden="true">
                                                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Price</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                    {FormatCurrency(price)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg flex-shrink-0" aria-hidden="true">
                                                <Warehouse className="w-5 h-5 text-green-600 dark:text-green-400"/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Stock</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                    {units_in_stock} units
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg flex-shrink-0" aria-hidden="true">
                                                <Box className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Size</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                    {product_variation.size_value} {product_variation.size_unit}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg flex-shrink-0" aria-hidden="true">
                                                <Package className="w-5 h-5 text-orange-600 dark:text-orange-400"/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Product ID</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                    #{product_variation.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section aria-labelledby="vendor-info-heading" className="border-t border-slate-200 dark:border-slate-800 pt-6">
                                    <h2 id="vendor-info-heading" className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Store className="w-4 h-4" aria-hidden="true"/>
                                        Vendor Information
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true"/>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Name</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {vendor.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true"/>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Email</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                    {vendor.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Store className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true"/>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Vendor ID</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    #{vendor.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {showActionButtons && (
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={() => handleAction('accept')}
                                            disabled={isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            aria-label="Accept product"
                                        >
                                            {acceptMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true"/>
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true"/>
                                                    Accept Product
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleAction('reject')}
                                            disabled={isPending}
                                            variant="destructive"
                                            className="flex-1"
                                            aria-label="Reject product"
                                        >
                                            {rejectMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true"/>
                                                    Rejecting...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 mr-2" aria-hidden="true"/>
                                                    Reject Product
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ActionModal
                open={actionDialog.open}
                setOpen={(open) => setActionDialog({open, action: null})}
                title={actionDialog.action === 'accept' ? 'Accept Product' : 'Reject Product'}
                description={
                    actionDialog.action === 'accept'
                        ? 'Are you sure you want to accept this product? It will be marked as active.'
                        : 'Are you sure you want to reject this product? It will be marked as inactive.'
                }
                confirmLabel="Confirm"
                confirmVariant={actionDialog.action === 'accept' ? 'default' : 'destructive'}
                loading={isPending}
                onConfirm={confirmAction}
            />
        </div>
    )
}