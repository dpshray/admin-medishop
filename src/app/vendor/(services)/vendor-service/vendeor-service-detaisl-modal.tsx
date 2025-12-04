"use client"

import * as React from "react"
import { memo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { FormatCurrency, FormatDate, StatusBadge } from "@/lib/helper"
import { STATUS_TYPE } from "@/types/enum"
import { QUERY_STALE_TIME } from "@/config/app-constant"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import { Calendar, DollarSign, Percent, Tag } from "lucide-react"

interface VendorService {
    service_id: number;
    is_made_available_by_admin: boolean;
    is_approved_by_admin: boolean;
    is_vendor_already_applied: boolean;
    vendor_service_status: boolean;
    service_name: string;
    service_slug: string;
    admin_price: number;
    admin_discount_percent: number;
    added_by_admin_at: string;
    vendor_price: number | null;
}

interface VendorServiceDetailsModalProps {
    slug: string;
    open: boolean;
    onCloseAction: () => void;
    onEditAction?: () => void;
}

const LoadingSkeleton = memo(() => (
    <div className="space-y-4 py-4" role="status" aria-label="Loading service details">
        {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
        ))}
    </div>
))

LoadingSkeleton.displayName = "LoadingSkeleton"

const VendorServiceDetailsModal = memo(function VendorServiceDetailsModal({
                                                                              slug,
                                                                              open,
                                                                              onCloseAction,
                                                                              onEditAction,
                                                                          }: VendorServiceDetailsModalProps) {
    const { data, isLoading, error } = useQuery<VendorService>({
        queryKey: ['vendorService', slug],
        queryFn: async () => {
            const res = await vendorServiceProviderService.getVendorServiceProviderBySlug(slug)
            return res.data
        },
        enabled: open && !!slug,
        staleTime: QUERY_STALE_TIME,
    })

    const handleClose = useCallback(() => {
        onCloseAction()
    }, [onCloseAction])

    const handleEdit = useCallback(() => {
        onEditAction?.()
    }, [onEditAction])

    if (error) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="w-[95vw] max-w-2xl mx-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Error Loading Service</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center">
                        <p className="text-destructive text-sm sm:text-base" role="alert">
                            Failed to load service details. Please try again.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleClose} variant="outline" className="w-full sm:w-auto">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-3xl mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2 sm:space-y-3">
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight">
                        {isLoading ? (
                            <Skeleton className="h-7 w-48 sm:w-64" />
                        ) : (
                            data?.service_name || "Service Details"
                        )}
                    </DialogTitle>
                    {!isLoading && data?.service_slug && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Service Slug</p>
                            <code className="text-xs sm:text-sm bg-muted px-2 py-1 rounded inline-block">
                                {data.service_slug}
                            </code>
                        </div>
                    )}
                </DialogHeader>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : data ? (
                    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                    Service Status
                                </p>
                                <StatusBadge
                                    status={data.vendor_service_status ? STATUS_TYPE.ACTIVE : STATUS_TYPE.INACTIVE}
                                />
                            </div>

                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                    Approval Status
                                </p>
                                <StatusBadge
                                    status={data.is_approved_by_admin ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.PENDING}
                                />
                            </div>

                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                    Admin Availability
                                </p>
                                <StatusBadge
                                    status={data.is_made_available_by_admin ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.REJECTED}
                                />
                            </div>

                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                    Vendor Application
                                </p>
                                <StatusBadge
                                    status={data.is_vendor_already_applied ? STATUS_TYPE.COMPLETED : STATUS_TYPE.PENDING}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2 p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm font-medium">Admin Price</p>
                                </div>
                                <p className="text-base sm:text-lg md:text-xl font-bold break-words">
                                    {data.admin_price > 0 ? FormatCurrency(data.admin_price) : "Not Set"}
                                </p>
                            </div>

                            <div className="space-y-2 p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm font-medium">Vendor Price</p>
                                </div>
                                <p className="text-base sm:text-lg md:text-xl font-bold break-words">
                                    {data.vendor_price && data.vendor_price > 0 ? FormatCurrency(data.vendor_price) : "Not Set"}
                                </p>
                            </div>

                            <div className="space-y-2 p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Percent className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm font-medium">Discount</p>
                                </div>
                                <p className="text-base sm:text-lg md:text-xl font-bold">
                                    {data.admin_discount_percent || 0}%
                                </p>
                            </div>

                            <div className="space-y-2 p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm font-medium">Added Date</p>
                                </div>
                                <p className="text-sm sm:text-base font-semibold break-words">
                                    {FormatDate(data.added_by_admin_at)}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2 p-3 sm:p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Tag className="h-4 w-4 flex-shrink-0" />
                                <p className="text-xs sm:text-sm font-medium">Service ID</p>
                            </div>
                            <p className="text-sm sm:text-base font-mono bg-background px-3 py-2 rounded border">
                                {data.service_id}
                            </p>
                        </div>
                    </div>
                ) : null}

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <Button
                        onClick={handleClose}
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isLoading}
                    >
                        Close
                    </Button>
                    {onEditAction && (
                        <Button
                            onClick={handleEdit}
                            className="w-full sm:w-auto bg-primaryColor hover:bg-purple-700"
                            disabled={isLoading}
                        >
                            Edit Service
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})

VendorServiceDetailsModal.displayName = "VendorServiceDetailsModal"

export default VendorServiceDetailsModal