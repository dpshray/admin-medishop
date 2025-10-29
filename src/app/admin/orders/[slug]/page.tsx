'use client'

import {useCallback, useMemo, useState, useTransition} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useParams, useRouter} from "next/navigation";
import {toast} from "sonner";
import {AlertCircle, ArrowLeft, Check, Copy, Download, FileText, Package, Printer, Save, XCircle} from "lucide-react";
import ErrorState from "@/components/Error/ErrorState";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Alert, AlertDescription} from "@/components/ui/alert";
import CustomerInfo from "@/components/order/CustomerInfoCard";
import SearchSelectField from "@/components/field/search-select";
import {FormatCurrency, StatusBadge} from "@/lib/helper";
import useVendor from "@/hooks/use-vendor";
import orderService from "@/service/order.service";
import {OrderedItemCard} from "@/components/order/OrderedItemCard";
import {QUERY_STALE_TIME} from "@/config/app-constant";
import {cn} from "@/lib/utils";

const COPIED_TIMEOUT = 2000;


interface OrderData {
    order_code: string;
    created_at: string;
    payment_method: string;
    status: string;
    payment_status: string;
    price: number;
    description?: string;
    ordered_items: any[];
}

interface VendorOption {
    value: string;
    label: string;
}

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

export default function OrderDetails() {
    const params = useParams();
    const uuid = params.slug as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();

    const [copied, setCopied] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

    const {data, error, isLoading, isError} = useQuery<OrderData>({
        queryKey: ['order-details', uuid],
        queryFn: () => orderService.getOrderDetails(uuid),
        enabled: !!uuid,
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    const {vendors, isLoading: vendorsLoading} = useVendor({page: 0});

    const vendorOptions = useMemo(
        () => vendors?.map((v: any) => ({value: v.user_uuid, label: v.name})) || [],
        [vendors]
    );

    const selectedVendorOption = useMemo(
        () => selectedVendorId ? vendorOptions.find((v: any) => v.value === selectedVendorId) || null : null,
        [selectedVendorId, vendorOptions]
    );

    const updateVendorMutation = useMutation({
        mutationFn: (vendorId: string) => orderService.assignOrder(uuid, vendorId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['order-details', uuid]});
            toast.success('Vendor assigned successfully');
            setSelectedVendorId(null);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to assign vendor';
            toast.error(message);
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: () => orderService.cancelOrder(uuid),
        onSuccess: () => {
            toast.success('Order cancelled successfully');
            startTransition(() => {
                router.back();
            });
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to cancel order';
            toast.error(message);
        }
    });

    const handleCopyOrderCode = useCallback(async () => {
        if (!data?.order_code) return;

        const success = await copyToClipboard(data.order_code);
        if (success) {
            setCopied(true);
            toast.success('Order code copied to clipboard');
            setTimeout(() => setCopied(false), COPIED_TIMEOUT);
        } else {
            toast.error('Failed to copy order code');
        }
    }, [data?.order_code]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleVendorChange = useCallback((value: string | number) => {
        setSelectedVendorId(String(value));
    }, []);

    const handleUpdateVendor = useCallback(() => {
        if (!selectedVendorId) return;
        updateVendorMutation.mutate(selectedVendorId);
    }, [selectedVendorId, updateVendorMutation]);

    const handleCancelOrder = useCallback(() => {
        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            cancelOrderMutation.mutate();
        }
    }, [cancelOrderMutation]);

    const handleGoBack = useCallback(() => {
        startTransition(() => {
            router.back();
        });
    }, [router]);

    const canCancelOrder = useMemo(
        () => data?.status !== 'cancelled' && data?.status !== 'completed',
        [data?.status]
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
                    <Skeleton className="h-10 w-32 mb-6"/>
                    <Card className="shadow-xl border-slate-200/50">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <Skeleton className="h-8 w-48 mb-3"/>
                            <Skeleton className="h-6 w-32"/>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <Skeleton className="h-64"/>
                            <Skeleton className="h-48"/>
                            <Skeleton className="h-32"/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to load order details. Please try again later.';
        return <ErrorState message={errorMessage}/>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 print:bg-white">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
                <div className="mb-6 print:hidden">
                    <Button
                        variant="ghost"
                        className="hover:bg-white/80 transition-all duration-200"
                        onClick={handleGoBack}
                        disabled={isPending}
                        aria-label="Go back to previous page"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true"/>
                        Back
                    </Button>
                </div>

                <Card
                    className="shadow-xl border-slate-200/50 bg-white/95 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-2xl">
                    <CardHeader
                        className="border-b border-slate-100/80 p-6 bg-gradient-to-r from-[#4a358e]/5 to-purple-50/50">
                        <div className="flex justify-between flex-wrap gap-4">
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#4a358e]">
                                    Order Details
                                </h1>
                                <div className="flex items-center gap-2">
                                    <code
                                        className="text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-mono">
                                        #{data.order_code}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyOrderCode}
                                        className="hover:bg-[#4a358e]/10 transition-colors"
                                        aria-label={copied ? "Order code copied" : "Copy order code"}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" aria-hidden="true"/>
                                        ) : (
                                            <Copy className="h-4 w-4 text-slate-600" aria-hidden="true"/>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="border-slate-200 hover:bg-slate-50 hover:border-[#4a358e]/30 transition-all"
                                    aria-label="Print order details"
                                >
                                    <Printer className="h-4 w-4 mr-2" aria-hidden="true"/>
                                    Print
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#4a358e] hover:bg-[#3d2d75] text-white transition-colors shadow-md"
                                    disabled
                                    aria-label="Download order (coming soon)"
                                >
                                    <Download className="h-4 w-4 mr-2" aria-hidden="true"/>
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <CustomerInfo data={data as any}/>

                        <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent"/>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <section>
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-[#4a358e]" aria-hidden="true"/>
                                    Order Summary
                                </h2>
                                <div
                                    className="space-y-3 bg-gradient-to-br from-slate-50 to-purple-50/30 p-5 rounded-xl border border-slate-200/60 shadow-sm">
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
                                        <StatusBadge status={data.status}/>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-600 font-medium">Payment Status</span>
                                        <StatusBadge status={data.payment_status}/>
                                    </div>
                                    <Separator className="my-2"/>
                                    <div className="text-right pt-2">
                                        <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                                        <p className="text-3xl font-bold text-[#4a358e]">{FormatCurrency(data.price)}</p>
                                    </div>
                                </div>
                            </section>

                            {data.description && (
                                <section>
                                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-[#4a358e]" aria-hidden="true"/>
                                        Order Notes
                                    </h2>
                                    <div
                                        className="bg-gradient-to-br from-slate-50 to-purple-50/30 p-5 rounded-xl border border-slate-200/60 shadow-sm">
                                        <p className="text-sm text-slate-700 leading-relaxed">{data.description}</p>
                                    </div>
                                </section>
                            )}
                        </div>

                        <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent"/>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-[#4a358e]" aria-hidden="true"/>
                                Ordered Items
                                <span className="text-sm font-normal text-slate-500 ml-2">
                                    ({data.ordered_items.length} {data.ordered_items.length === 1 ? 'item' : 'items'})
                                </span>
                            </h2>
                            <div className={cn('space-y-4',
                                data.ordered_items.length === 0 && 'hidden',
                                data.ordered_items.length > 3 && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                            )}>
                                {data.ordered_items.map((item, index) => (
                                    <OrderedItemCard
                                        key={`${item.id || index}-${index}`}
                                        item={item}
                                        showAnimation
                                    />
                                ))}
                            </div>
                        </section>
                    </CardContent>

                    <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-6 print:hidden">
                        <div className="w-full space-y-4">
                            <div className="grid sm:grid-cols-[1fr,auto] gap-4 items-end">
                                <SearchSelectField
                                    label="Assign Vendor"
                                    placeholder="Select vendor to assign"
                                    options={vendorOptions}
                                    value={selectedVendorOption}
                                    onChangeAction={handleVendorChange}
                                    disabled={vendorsLoading || updateVendorMutation.isPending}
                                    helperText={vendorsLoading ? "Loading vendors..." : undefined}
                                />
                                <Button
                                    className="bg-[#4a358e] hover:bg-[#3d2d75] text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 "
                                    onClick={handleUpdateVendor}
                                    disabled={!selectedVendorId || updateVendorMutation.isPending || vendorsLoading}
                                    aria-label="Assign selected vendor to order"
                                >
                                    <Save className="h-4 w-4 mr-2" aria-hidden="true"/>
                                    {updateVendorMutation.isPending ? 'Assigning...' : 'Assign Vendor'}
                                </Button>
                            </div>

                            {!canCancelOrder && (
                                <Alert className="border-amber-200 bg-amber-50">
                                    <AlertCircle className="h-4 w-4 text-amber-600"/>
                                    <AlertDescription className="text-sm text-amber-800">
                                        This order cannot be cancelled as it is already {data.status}.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent"/>

                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleGoBack}
                                    disabled={isPending}
                                    className="border-slate-200 hover:bg-slate-50 transition-all"
                                    aria-label="Go back to previous page"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true"/>
                                    Back
                                </Button>

                                {canCancelOrder && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelOrder}
                                        disabled={cancelOrderMutation.isPending}
                                        className="shadow-md hover:shadow-lg transition-all"
                                        aria-label="Cancel this order"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" aria-hidden="true"/>
                                        {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}