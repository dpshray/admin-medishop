'use client'

import {useCallback, useMemo, useState, useTransition} from "react"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {useParams, useRouter} from "next/navigation"
import {toast} from "sonner"
import {AlertCircle, ArrowLeft, Check, Copy, Download, FileText, Package, Printer, Save, XCircle} from "lucide-react"
import ErrorState from "@/components/Error/ErrorState"
import {Skeleton} from "@/components/ui/skeleton"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Alert, AlertDescription} from "@/components/ui/alert"
import CustomerInfo from "@/components/order/CustomerInfoCard"
import SearchSelectField from "@/components/field/search-select"
import {FormatCurrency, StatusBadge} from "@/lib/helper"
import orderService from "@/service/order/order.service"
import {OrderedItem, OrderedItemCard} from "@/components/order/OrderedItemCard"
import {QUERY_STALE_TIME} from "@/config/app-constant"
import {cn} from "@/lib/utils"
import ActionModal from "@/components/modal/ConfirmModal"
import {ORDER_STATUS, PAYMENT_STATUS} from "@/types/enum"

const COPIED_TIMEOUT = 2000

interface OrderData {
    order_code: string
    user_type: "USER" | "VENDOR" | "GUEST"
    name: string
    email: string
    mobile: string
    address: string
    latitude?: string
    longitude?: string
    description?: string
    price: number
    gift_wrap?: boolean
    gift_wrap_remarks?: string
    payment_method: string
    payment_status: PAYMENT_STATUS
    status: ORDER_STATUS | string
    created_at: string
    ordered_items: OrderedItem[]
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
    const orderUuid = params.slug as string
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<VendorOption | null>(null)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

    const {data, error, isLoading, isError} = useQuery<OrderData>({
        queryKey: ["order-details", orderUuid],
        queryFn: () => orderService.getOrderDetails(orderUuid),
        enabled: !!orderUuid,
        staleTime: QUERY_STALE_TIME,
        retry: 2,
    })

    const {data: vendorsData, isLoading: vendorsLoading} = useQuery({
        queryKey: ["assignable-vendors", orderUuid],
        queryFn: () => orderService.getAssignableVendorOrders(orderUuid),
        enabled: !!orderUuid,
        staleTime: QUERY_STALE_TIME,
        retry: 2,
    })

    const vendors = useMemo(() => vendorsData?.items || [], [vendorsData])

    const vendorOptions = useMemo<VendorOption[]>(
        () => vendors.map((v: VendorType) => ({
            value: v.vendor_uuid,
            label: v.store_name || v.user_name,
        })),
        [vendors]
    )

    const canCancelOrder = useMemo(() => {
        if (!data?.status) return false
        return data.status !== "CANCELLED" && data.status !== "COMPLETED"
    }, [data?.status])


    const itemCount = useMemo(() => data?.ordered_items?.length || 0, [data?.ordered_items])
    const useGridLayout = itemCount > 2
    const showDescriptionSection = Boolean(data?.description)
    const showGiftWrap = Boolean(data?.gift_wrap)

