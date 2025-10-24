'use client';

import {useQuery} from "@tanstack/react-query";
import orderService from "@/service/order.service";
import {useParams} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {
    ArrowLeft,
    Calendar,
    Check,
    Copy,
    CreditCard,
    Download,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    Printer,
    User,
    XCircle
} from "lucide-react";
import {useState} from "react";
import {FormatCurrency, StatusBadge} from "@/lib/helper";

interface OrderedItem {
    type: string;
    item_name: string;
    variant_name: string | null;
    variant_size: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderData {
    order_code: string;
    user_type: string;
    name: string;
    email: string;
    mobile: string;
    address: string;
    description: string;
    price: number;
    payment_method: string;
    payment_status: string;
    status: string;
    created_at: string;
    ordered_items: OrderedItem[];
}

export default function OrderDetails() {
    const params = useParams();
    const uuid = params.slug as string;
    const [copied, setCopied] = useState(false);

    const {data, error, isLoading} = useQuery<OrderData>({
        queryKey: ['order-details', uuid],
        queryFn: () => orderService.getOrderDetails(uuid),
        enabled: !!uuid,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const handleCopyOrderCode = async () => {
        if (data?.order_code) {
            await navigator.clipboard.writeText(data.order_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
                    <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 mb-4 sm:mb-6"/>
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                        <Skeleton className="h-6 sm:h-8 w-36 sm:w-48 mb-3 sm:mb-4"/>
                        <Skeleton className="h-4 w-24 sm:w-32"/>
                    </div>
                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mb-4 sm:mb-6">
                        <Skeleton className="h-64 sm:h-72 lg:col-span-2"/>
                        <Skeleton className="h-64 sm:h-72"/>
                    </div>
                    <Skeleton className="h-80 sm:h-96"/>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
                    <Alert variant="destructive" className="shadow-lg">
                        <XCircle className="h-4 w-4"/>
                        <AlertDescription>
                            Failed to load order details. Please try again later.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 print:bg-white">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
                <div className="mb-4 sm:mb-6 print:hidden">
                    <Button
                        variant="ghost"
                        className="mb-2 sm:mb-4 hover:bg-white/80 backdrop-blur-sm transition-all"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        <span className="hidden sm:inline">Back to Orders</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-[#4a358e] truncate">
                                Order Details
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-xs sm:text-sm bg-slate-100 px-2 sm:px-3 py-1 rounded-md font-mono">
                                    #{data.order_code}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyOrderCode}
                                    className="h-6 sm:h-7 px-2"
                                >
                                    {copied ? (
                                        <Check className="h-3 w-3 text-green-600"/>
                                    ) : (
                                        <Copy className="h-3 w-3"/>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2 print:hidden flex-wrap sm:flex-nowrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="hover:bg-slate-50 flex-1 sm:flex-none"
                            >
                                <Printer className="h-4 w-4 sm:mr-2"/>
                                <span className="hidden sm:inline">Print</span>
                            </Button>
                            <Button
                                size="sm"
                                className="bg-[#4a358e] hover:bg-[#3a2870] text-white flex-1 sm:flex-none"
                                disabled
                            >
                                <Download className="h-4 w-4 sm:mr-2"/>
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mb-4 sm:mb-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        <Card className="shadow-md hover:shadow-lg transition-all border-slate-200/50 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <div className="p-2 rounded-lg bg-[#4a358e]/10">
                                        <User className="h-4 sm:h-5 w-4 sm:w-5 text-[#4a358e]"/>
                                    </div>
                                    <span className="truncate">Customer Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 pl-5 sm:pl-6 break-words">{data.name}</p>
                                        </div>
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                                            </div>
                                            <p className="text-sm text-slate-700 pl-5 sm:pl-6 break-all">{data.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Phone className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mobile</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 pl-5 sm:pl-6">{data.mobile}</p>
                                        </div>
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</p>
                                            </div>
                                            <p className="text-sm text-slate-700 pl-5 sm:pl-6 break-words">{data.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {data.description && (
                            <Card className="shadow-md border-slate-200/50 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-3 p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                        <FileText className="h-4 w-4 text-[#4a358e]"/>
                                        <span className="truncate">Order Notes</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <p className="text-sm text-slate-600 leading-relaxed break-words">{data.description}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <Card className="shadow-md hover:shadow-lg transition-all border-slate-200/50 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <div className="p-2 rounded-lg bg-[#4a358e]/10">
                                        <Package className="h-4 sm:h-5 w-4 sm:w-5 text-[#4a358e]"/>
                                    </div>
                                    <span className="truncate">Order Summary</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-5 p-4 sm:p-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400"/>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Order Date</p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 pl-5 sm:pl-6 break-words">{data.created_at}</p>
                                </div>

                                <Separator/>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400"/>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Payment Method</p>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 pl-5 sm:pl-6 capitalize break-words">{data.payment_method}</p>
                                </div>

                                <Separator/>

                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Status</p>
                                    <div className="space-y-3 pl-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-slate-600 truncate">Order Status</span>
                                            <StatusBadge status={data.status}/>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-slate-600 truncate">Payment</span>
                                            <StatusBadge status={data.payment_status}/>
                                        </div>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="bg-gradient-to-br from-[#4a358e]/5 to-[#4a358e]/10 rounded-lg p-3 sm:p-4 border border-[#4a358e]/20">
                                    <p className="text-xs font-medium text-slate-600 mb-1">Total Amount</p>
                                    <p className="text-xl sm:text-2xl font-bold text-[#4a358e] break-words">
                                        {FormatCurrency(data.price)}
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {data.user_type}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="shadow-md border-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-[#4a358e]/10">
                                    <Package className="h-4 sm:h-5 w-4 sm:w-5 text-[#4a358e]"/>
                                </div>
                                <span className="truncate">Ordered Items</span>
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                                {data.ordered_items.length} {data.ordered_items.length === 1 ? 'item' : 'items'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {data.ordered_items.map((item, index) => (
                                <div key={index}>
                                    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-slate-50/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                                                <h4 className="font-semibold text-slate-900 text-sm sm:text-base break-words flex-1">{item.item_name}</h4>
                                                <Badge variant="secondary" className="text-xs shrink-0 capitalize">
                                                    {item.type}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm">
                                                {item.variant_name && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">Variant</p>
                                                        <p className="font-medium text-slate-700 break-words">{item.variant_name}</p>
                                                    </div>
                                                )}
                                                {item.variant_size && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">Size</p>
                                                        <p className="font-medium text-slate-700 break-words">{item.variant_size}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Quantity</p>
                                                    <p className="font-semibold text-slate-900">{item.quantity}x</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Unit Price</p>
                                                    <p className="font-medium text-slate-700 break-words">
                                                        NPR {item.price.toLocaleString('en-NP', {minimumFractionDigits: 2})}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:text-right pt-2 sm:pt-0 sm:border-t-0 border-t sm:border-l sm:pl-4 border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1">Subtotal</p>
                                            <p className="text-base sm:text-lg font-bold text-[#4a358e] break-words">
                                                NPR {item.subtotal.toLocaleString('en-NP', {minimumFractionDigits: 2})}
                                            </p>
                                        </div>
                                    </div>
                                    {index < data.ordered_items.length - 1 && (
                                        <Separator className="my-2"/>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4 sm:my-6"/>

                        <div className="rounded-lg p-4 sm:p-6 border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Grand Total</p>
                                    <p className="text-xs text-slate-500">Including all items</p>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-[#4a358e] break-words">
                                    {FormatCurrency(data.price)}
                                </p>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}