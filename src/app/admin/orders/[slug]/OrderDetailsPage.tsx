"use client"

import {useCallback, useMemo, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {AlertCircle, Check, CheckSquare, Package, Save, Square, Store, UserCog,} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Alert, AlertDescription} from "@/components/ui/alert"
import SearchSelectField from "@/components/field/search-select"
import CustomerInfo from "@/components/order/CustomerInfoCard"
import {OrderedItem, OrderedItemCard} from "@/components/order/OrderedItemCard"
import {cn} from "@/lib/utils"
import {ORDER_STATUS, PAYMENT_STATUS} from "@/types/enum"
import OrderHeader from "@/components/order/order-details/order-header"
import AssignmentSummary, {VendorAssignment,} from "@/components/order/order-details/order-assingment"
import OrderSummary from "@/components/order/order-details/order-summary"
import OrderNotes from "@/components/order/order-details/order-notes"
import {useQuery} from "@tanstack/react-query"
import orderService from "@/service/order/order.service"
import {COPIED_TIMEOUT, QUERY_STALE_TIME} from "@/config/app-constant"

interface OrderData {
    order_id: number
    order_code: string
    user_type: "USER" | "VENDOR" | "GUEST"
    name: string
    email: string
    mobile: string
    address: string
    latitude: string
    longitude: string
    description: string
    price: number
    gift_wrap?: boolean
    gift_wrap_remarks?: string
    payment_method: string
    payment_status: PAYMENT_STATUS
    status: ORDER_STATUS | string
    created_at: string
    ordered_items: OrderedItem[]
    order_assigned_to?: {
        vendor_uuid: string
        store_name: string
    } | null
}

interface VendorOption {
    value: string
    label: string
    searchText?: string
}

interface ItemAssignment {
    itemId: string | number
    vendorId: string
    vendorName: string
    storeName: string
    assignmentType: "admin" | "vendor"
}

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

interface OrderDetailsClientProps {
    orderUuid: string
}

