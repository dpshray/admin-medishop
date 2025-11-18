'use client'

import {useCallback, useMemo, useState, useTransition, memo} from "react"
import {useParams, useRouter} from "next/navigation"
import {toast} from "sonner"
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckSquare,
    Copy,
    Download,
    FileText,
    Package,
    Printer,
    Save,
    Square,
    XCircle,
    Store,
    UserCog
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Alert, AlertDescription} from "@/components/ui/alert"
import SearchSelectField from "@/components/field/search-select"
import CustomerInfo from "@/components/order/CustomerInfoCard"
import {OrderedItem, OrderedItemCard} from "@/components/order/OrderedItemCard"
import {FormatCurrency, StatusBadge} from "@/lib/helper"
import {cn} from "@/lib/utils"
import ActionModal from "@/components/modal/ConfirmModal"
import {ORDER_STATUS, ORDER_TYPE, PAYMENT_STATUS} from "@/types/enum"

const COPIED_TIMEOUT = 2000

interface OrderData {
    order_code: string
    user_type: "USER" | "VENDOR" | "GUEST"
    name: string
    email: string
    mobile: string
    address: string
    price: number
    payment_method: string
    payment_status: PAYMENT_STATUS
    status: ORDER_STATUS | string
    created_at: string
    description?: string
    gift_wrap?: boolean
    gift_wrap_remarks?: string
    ordered_items: OrderedItem[]
    order_assigned_to?: {
        vendor_uuid: string
        store_name: string
    }
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
    assignmentType: 'admin' | 'vendor'
}

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

const OrderHeader = memo(({
                              orderCode,
                              copied,
                              onCopy,
                              onPrint
                          }: {
    orderCode: string
    copied: boolean
    onCopy: () => void
    onPrint: () => void
}) => (
    <div className="border-b bg-gradient-to-br from-primary/5 to-purple-50/50 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-[#6b4fc0] bg-clip-text text-transparent">
                    Order Details
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-primary/20 font-mono font-semibold shadow-sm break-all">
                        #{orderCode}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCopy}
                        className="border border-transparent hover:border-primary/10 transition-all h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg flex-shrink-0"
                        aria-label="Copy order code"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        )}
                    </Button>
                </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap items-start print:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrint}
                    className="border hover:bg-muted/50 hover:border-primary/40 transition-all text-xs sm:text-sm"
                    aria-label="Print order"
                >
                    <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-medium">Print</span>
                </Button>
                <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                    disabled
                    aria-label="Download order"
                >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-medium">Download</span>
                </Button>
            </div>
        </div>
    </div>
))

OrderHeader.displayName = 'OrderHeader'

const OrderSummary = memo(({ data }: { data: OrderData }) => (
    <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" aria-hidden="true" />
            Order Summary
        </h2>
        <div className="space-y-2 bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all">
            <dl className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                    <dt>Order Date</dt>
                    <dd className="font-semibold">{data.created_at}</dd>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <dt>Payment Method</dt>
                    <dd className="capitalize font-semibold">{data.payment_method}</dd>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <dt>Order Status</dt>
                    <dd><StatusBadge status={data.status} /></dd>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <dt>Payment Status</dt>
                    <dd><StatusBadge status={data.payment_status} /></dd>
                </div>
            </dl>
            <Separator />
            <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">
                    Total Amount
                </p>
                <p className="text-3xl font-bold text-primary break-all">
                    {FormatCurrency(data.price)}
                </p>
            </div>
        </div>
    </section>
))

OrderSummary.displayName = 'OrderSummary'

const OrderNotes = memo(({ description, giftWrap, giftWrapRemarks }: {
    description?: string
    giftWrap?: boolean
    giftWrapRemarks?: string
}) => (
    <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            Order Notes
        </h2>
        <div className="bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {description}
            </p>
        </div>
        {giftWrap && giftWrapRemarks && (
            <div className="space-y-3 mt-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                    Gift Wrap
                </h3>
                <div className="bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {giftWrapRemarks}
                    </p>
                </div>
            </div>
        )}
    </section>
))

OrderNotes.displayName = 'OrderNotes'

