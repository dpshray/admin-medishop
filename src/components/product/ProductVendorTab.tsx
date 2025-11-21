"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import productService from "@/service/product/product.service"
import { FormatCurrency } from "@/lib/helper"
import CustomPagination from "../custom-pagination"

export default function ProductVendorTab({ productUuid }: { productUuid?: string }) {
    const [page, setPage] = useState(1)
    const per_page = 10

    const { data: vendorRes, isPending: vendorsLoading } = useQuery({
        queryKey: ["product-vendors", productUuid, page],
        enabled: !!productUuid,
        queryFn: async () => {
            const params = { page, per_page }
            return await productService.getProductVendorList(productUuid!, params)
        },
    })

    const vendors = vendorRes?.items ?? []

    return (
        <div className="space-y-4">
            {/* Loading */}
            {vendorsLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-md" />
                    <Skeleton className="h-20 w-full rounded-md" />
                </div>
            )}

            {/* No Vendors */}
            {!vendorsLoading && vendors.length === 0 && (
                <p className="text-sm text-slate-500">
                    No vendors are selling this product.
                </p>
            )}

            {/* Vendor List */}
            {!vendorsLoading && vendors.length > 0 && (
                <div className="space-y-4">
                    {vendors.map((vendor: any) => (
                        <div
                            key={vendor.vendor_uuid}
                            className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                                <div className="flex-1">
                                    <h3 className="flex items-center gap-1 font-semibold text-lg text-slate-900 mb-1">
                                        <span>👤</span>
                                        {vendor.vendor_name}
                                    </h3>

                                    <p className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                                        <span>🏪</span>
                                        {vendor.store_name}
                                    </p>

                                    <p className="flex items-center gap-1 text-sm text-slate-500">
                                        <span>📞</span>
                                        {vendor.mobile_number}
                                    </p>
                                </div>

                                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                    <p className="text-xs text-slate-600 mb-0.5">Available Variants</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {vendor.prices?.length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-700 mb-3">
                                    Product Variations
                                </h4>

                                <div
                                    className={
                                        vendor.prices?.length > 2
                                            ? "grid grid-cols-2 gap-4"
                                            : "space-y-4"
                                    }
                                >
                                    {vendor.prices?.map((p: any) => (
                                        <div
                                            key={p.id}
                                            className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        {FormatCurrency(p.price)}
                                                    </span>

                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                        {p.units_in_stock} in stock
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-0.5">Batch Number</p>
                                                    <p className="text-slate-900 font-medium">{p.batch_number}</p>
                                                </div>

                                                <div>
                                                    <p className="text-slate-500 text-xs mb-0.5">Expiry Date</p>
                                                    <p className="text-slate-900 font-medium">
                                                        {new Date(p.expiry_date).toLocaleDateString("en-IN", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                <p className="text-slate-500 text-xs mb-1">Manufacturer</p>
                                                <p className="text-slate-700 text-sm">{p.manufacture}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {vendorRes?.total_page > 1 && (
                <CustomPagination
                    currentPage={page}
                    totalPages={vendorRes.total_page}
                    onPageChangeAction={(newPage) => setPage(newPage)}
                    className="pt-4"
                />
            )}
        </div>
    )
}