export default function OrderDetailsClient({orderUuid}: OrderDetailsClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<VendorOption | null>(null)
    const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())
    const [itemAssignments, setItemAssignments] = useState<Map<string | number, ItemAssignment>>(new Map())

    const {data: vendorsData} = useQuery({
        queryKey: ["assignable-vendors", orderUuid],
        queryFn: async () => {
            const res = await orderService.getAssignableVendorOrders(orderUuid)
            return res.items
        },
        enabled: !!orderUuid,
        staleTime: QUERY_STALE_TIME,
        retry: 2,
    })

    const {data, isLoading} = useQuery<OrderData>({
        queryKey: ["order-details", orderUuid],
        queryFn: async () => {
            const res = await orderService.getOrderDetails(orderUuid)
            console.log("Order Details", res)
            return res
        },
        enabled: !!orderUuid,
        staleTime: QUERY_STALE_TIME,
        retry: 2,
    })

    const vendorOptions = useMemo(
        () =>
            vendorsData?.map((v: any) => ({
                value: v.vendor_uuid,
                label: `${v.store_name} (${v.vendor_location})`,
            })) || [],
        [vendorsData]
    )


    const canCancelOrder = useMemo(
        () => data?.status !== ORDER_STATUS.CANCELLED && data?.status !== ORDER_STATUS.COMPLETED,
        [data?.status]
    )

    const itemCount = data?.ordered_items.length || 0
    const useGridLayout = itemCount > 2
    const showDescriptionSection = Boolean(data?.description)
    const selectedCount = selectedItems.size
    const allSelected = selectedCount === itemCount && itemCount > 0

    const assignmentsByVendor = useMemo(() => {
        const grouped = new Map<string, VendorAssignment>()

        data?.ordered_items.forEach((item) => {
            if (item.order_item_assigned_to) {
                const vendorKey = `existing-${item.order_item_assigned_to.vendor_name}`
                if (!grouped.has(vendorKey)) {
                    grouped.set(vendorKey, {
                        vendor_name: item.order_item_assigned_to.vendor_name,
                        vendor_store_name: item.order_item_assigned_to.vendor_store_name,
                        assignmentType: "vendor",
                        items: [],
                    })
                }
                grouped.get(vendorKey)!.items.push({
                    item_name: item.item_name,
                    item_price: item.price,
                    quantity: item.quantity,
                    sub_total: item.subtotal,
                })
            }
        })

        itemAssignments.forEach((assignment) => {
            const item = data?.ordered_items.find((i) => i.order_item_id === assignment.itemId)
            if (item && !item.order_item_assigned_to) {
                if (!grouped.has(assignment.vendorId)) {
                    grouped.set(assignment.vendorId, {
                        vendor_name: assignment.vendorName,
                        vendor_store_name: assignment.storeName,
                        assignmentType: assignment.assignmentType,
                        items: [],
                    })
                }
                grouped.get(assignment.vendorId)!.items.push({
                    item_name: item.item_name,
                    item_price: item.price,
                    quantity: item.quantity,
                    sub_total: item.subtotal,
                })
            }
        })

        return grouped
    }, [itemAssignments, data?.ordered_items])

    const handleCopyOrderCode = useCallback(async () => {
        if (!data) return
        const success = await copyToClipboard(data.order_code)
        if (success) {
            setCopied(true)
            toast.success("Order code copied")
            setTimeout(() => setCopied(false), COPIED_TIMEOUT)
        }
    }, [data])

    const handleSelectAll = useCallback(() => {
        if (!data) return
        if (allSelected) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(data.ordered_items.map(item => item.order_item_id)))
        }
    }, [allSelected, data])

    const handleVendorChange = useCallback(
        (value: string | number | null) => {
            const selected = vendorOptions.find((v: any) => v.value === value) || null
            setSelectedVendor(selected)
        },
        [vendorOptions]
    )

    const handleCheckAction = useCallback((checked: boolean, item: OrderedItem) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(item.order_item_id)
            } else {
                newSet.delete(item.order_item_id)
            }
            return newSet
        })
    }, [])


    const handleAssignToAdmin = useCallback(() => {
        const newAssignments = new Map(itemAssignments)
        selectedItems.forEach((itemId) => {
            newAssignments.set(itemId, {
                itemId,
                vendorId: "admin",
                vendorName: "Admin",
                storeName: "Self-Fulfillment",
                assignmentType: "admin",
            })
        })
        setItemAssignments(newAssignments)
        setSelectedItems(new Set())
        toast.success(`${selectedCount} item${selectedCount > 1 ? "s" : ""} assigned to Admin`)
    }, [selectedCount, selectedItems, itemAssignments])

    const handleAssignToVendor = useCallback(async () => {
        if (!selectedVendor || selectedCount === 0) return

        const itemIds = Array.from(selectedItems) as number[]

        try {
            await orderService.orderAssignToVendor(orderUuid, selectedVendor.value, itemIds)

            const newAssignments = new Map(itemAssignments)
            itemIds.forEach((itemId) => {
                newAssignments.set(itemId, {
                    itemId,
                    vendorId: selectedVendor.value,
                    vendorName: selectedVendor.label,
                    storeName: (selectedVendor as any).storeName || selectedVendor.label,
                    assignmentType: "vendor",
                })
            })
            setItemAssignments(newAssignments)
            setSelectedItems(new Set())
            setSelectedVendor(null)
            toast.success(`${selectedCount} item${selectedCount > 1 ? "s" : ""} assigned to vendor`)
        } catch (error: any) {
            toast.error(error?.message || "Failed to assign items to vendor")
        }
    }, [selectedVendor, selectedCount, selectedItems, orderUuid, itemAssignments])


    const handleClearAssignments = useCallback(() => {
        setItemAssignments(new Map())
        toast.success("All assignments cleared")
    }, [])

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-12 w-12 mx-auto animate-pulse text-primary mb-4"/>
                    <p className="text-muted-foreground">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4"/>
                    <p className="text-muted-foreground">Order not found</p>
                </div>
            </div>
        )
    }

    const unassignedCount = data.ordered_items.filter(item => !item.order_item_assigned_to).length
    const assignedCount = itemCount - unassignedCount

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 print:bg-white">
            <div className="p-4 sm:p-6 lg:p-8">
                <div
                    className="border hover:border-primary/30 hover:shadow-xl rounded-lg bg-white transition-all duration-300">
                    <OrderHeader
                        orderCode={data.order_code}
                        copied={copied}
                        onCopy={handleCopyOrderCode}
                        onPrint={() => window.print()}
                    />

                    <main className="p-4 sm:p-6 lg:p-8 space-y-6">
                        <CustomerInfo data={data as any}/>
                        <Separator/>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <OrderSummary data={data}/>
                            {showDescriptionSection && (
                                <OrderNotes
                                    description={data.description}
                                    giftWrap={data.gift_wrap}
                                    giftWrapRemarks={data.gift_wrap_remarks}
                                />
                            )}
                        </div>

                        <Separator/>

                        <section className="space-y-4">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" aria-hidden="true"/>
                                        <span>Ordered Items</span>
                                    </h2>
                                    <span className="text-xs bg-muted/50 px-2 py-0.5 rounded-full"
                                          aria-label={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}>
                                        {itemCount} {itemCount === 1 ? "item" : "items"}
                                    </span>
                                    {assignedCount > 0 && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                              aria-label={`${assignedCount} assigned`}>
                                            {assignedCount} pre-assigned
                                        </span>
                                    )}
                                    {selectedCount > 0 && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                                              aria-label={`${selectedCount} selected`}>
                                            {selectedCount} selected
                                        </span>
                                    )}
                                </div>

                                {unassignedCount > 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleSelectAll}
                                        className="text-xs"
                                        aria-label={allSelected ? "Deselect all items" : "Select all items"}
                                    >
                                        {allSelected ? (
                                            <>
                                                <Square className="h-3.5 w-3.5" aria-hidden="true"/> Deselect All
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className="h-3.5 w-3.5" aria-hidden="true"/> Select All
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {itemCount > 0 ? (
                                <div
                                    className={cn(
                                        useGridLayout ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"
                                    )}
                                    role="list"
                                    aria-label="Ordered items"
                                >
                                    {data.ordered_items.map((item) => {
                                        const localAssignment = itemAssignments.get(item.order_item_id)
                                        const isAssigned = !!item.order_item_assigned_to
                                        const assignment = isAssigned
                                            ? {assignmentType: "vendor" as const}
                                            : localAssignment

                                        return (
                                            <div key={item.order_item_id} className="relative" role="listitem">
                                                <OrderedItemCard
                                                    item={item}
                                                    showAnimation
                                                    checked={selectedItems.has(item.order_item_id)}
                                                    onCheckAction={handleCheckAction}
                                                    className={cn('')}
                                                />
                                                {assignment && (
                                                    <div
                                                        className={cn(
                                                            "absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-lg z-10",
                                                            assignment.assignmentType === "admin"
                                                                ? "bg-blue-600"
                                                                : "bg-green-600"
                                                        )}
                                                        role="status"
                                                        aria-label={`Assigned to ${assignment.assignmentType === "admin" ? "Admin" : "Vendor"}`}
                                                    >
                                                        ✓ {assignment.assignmentType === "admin" ? "Admin" : "Vendor"}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/30 border border-dashed rounded-xl">
                                    <Package className="h-12 w-12 mx-auto opacity-60 mb-2" aria-hidden="true"/>
                                    <p className="font-medium">No items in this order</p>
                                </div>
                            )}
                        </section>

                        {assignmentsByVendor.size > 0 && (
                            <>
                                <Separator/>
                                <AssignmentSummary
                                    assignmentsByVendor={assignmentsByVendor}
                                    onClear={handleClearAssignments}
                                />
                            </>
                        )}
                    </main>


                    <footer className="border-t bg-muted/30 p-6 space-y-6 print:hidden">
                        <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <section className="space-y-4" aria-labelledby="admin-assignment-heading">
                                <h3 id="admin-assignment-heading"
                                    className="font-semibold text-base flex items-center gap-2">
                                    <UserCog className="h-5 w-5 text-blue-600" aria-hidden="true"/>
                                    Assign to Admin
                                </h3>

                                <div className="flex justify-between items-center p-4 bg-blue-50/50 border rounded-lg">
                                    <p className="text-sm" aria-live="polite">
                                        {selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected` : "Select items to assign"}
                                    </p>

                                    <Button
                                        size="sm"
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={selectedCount === 0}
                                        onClick={handleAssignToAdmin}
                                        aria-label={`Assign ${selectedCount} selected item${selectedCount > 1 ? "s" : ""} to admin`}
                                    >
                                        <Check className="h-4 w-4"
                                               aria-hidden="true"/> Assign {selectedCount > 0 && `(${selectedCount})`}
                                    </Button>
                                </div>
                            </section>

                            <section className="space-y-4" aria-labelledby="vendor-assignment-heading">
                                <h3 id="vendor-assignment-heading"
                                    className="font-semibold text-base flex items-center gap-2">
                                    <Store className="h-5 w-5 text-green-600" aria-hidden="true"/>
                                    Assign to Vendor
                                </h3>

                                <div className="p-4 bg-green-50/50 border rounded-lg space-y-4">
                                    <SearchSelectField
                                        label="Select Vendor"
                                        placeholder="Choose vendor"
                                        options={vendorOptions}
                                        value={selectedVendor?.value ?? ""}
                                        onChange={handleVendorChange}
                                    />

                                    <div className="flex justify-between items-center">
                                        <p className="text-sm" aria-live="polite">
                                            {selectedCount > 0 && selectedVendor
                                                ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected`
                                                : "Select items and vendor"}
                                        </p>

                                        <Button
                                            size="sm"
                                            className="bg-green-600 text-white hover:bg-green-700"
                                            disabled={!selectedVendor || selectedCount === 0}
                                            onClick={handleAssignToVendor}
                                            aria-label={`Assign ${selectedCount} selected item${selectedCount > 1 ? "s" : ""} to vendor`}
                                        >
                                            <Save className="h-4 w-4"
                                                  aria-hidden="true"/> Assign {selectedCount > 0 && `(${selectedCount})`}
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {!canCancelOrder && (
                            <Alert className="border border-amber-200 bg-amber-50/50" role="alert">
                                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true"/>
                                <AlertDescription className="text-sm text-amber-800">
                                    This order cannot be cancelled (Status: {data.status})
                                </AlertDescription>
                            </Alert>
                        )}

                        <Separator/>

                        <Button
                            variant="outline"
                            onClick={() => startTransition(() => router.back())}
                            disabled={isPending}
                            aria-label="Go back to previous page"
                        >
                            {isPending ? "Loading..." : "Back"}
                        </Button>
                    </footer>

                    {unassignedCount === 0 && (
                        <footer className="border-t bg-muted/30 p-6 print:hidden">
                            <Button
                                variant="outline"
                                onClick={() => startTransition(() => router.back())}
                                disabled={isPending}
                                aria-label="Go back to previous page"
                            >
                                {isPending ? "Loading..." : "Back"}
                            </Button>
                        </footer>
                    )}
                </div>
            </div>
        </div>
    )
}