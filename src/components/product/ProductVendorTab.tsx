"use client"

import {memo, useMemo, useState, useCallback} from "react"
import {useQuery} from "@tanstack/react-query"
import {Skeleton} from "@/components/ui/skeleton"
import {Badge} from "@/components/ui/badge"
import productService from "@/service/product/product.service"
import {FormatCurrency, FormatDate, StatusBadge} from "@/lib/helper"
import CustomPagination from "../custom-pagination"
import {Calendar, Factory, Hash, Package, Phone, Store, User} from "lucide-react"
import {cn} from "@/lib/utils"

interface VendorProduct {
    vendor_uuid: string
    vendor_name: string
    store_name: string
    mobile_number: string
    product_name: string
    is_approved: boolean
    approval_status: string
    approval_date: string
    variation: Variation[]
}

interface Variation {
    id: number
    variant_name: string
    product_variation_id: number
    price: string
    units_in_stock: number
    batch_number: string
    expiry_date: string
}

const LoadingSkeleton = memo(() => (
    <div className="space-y-4" role="status" aria-label="Loading vendor information">
        {[1, 2, 3].map((index) => (
            <Skeleton key={`skeleton-${index}`} className="h-48 w-full rounded-xl"/>
        ))}
        <span className="sr-only">Loading vendors...</span>
    </div>
))

LoadingSkeleton.displayName = 'LoadingSkeleton'

const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-slate-400" aria-hidden="true"/>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Vendors Available</h3>
        <p className="text-sm text-slate-500 max-w-md">
            No vendors are currently selling this product.
        </p>
    </div>
))

EmptyState.displayName = 'EmptyState'

const InfoItem = memo<{ icon: React.ElementType; label: string; value: string; className?: string }>(
    ({icon: Icon, label, value, className = ""}) => (
        <div className={cn("flex items-start gap-2 min-w-0", className)}>
            <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true"/>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-0.5 font-medium">{label}</p>
                <p className="text-sm text-slate-900 font-medium break-words">
                    {value}
                </p>
            </div>
        </div>
    )
)

InfoItem.displayName = 'InfoItem'

const VariationCard = memo<{ variation: Variation }>(({variation}) => (
    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
            <div className="flex flex-col gap-1 min-w-0">
                {variation.variant_name && (
                    <span className="text-sm text-slate-700 font-semibold">
                        {variation.variant_name}
                    </span>
                )}
                <span className="text-xl font-bold text-slate-900">
                    {FormatCurrency(variation.price)}
                </span>
            </div>
            <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-xs font-medium px-2.5 py-1 whitespace-nowrap"
            >
                {variation.units_in_stock} in stock
            </Badge>
        </div>

        <div className="space-y-3">
            <InfoItem
                icon={Hash}
                label="Batch Number"
                value={variation.batch_number}
            />
            <InfoItem
                icon={Calendar}
                label="Expiry Date"
                value={FormatDate(variation.expiry_date)}
            />
        </div>
    </div>
))

VariationCard.displayName = 'VariationCard'

const VendorCard = memo<{ vendor: VendorProduct }>(({vendor}) => {
    const isApproved = vendor.is_approved || vendor.approval_status?.toLowerCase() === "approved"

    return (
        <article
            className={cn(
                'border rounded-xl p-5 md:p-6 bg-white transition-all duration-200',
                isApproved
                    ? 'border-green-200 hover:border-green-300 hover:shadow-lg'
                    : 'border-red-200 hover:border-red-300 hover:shadow-lg'
            )}
        >
            <header className="mb-5 pb-5 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="flex items-center gap-2 font-bold text-xl md:text-2xl text-slate-900 mb-3">
                            <User className="w-6 h-6 flex-shrink-0" aria-hidden="true"/>
                            <span className="capitalize break-words">{vendor.vendor_name}</span>
                        </h2>

                        {vendor.product_name && (
                            <div className="flex items-center gap-2 text-base text-slate-700 font-semibold mb-3 p-3 bg-slate-50 rounded-lg">
                                <Package className="w-5 h-5 flex-shrink-0 text-blue-600" aria-hidden="true"/>
                                <span className="break-words">{vendor.product_name}</span>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Store className="w-4 h-4 flex-shrink-0" aria-hidden="true"/>
                                <span className="break-words font-medium">{vendor.store_name}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true"/>
                                <a
                                    href={`tel:${vendor.mobile_number}`}
                                    className="hover:text-blue-600 transition-colors font-medium hover:underline"
                                    aria-label={`Call ${vendor.vendor_name} at ${vendor.mobile_number}`}
                                >
                                    {vendor.mobile_number}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-start lg:items-end">
                        <StatusBadge status={vendor.approval_status}/>
                        {vendor.variation?.length > 0 && (
                            <Badge className={cn(
                                'text-xs font-medium px-2.5 py-1',
                                isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            )}>
                                {vendor.variation.length} {vendor.variation.length === 1 ? 'Variation' : 'Variations'}
                            </Badge>
                        )}
                    </div>
                </div>

                {isApproved && vendor.approval_date && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg w-fit">
                        <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true"/>
                        <span className="font-medium">Approved: {FormatDate(vendor.approval_date)}</span>
                    </div>
                )}
            </header>

            {vendor.variation?.length > 0 && (
                <section aria-labelledby={`variations-heading-${vendor.vendor_uuid}`}>
                    <h3
                        id={`variations-heading-${vendor.vendor_uuid}`}
                        className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"
                    >
                        <Package className="w-5 h-5 text-blue-600" aria-hidden="true"/>
                        <span>Product Variations ({vendor.variation.length})</span>
                    </h3>

                    <div className={cn(
                        "grid gap-4",
                        vendor.variation.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    )}>
                        {vendor.variation.map((variation: Variation) => (
                            <VariationCard key={`variation-${variation.id}`} variation={variation}/>
                        ))}
                    </div>
                </section>
            )}
        </article>
    )
})

VendorCard.displayName = 'VendorCard'

export default function ProductVendorTab({productUuid}: { productUuid?: string }) {
    const [currentPage, setCurrentPage] = useState(1)

    const {data: vendorRes, isPending: vendorsLoading, isError} = useQuery({
        queryKey: ["product-vendors", productUuid, currentPage],
        enabled: !!productUuid,
        queryFn: async () => {
            const params = {page: currentPage}
            return await productService.getVendorListByProduct(productUuid!, params)
        },
        staleTime: 30000,
        refetchOnWindowFocus: false,
    })

    const vendors = useMemo(() => vendorRes?.items ?? [], [vendorRes?.items])
    const totalPages = useMemo(() => vendorRes?.total_page ?? 1, [vendorRes?.total_page])

    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage)
        window.scrollTo({top: 0, behavior: 'smooth'})
    }, [])

    if (vendorsLoading) {
        return <LoadingSkeleton/>
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-red-500" aria-hidden="true"/>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Vendors</h3>
                <p className="text-sm text-slate-500 max-w-md">
                    Unable to load vendor information. Please try again later.
                </p>
            </div>
        )
    }

    if (vendors.length === 0) {
        return <EmptyState/>
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {vendors.map((vendor: VendorProduct) => (
                    <VendorCard key={vendor.vendor_uuid} vendor={vendor}/>
                ))}
            </div>

            {totalPages > 1 && (
                <nav aria-label="Vendor pagination" className="pt-4">
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChangeAction={handlePageChange}
                    />
                </nav>
            )}
        </div>
    )
}