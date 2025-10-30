'use client'

import { useCallback, useMemo, useState, useTransition } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, Check, Copy, Download, FileText, Package, Printer, Save, XCircle } from "lucide-react"
import ErrorState from "@/components/Error/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CustomerInfo from "@/components/order/CustomerInfoCard"
import SearchSelectField from "@/components/field/search-select"
import { FormatCurrency, StatusBadge } from "@/lib/helper"
import orderService from "@/service/order/order.service"
import { OrderedItemCard } from "@/components/order/OrderedItemCard"
import { QUERY_STALE_TIME } from "@/config/app-constant"
import { cn } from "@/lib/utils"

const COPIED_TIMEOUT = 2000

interface OrderData {
    order_code: string
    created_at: string
    payment_method: string
    status: string
    payment_status: string
    price: number
    description?: string
    ordered_items: any[]
}

interface VendorType {
    vendor_uuid: string
    user_name: string
    store_name: string
    is_assignable: boolean
}

interface VendorOption {
    value: string
    label: string
}

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

export default function OrderDetails() {
    const params = useParams()
    const uuid = params.slug as string
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<VendorOption | null>(null)

    const { data, error, isLoading, isError } = useQuery<OrderData>({
        queryKey: ["order-details", uuid],
        queryFn: () => orderService.getOrderDetails(uuid),
        enabled: !!uuid,
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
    })

    const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
        queryKey: ["assignable-vendors", uuid],
        queryFn: () => orderService.getAssignableVendorOrders(uuid),
        enabled: !!uuid,
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
    })

    const vendors = useMemo(() => vendorsData?.items || [], [vendorsData])

    const vendorOptions = useMemo<VendorOption[]>(
        () =>
            vendors.map((v: VendorType) => ({
                value: v.vendor_uuid,
                label: v.store_name || v.user_name,
            })),
        [vendors]
    )

    const canCancelOrder = useMemo(
        () => data?.status !== "cancelled" && data?.status !== "completed",
        [data?.status]
    )

    const updateVendorMutation = useMutation({
        mutationFn: (vendorId: string) => orderService.assignOrder(uuid, vendorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order-details", uuid] })
            toast.success("Vendor assigned successfully")
            setSelectedVendor(null)
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to assign vendor"
            toast.error(message)
        },
    })

    const cancelOrderMutation = useMutation({
        mutationFn: () => orderService.cancelOrder(uuid),
        onSuccess: () => {
            toast.success("Order cancelled successfully")
            startTransition(() => {
                router.back()
            })
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to cancel order"
            toast.error(message)
        },
    })

    const handleCopyOrderCode = useCallback(async () => {
        if (!data?.order_code) return
        const success = await copyToClipboard(data.order_code)
        if (success) {
            setCopied(true)
            toast.success("Order code copied to clipboard")
            setTimeout(() => setCopied(false), COPIED_TIMEOUT)
        } else {
            toast.error("Failed to copy order code")
        }
    }, [data?.order_code])

    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    const handleVendorChange = useCallback(
        (value: string | number | null) => {
            const selected = vendorOptions.find((v) => v.value === value) || null
            setSelectedVendor(selected)
        },
        [vendorOptions]
    )

    const handleUpdateVendor = useCallback(() => {
        if (!selectedVendor) return
        updateVendorMutation.mutate(String(selectedVendor.value))
    }, [selectedVendor, updateVendorMutation])

    const handleCancelOrder = useCallback(() => {
        if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            cancelOrderMutation.mutate()
        }
    }, [cancelOrderMutation])

    const handleGoBack = useCallback(() => {
        startTransition(() => {
            router.back()
        })
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl">
                    <Skeleton className="h-10 w-32 mb-6" />
                    <Card className="border-slate-200">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <Skeleton className="h-8 w-48 mb-3" />
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <Skeleton className="h-64" />
                            <Skeleton className="h-48" />
                            <Skeleton className="h-32" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (isError || !data) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load order details. Please try again later."
        return <ErrorState message={errorMessage} />
    }

    const showDescriptionSection = Boolean(data.description)
    const itemCount = data.ordered_items.length
    const useGridLayout = itemCount > 2

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 print:bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
                <Card className="border-slate-200 bg-white overflow-hidden shadow-none">
                    <CardHeader className="border-b border-slate-100 p-6 bg-gradient-to-r from-[#4a358e]/5 to-purple-50/50">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#4a358e]">Order Details</h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono">#{data.order_code}</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyOrderCode}
                                        className="hover:bg-[#4a358e]/10 transition-colors h-8 w-8 p-0"
                                        aria-label={copied ? "Order code copied" : "Copy order code"}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap items-start">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="border-slate-200 hover:bg-slate-50 hover:border-[#4a358e]/30 transition-all"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button size="sm" className="bg-[#4a358e] hover:bg-[#3d2d75] text-white" disabled>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <CustomerInfo data={data as any} />
                        <Separator className="bg-slate-200" />
                        <div className="grid lg:grid-cols-2 gap-6">
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-[#4a358e]" />
                                    Order Summary
                                </h2>
                                <div className="space-y-3 bg-gradient-to-br from-slate-50 to-purple-50/30 p-5 rounded-lg border border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 font-medium">Order Date</span>
                                        <span className="text-slate-900">{data.created_at}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 font-medium">Payment Method</span>
                                        <span className="capitalize text-slate-900">{data.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-600 font-medium">Order Status</span>
                                        <StatusBadge status={data.status} />
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-600 font-medium">Payment Status</span>
                                        <StatusBadge status={data.payment_status} />
                                    </div>
                                    <Separator className="my-2 bg-slate-200" />
                                    <div className="text-right pt-2">
                                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">Total Amount</p>
                                        <p className="text-3xl font-bold text-[#4a358e]">{FormatCurrency(data.price)}</p>
                                    </div>
                                </div>
                            </section>

                            {showDescriptionSection && (
                                <section>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-[#4a358e]" />
                                        Order Notes
                                    </h2>
                                    <div className="space-y-3 bg-gradient-to-br from-slate-50 to-purple-50/30 p-5 rounded-lg border border-slate-200">
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
                                    </div>
                                </section>
                            )}
                        </div>

                        <Separator className="bg-slate-200" />
                        <section>
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-[#4a358e]" />
                                Ordered Items
                                <span className="text-sm font-normal text-slate-500">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                            </h2>
                            {itemCount > 0 ? (
                                <div className={cn(useGridLayout ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4")}>
                                    {data.ordered_items.map((item, index) => (
                                        <OrderedItemCard key={`${item.id || index}-${uuid}`} item={item} showAnimation />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">No items in this order</div>
                            )}
                        </section>
                    </CardContent>

                    <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-6 print:hidden">
                        <div className="w-full space-y-4">
                            <div className="grid sm:grid-cols-[1fr,auto] gap-4 items-end">
                                <SearchSelectField
                                    label="Assign Vendor"
                                    placeholder="Select vendor to assign"
                                    options={vendorOptions}
                                    value={selectedVendor?.value ?? ""}
                                    onChange={handleVendorChange}
                                    disabled={vendorsLoading || updateVendorMutation.isPending}
                                    helperText={vendorsLoading ? "Loading vendors..." : "Choose a vendor to fulfill this order"}
                                />
                                <Button
                                    className="bg-[#4a358e] hover:bg-[#3d2d75] text-white transition-all disabled:opacity-50"
                                    onClick={handleUpdateVendor}
                                    disabled={!selectedVendor || updateVendorMutation.isPending || vendorsLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {updateVendorMutation.isPending ? "Assigning..." : "Assign Vendor"}
                                </Button>
                            </div>

                            {!canCancelOrder && (
                                <Alert className="border-amber-200 bg-amber-50">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-sm text-amber-800">
                                        This order cannot be cancelled as it is already {data.status}.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Separator className="bg-slate-200" />
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleGoBack}
                                    disabled={isPending}
                                    className="border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                {canCancelOrder && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelOrder}
                                        disabled={cancelOrderMutation.isPending}
                                        className="transition-all"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