const AssignmentSummary = memo(({
                                    assignmentsByVendor,
                                    onClear
                                }: {
    assignmentsByVendor: Map<string, { vendorName: string; items: OrderedItem[]; assignmentType: 'admin' | 'vendor' }>
    onClear: () => void
}) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Assignment Summary</h2>
            <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="text-xs"
                aria-label="Clear all assignments"
            >
                Clear All
            </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(assignmentsByVendor.entries()).map(([vendorId, {vendorName, items, assignmentType}]) => {
                const isAdmin = assignmentType === 'admin'
                const bgColor = isAdmin ? 'from-blue-50 to-indigo-50' : 'from-green-50 to-emerald-50'
                const borderColor = isAdmin ? 'border-blue-200' : 'border-green-200'
                const textColor = isAdmin ? 'text-blue-900' : 'text-green-900'
                const lightTextColor = isAdmin ? 'text-blue-700' : 'text-green-700'

                return (
                    <div
                        key={vendorId}
                        className={cn("bg-gradient-to-br p-4 rounded-xl border", bgColor, borderColor)}
                    >
                        <div className="mb-3 flex items-start gap-2">
                            {isAdmin ? (
                                <UserCog className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            ) : (
                                <Store className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className={cn("font-bold text-sm mb-1", textColor)}>
                                    {vendorName}
                                </h3>
                                <p className={cn("text-xs font-medium", lightTextColor)}>
                                    ID: {vendorId}
                                </p>
                            </div>
                        </div>
                        <ul className="space-y-1.5 mb-3">
                            {items.map(item => (
                                <li key={item.id} className={cn("text-xs flex justify-between items-start", lightTextColor)}>
                                    <span className="flex-1">• {item.item_name}</span>
                                    <span className="font-semibold ml-2">{FormatCurrency(item.subtotal)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={cn("pt-2 border-t", borderColor)}>
                            <div className="flex justify-between items-center">
                                <span className={cn("text-xs font-semibold", textColor)}>Total:</span>
                                <span className={cn("text-sm font-bold", textColor)}>
                                    {FormatCurrency(items.reduce((sum, item) => sum + item.subtotal, 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </section>
))

AssignmentSummary.displayName = 'AssignmentSummary'

export default function OrderDetails() {
    const params = useParams()
    const orderUuid = params.slug as string
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<VendorOption | null>(null)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())
    const [itemAssignments, setItemAssignments] = useState<Map<string | number, ItemAssignment>>(new Map())

    const data: OrderData = useMemo(() => ({
        order_code: "ORD-786522",
        user_type: "USER",
        name: "John Doe",
        email: "john@example.com",
        mobile: "9876543210",
        address: "Kathmandu, Nepal",
        price: 2499,
        payment_method: "esewa",
        payment_status: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.PENDING,
        created_at: "2025-11-15",
        description: "Deliver between 7PM - 9PM",
        gift_wrap: true,
        gift_wrap_remarks: "Add birthday theme wrapping",
        ordered_items: [
            {
                id: 1,
                type: ORDER_TYPE.KITBAG,
                prescription_required: false,
                item_name: "iPhone 15 Pro Case",
                variant_name: "Silicone",
                variant_size: "Standard",
                price: 1999,
                quantity: 1,
                subtotal: 1999
            },
            {
                id: 2,
                type: ORDER_TYPE.PRODUCT,
                prescription_required: false,
                item_name: "Screen Protector",
                variant_name: "Tempered Glass",
                price: 500,
                quantity: 1,
                subtotal: 500
            },
            {
                id: 3,
                type: ORDER_TYPE.KITBAG,
                prescription_required: false,
                item_name: "Wireless Charger",
                variant_name: "Fast Charging",
                variant_size: "15W",
                price: 1200,
                quantity: 1,
                subtotal: 1200
            },
            {
                id: 4,
                type: ORDER_TYPE.PRODUCT,
                prescription_required: false,
                item_name: "USB-C Cable",
                variant_size: "2M",
                price: 300,
                quantity: 2,
                subtotal: 600
            },
            {
                id: 5,
                type: ORDER_TYPE.KITBAG,
                prescription_required: false,
                item_name: "Phone Stand",
                variant_name: "Aluminum",
                price: 450,
                quantity: 1,
                subtotal: 450
            },
            {
                id: 6,
                type: ORDER_TYPE.PRODUCT,
                prescription_required: false,
                item_name: "AirPods Pro 2",
                variant_name: "USB-C",
                price: 24999,
                quantity: 1,
                subtotal: 24999
            },
            {
                id: 7,
                type: ORDER_TYPE.PACKAGE,
                prescription_required: false,
                item_name: "MacBook Air M3",
                variant_name: "Space Gray",
                variant_size: "13-inch",
                price: 124999,
                quantity: 1,
                subtotal: 124999
            },
            {
                id: 8,
                type: ORDER_TYPE.PACKAGE,
                prescription_required: false,
                item_name: "Magic Mouse",
                variant_name: "Black",
                price: 8499,
                quantity: 1,
                subtotal: 8499
            },
            {
                id: 9,
                type: ORDER_TYPE.PACKAGE,
                prescription_required: false,
                item_name: "Apple Watch Series 9",
                variant_name: "GPS",
                variant_size: "45mm",
                price: 42999,
                quantity: 1,
                subtotal: 42999
            },
            {
                id: 10,
                type: ORDER_TYPE.PACKAGE,
                prescription_required: false,
                item_name: "iPad Pro 11",
                variant_name: "Wi-Fi",
                variant_size: "256GB",
                price: 89999,
                quantity: 1,
                subtotal: 89999
            }
        ],
        order_assigned_to: {
            vendor_uuid: "ven-999",
            store_name: "TechStore Nepal"
        }
    }), [])

    const vendors: VendorOption[] = useMemo(() => [
        {
            value: "ven-111",
            label: "Gadget Mart - Mexico",
            searchText: "Gadget Mart Mexico"
        },
        {
            value: "ven-222",
            label: "iTech Hub - New Road, Kathmandu | 9851234568",
            searchText: "iTech Hub New Road Kathmandu 9851234568"
        },
        {
            value: "ven-333",
            label: "Mobile Care Nepal - Durbarmarg, Kathmandu | 9861234569",
            searchText: "Mobile Care Nepal Durbarmarg Kathmandu 9861234569"
        }
    ], [])

    const canCancelOrder = useMemo(() => {
        if (!data?.status) return false
        return data.status !== ORDER_STATUS.CANCELLED && data.status !== ORDER_STATUS.COMPLETED
    }, [data?.status])

    const itemCount = useMemo(() => data?.ordered_items?.length || 0, [data?.ordered_items])
    const useGridLayout = itemCount > 2
    const showDescriptionSection = Boolean(data?.description)
    const selectedCount = selectedItems.size
    const allSelected = selectedCount === itemCount && itemCount > 0

    const assignmentsByVendor = useMemo(() => {
        const grouped = new Map<string, { vendorName: string; items: OrderedItem[]; assignmentType: 'admin' | 'vendor' }>()

        itemAssignments.forEach((assignment) => {
            const item = data.ordered_items.find(i => i.id === assignment.itemId)
            if (item) {
                if (!grouped.has(assignment.vendorId)) {
                    grouped.set(assignment.vendorId, {
                        vendorName: assignment.vendorName,
                        items: [],
                        assignmentType: assignment.assignmentType
                    })
                }
                grouped.get(assignment.vendorId)!.items.push(item)
            }
        })

        return grouped
    }, [itemAssignments, data.ordered_items])

    const handleCancelModalClose = useCallback(() => {
        setIsCancelModalOpen(false)
    }, [])

    const confirmCancelOrder = useCallback(() => {
        toast.success("Order cancelled successfully")
        handleCancelModalClose()
        startTransition(() => router.back())
    }, [handleCancelModalClose, router])

    const handleCopyOrderCode = useCallback(async () => {
        if (!data?.order_code) return
        const success = await copyToClipboard(data.order_code)
        if (success) {
            setCopied(true)
            toast.success("Order code copied")
            setTimeout(() => setCopied(false), COPIED_TIMEOUT)
        }
    }, [data?.order_code])

    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    const handleVendorChange = useCallback((value: string | number | null) => {
        const selected = vendors.find((v) => v.value === value) || null
        setSelectedVendor(selected)
    }, [vendors])

    const handleCheckAction = useCallback((checked: boolean, item: OrderedItem) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(item.id!)
            } else {
                newSet.delete(item.id!)
            }
            return newSet
        })
    }, [])

    const handleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(data.ordered_items.map(item => item.id!)))
        }
    }, [allSelected, data.ordered_items])

    const handleDeleteAction = useCallback((item: OrderedItem) => {
        toast.success(`Removed: ${item.item_name}`)
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(item.id!)
            return newSet
        })
        setItemAssignments(prev => {
            const newMap = new Map(prev)
            newMap.delete(item.id!)
            return newMap
        })
    }, [])

    const handleAssignToAdmin = useCallback(() => {
        if (selectedCount === 0) return

        const newAssignments = new Map(itemAssignments)
        selectedItems.forEach(itemId => {
            newAssignments.set(itemId, {
                itemId,
                vendorId: "admin",
                vendorName: "Admin (Self-Fulfillment)",
                assignmentType: 'admin'
            })
        })

        setItemAssignments(newAssignments)
        setSelectedItems(new Set())

        toast.success(`${selectedCount} item${selectedCount > 1 ? 's' : ''} assigned to Admin`)
    }, [selectedCount, selectedItems, itemAssignments])

    const handleAssignToVendor = useCallback(() => {
        if (!selectedVendor || selectedCount === 0) return

        const vendorName = selectedVendor.searchText ||
            (typeof selectedVendor.label === 'string' ? selectedVendor.label : selectedVendor.value)

        const newAssignments = new Map(itemAssignments)
        selectedItems.forEach(itemId => {
            newAssignments.set(itemId, {
                itemId,
                vendorId: selectedVendor.value,
                vendorName: vendorName,
                assignmentType: 'vendor'
            })
        })

        setItemAssignments(newAssignments)
        setSelectedItems(new Set())
        setSelectedVendor(null)

        toast.success(`${selectedCount} item${selectedCount > 1 ? 's' : ''} assigned to vendor`)
    }, [selectedVendor, selectedCount, selectedItems, itemAssignments])

    const handleClearAssignments = useCallback(() => {
        setItemAssignments(new Map())
        toast.success("All assignments cleared")
    }, [])

    const handleFinalizeAssignments = useCallback(() => {
        if (itemAssignments.size === 0) {
            toast.error("Please assign items to vendors first")
            return
        }

        if (itemAssignments.size !== itemCount) {
            toast.warning(`${itemCount - itemAssignments.size} item(s) not assigned yet`)
            return
        }

        toast.success("Order split and assigned successfully!")
    }, [itemAssignments, itemCount])

    const handleCancelOrder = useCallback(() => setIsCancelModalOpen(true), [])
    const handleGoBack = useCallback(() => startTransition(() => router.back()), [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 print:bg-white">
            <div className="w-full px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
                <div className="border hover:border-primaryColor/30 transition-all duration-300 hover:shadow-xl overflow-hidden rounded-lg bg-white">
                    <OrderHeader
                        orderCode={data.order_code}
                        copied={copied}
                        onCopy={handleCopyOrderCode}
                        onPrint={handlePrint}
                    />

                    <main className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                        <CustomerInfo data={data as any} />

                        <Separator className="bg-border/60" />

                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            <OrderSummary data={data} />

                            {showDescriptionSection && (
                                <OrderNotes
                                    description={data.description}
                                    giftWrap={data.gift_wrap}
                                    giftWrapRemarks={data.gift_wrap_remarks}
                                />
                            )}
                        </div>

                        <Separator className="bg-border/60" />

                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" aria-hidden="true" />
                                        Ordered Items
                                    </h2>
                                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                        {itemCount} {itemCount === 1 ? "item" : "items"}
                                    </span>
                                    {selectedCount > 0 && (
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            {selectedCount} selected
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="text-xs"
                                    aria-label={allSelected ? "Deselect all items" : "Select all items"}
                                >
                                    {allSelected ? (
                                        <>
                                            <Square className="h-3.5 w-3.5" aria-hidden="true" />
                                            Deselect All
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
                                            Select All
                                        </>
                                    )}
                                </Button>
                            </div>

                            {itemCount > 0 ? (
                                <div className={cn(useGridLayout ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4")}>
                                    {data.ordered_items.map((item, index) => {
                                        const assignment = itemAssignments.get(item.id!)
                                        return (
                                            <div key={item.id || index} className="relative">
                                                <OrderedItemCard
                                                    item={item}
                                                    showAnimation
                                                    checked={selectedItems.has(item.id!)}
                                                    onCheckAction={handleCheckAction}
                                                    onDeleteAction={handleDeleteAction}
                                                />
                                                {assignment && (
                                                    <div
                                                        className={cn(
                                                            "absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-md shadow-lg font-semibold z-10",
                                                            assignment.assignmentType === 'admin' ? 'bg-blue-600' : 'bg-green-600'
                                                        )}
                                                        role="status"
                                                        aria-label={`Assigned to ${assignment.vendorName}`}
                                                    >
                                                        ✓ {assignment.assignmentType === 'admin' ? 'Admin' : 'Vendor'}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
                                    <p className="text-base font-medium">No items in this order</p>
                                </div>
                            )}
                        </section>

                        {assignmentsByVendor.size > 0 && (
                            <>
                                <Separator className="bg-border/60" />
                                <AssignmentSummary
                                    assignmentsByVendor={assignmentsByVendor}
                                    onClear={handleClearAssignments}
                                />
                            </>
                        )}
                    </main>

                    <footer className="border-t bg-muted/30 p-6 print:hidden space-y-6">
                        <div className="w-full space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-base flex items-center gap-2">
                                    <UserCog className="h-5 w-5 text-blue-600" aria-hidden="true" />
                                    Assign to Admin
                                </h3>
                                <div className="flex items-center justify-between gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} selected` : 'Select items to assign to admin'}
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={handleAssignToAdmin}
                                        disabled={selectedCount === 0}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50"
                                        aria-label={`Assign ${selectedCount} selected items to admin`}
                                    >
                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                        Assign to Admin {selectedCount > 0 && `(${selectedCount})`}
                                    </Button>
                                </div>
                            </div>

                            <Separator className="bg-border/60" />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-base flex items-center gap-2">
                                    <Store className="h-5 w-5 text-green-600" aria-hidden="true" />
                                    Assign to Vendor
                                </h3>
                                <div className="space-y-4 p-4 bg-green-50/50 rounded-lg border border-green-200">
                                    <SearchSelectField
                                        label="Select Vendor"
                                        placeholder="Choose vendor"
                                        options={vendors}
                                        value={selectedVendor?.value ?? ""}
                                        onChange={handleVendorChange}
                                    />
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} selected` : 'Select items and vendor'}
                                        </p>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white transition-all shadow-md disabled:opacity-50"
                                            onClick={handleAssignToVendor}
                                            disabled={!selectedVendor || selectedCount === 0}
                                            aria-label={`Assign ${selectedCount} selected items to vendor`}
                                        >
                                            <Save className="h-4 w-4" aria-hidden="true" />
                                            <span className="font-medium">
                                                Assign to Vendor {selectedCount > 0 && `(${selectedCount})`}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {itemAssignments.size > 0 && (
                                <Button
                                    className="w-full bg-primary hover:bg-primary/80 text-white shadow-md"
                                    onClick={handleFinalizeAssignments}
                                    aria-label={`Finalize assignment of ${itemAssignments.size} out of ${itemCount} items`}
                                >
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                    Finalize Assignment ({itemAssignments.size}/{itemCount} items)
                                </Button>
                            )}
                        </div>

                        {!canCancelOrder && (
                            <Alert className="border border-amber-200 bg-amber-50/50 w-full">
                                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                                <AlertDescription className="text-sm text-amber-800 font-medium">
                                    This order cannot be cancelled as it is already {data.status}.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Separator className="w-full" />

                        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={handleGoBack}
                                disabled={isPending}
                                className="border hover:bg-muted/50 hover:border-primary/40 transition-all text-sm w-full sm:w-auto"
                                aria-label="Go back to previous page"
                            >
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                <span className="font-medium">Back</span>
                            </Button>

                            {canCancelOrder && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelOrder}
                                    className="transition-all shadow-md w-full sm:w-auto text-sm"
                                    aria-label="Cancel this order"
                                >
                                    <XCircle className="h-4 w-4" aria-hidden="true" />
                                    <span className="font-medium">Cancel Order</span>
                                </Button>
                            )}
                        </div>
                    </footer>
                </div>
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