    const updateVendorMutation = useMutation({
        mutationFn: (vendorId: string) => orderService.assignOrder(orderUuid, vendorId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["order-details", orderUuid]})
            toast.success("Vendor assigned successfully")
            setSelectedVendor(null)
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to assign vendor"
            toast.error(message)
        },
    })

    const cancelOrderMutation = useMutation({
        mutationFn: () => orderService.cancelOrder(orderUuid),
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

    const handleCancelModalClose = useCallback(() => {
        setIsCancelModalOpen(false)
    }, [])

    const confirmCancelOrder = useCallback(() => {
        cancelOrderMutation.mutate()
        handleCancelModalClose()
    }, [cancelOrderMutation, handleCancelModalClose])

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
        setIsCancelModalOpen(true)
    }, [])

    const handleGoBack = useCallback(() => {
        startTransition(() => {
            router.back()
        })
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
                    <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 mb-4 sm:mb-6"/>
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="border-b p-4 sm:p-6">
                            <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2 sm:mb-3"/>
                            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32"/>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <Skeleton className="h-48 sm:h-64"/>
                            <Skeleton className="h-40 sm:h-48"/>
                            <Skeleton className="h-32"/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (isError || !data) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to load order details. Please try again later."
        return <ErrorState message={errorMessage}/>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 print:bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
                <Card
                    className="border-2 hover:border-primaryColor/30 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden">
                    <CardHeader className="border-b bg-gradient-to-br from-primary/5 to-purple-50/50 p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-[#6b4fc0] bg-clip-text text-transparent">
                                    Order Details
                                </h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <code
                                        className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 border-primary/20 font-mono font-semibold shadow-sm break-all">
                                        #{data.order_code}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyOrderCode}
                                        className="border border-transparent hover:border-primary/10 transition-all h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg flex-shrink-0"
                                        aria-label="Copy order code"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600"
                                                   aria-hidden="true"/>
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary"
                                                  aria-hidden="true"/>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 flex-wrap items-start print:hidden">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="border-2 hover:bg-muted/50 hover:border-primary/40 transition-all text-xs sm:text-sm"
                                >
                                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                                    <span className="font-medium">Print</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                                    disabled
                                    aria-label="Download order (coming soon)"
                                >
                                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                                    <span className="font-medium">Download</span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                        <CustomerInfo data={data as any}/>

                        <Separator className="bg-border/60"/>

                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            <section className="space-y-3 sm:space-y-4" aria-labelledby="order-summary-heading">
                                <h2 id="order-summary-heading"
                                    className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0"
                                             aria-hidden="true"/>
                                    Order Summary
                                </h2>
                                <div
                                    className="space-y-2 sm:space-y-3 bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 sm:p-5 lg:p-6 rounded-xl border-2 border-primary/10 hover:border-primary/20 transition-all">
                                    <dl className="space-y-2 sm:space-y-3">
                                        <div
                                            className="flex justify-between text-xs sm:text-sm lg:text-base items-center gap-2">
                                            <dt className="text-muted-foreground font-medium">Order Date</dt>
                                            <dd className="text-foreground font-semibold text-right">{data.created_at}</dd>
                                        </div>
                                        <div
                                            className="flex justify-between text-xs sm:text-sm lg:text-base items-center gap-2">
                                            <dt className="text-muted-foreground font-medium">Payment Method</dt>
                                            <dd className="capitalize text-foreground font-semibold text-right">
                                                {data.payment_method}
                                            </dd>
                                        </div>
                                        <div
                                            className="flex justify-between text-xs sm:text-sm lg:text-base items-center gap-2">
                                            <dt className="text-muted-foreground font-medium">Order Status</dt>
                                            <dd><StatusBadge status={data.status}/></dd>
                                        </div>
                                        <div
                                            className="flex justify-between text-xs sm:text-sm lg:text-base items-center gap-2">
                                            <dt className="text-muted-foreground font-medium">Payment Status</dt>
                                            <dd><StatusBadge status={data.payment_status}/></dd>
                                        </div>
                                    </dl>
                                    <Separator className="my-2 bg-border/60"/>
                                    <div className="text-right pt-2 sm:pt-3">
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 uppercase tracking-wide font-semibold">
                                            Total Amount
                                        </p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary break-all">
                                            {FormatCurrency(data.price)}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {showDescriptionSection && (
                                <section className="space-y-3 sm:space-y-4" aria-labelledby="order-notes-heading">
                                    <h2 id="order-notes-heading"
                                        className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0"
                                                  aria-hidden="true"/>
                                        Order Notes
                                    </h2>
                                    <div
                                        className="bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 sm:p-5 lg:p-6 rounded-xl border-2 border-primary/10 hover:border-primary/20 transition-all">
                                        <p className="text-xs sm:text-sm lg:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                            {data.description}
                                        </p>
                                    </div>

                                    {showGiftWrap && (
                                        <div className="space-y-3 sm:space-y-4">
                                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0"
                                                          aria-hidden="true"/>
                                                Gift Wrap
                                            </h3>
                                            <div
                                                className="bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 sm:p-5 lg:p-6 rounded-xl border-2 border-primary/10 hover:border-primary/20 transition-all">
                                                <p className="text-xs sm:text-sm lg:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                                    {data.gift_wrap_remarks}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>

                        <Separator className="bg-border/60"/>

                        <section className="space-y-3 sm:space-y-4" aria-labelledby="ordered-items-heading">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 id="ordered-items-heading"
                                    className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0"
                                             aria-hidden="true"/>
                                    Ordered Items
                                </h2>
                                <span
                                    className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground bg-muted/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                    {itemCount} {itemCount === 1 ? "item" : "items"}
                                </span>
                            </div>

                            {itemCount > 0 ? (
                                <div className={cn(
                                    useGridLayout
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                                        : "space-y-3 sm:space-y-4"
                                )}>
                                    {data.ordered_items.map((item, index) => (
                                        <OrderedItemCard
                                            key={`${item.item_name || index}-${orderUuid}`}
                                            item={item}
                                            showAnimation
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="text-center py-8 sm:py-12 text-muted-foreground bg-muted/30 rounded-xl border-2 border-dashed border-border">
                                    <Package
                                        className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-muted-foreground/50"
                                        aria-hidden="true"/>
                                    <p className="text-sm sm:text-base font-medium">No items in this order</p>
                                </div>
                            )}
                        </section>
                    </CardContent>

                    <CardFooter className="border-t bg-muted/30 p-4 sm:p-6 lg:p-8 print:hidden">
                        <div className="w-full space-y-4 sm:space-y-6">
                            <div className="grid gap-3 sm:gap-4 sm:grid-cols-[1fr,auto] items-end">
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
                                    className="bg-primaryColor hover:bg-primaryColor/80 text-white transition-all disabled:opacity-50 shadow-md hover:shadow-lg w-full sm:w-auto text-xs sm:text-sm"
                                    onClick={handleUpdateVendor}
                                    disabled={!selectedVendor || updateVendorMutation.isPending || vendorsLoading}
                                >
                                    <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                                    <span className="font-medium">
                                        {updateVendorMutation.isPending ? "Assigning..." : "Assign Vendor"}
                                    </span>
                                </Button>
                            </div>

                            {!canCancelOrder && (
                                <Alert className="border-2 border-amber-200 bg-amber-50/50">
                                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" aria-hidden="true"/>
                                    <AlertDescription
                                        className="text-xs sm:text-sm lg:text-base text-amber-800 font-medium">
                                        This order cannot be cancelled as it is already {data.status}.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Separator className="bg-border/60"/>

                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleGoBack}
                                    disabled={isPending}
                                    className="border-2 hover:bg-muted/50 hover:border-primary/40 transition-all text-xs sm:text-sm w-full sm:w-auto"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                                    <span className="font-medium">Back</span>
                                </Button>
                                {canCancelOrder && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelOrder}
                                        disabled={cancelOrderMutation.isPending}
                                        className="transition-all shadow-md hover:shadow-lg text-xs sm:text-sm w-full sm:w-auto"
                                    >
                                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                                        <span className="font-medium">
                                            {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <ActionModal
                open={isCancelModalOpen}
                setOpen={handleCancelModalClose}
                title="Cancel Order"
                description="Are you sure you want to cancel this order? This action cannot be undone."
                onConfirm={confirmCancelOrder}
            />
        </div>
    )
}