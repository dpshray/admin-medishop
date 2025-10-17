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
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    User,
    XCircle
} from "lucide-react";
import {useState} from "react";

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

const statusConfig = {
    PENDING: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        bgColor: "bg-amber-100"
    },
    CONFIRMED: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle2,
        bgColor: "bg-blue-100"
    },
    DELIVERED: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        bgColor: "bg-emerald-100"
    },
    CANCELLED: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        bgColor: "bg-red-100"
    },
};

const paymentStatusConfig = {
    PAID: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2
    },
    UNPAID: {
        color: "bg-orange-50 text-orange-700 border-orange-200",
        icon: AlertCircle
    },
};

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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <Skeleton className="h-10 w-32 mb-6"/>
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <Skeleton className="h-8 w-48 mb-4"/>
                        <Skeleton className="h-4 w-32"/>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3 mb-6">
                        <Skeleton className="h-72 lg:col-span-2"/>
                        <Skeleton className="h-72"/>
                    </div>
                    <Skeleton className="h-96"/>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
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

    const StatusIcon = statusConfig[data.status as keyof typeof statusConfig]?.icon || AlertCircle;
    const PaymentIcon = paymentStatusConfig[data.payment_status as keyof typeof paymentStatusConfig]?.icon || AlertCircle;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 print:bg-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-6 print:hidden">
                    <Button
                        variant="ghost"
                        className="mb-4 hover:bg-white"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back to Orders
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-[#4a358e] ">
                                Order Details
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm bg-slate-100 px-3 py-1 rounded-md font-mono">
                                    #{data.order_code}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyOrderCode}
                                    className="h-7 px-2"
                                >
                                    {copied ? (
                                        <Check className="h-3 w-3 text-green-600"/>
                                    ) : (
                                        <Copy className="h-3 w-3"/>
                                    )}
                                </Button>
                            </div>
                        </div>
                        {/*<div className="flex gap-2 print:hidden">*/}
                        {/*    <Button*/}
                        {/*        variant="outline"*/}
                        {/*        onClick={handlePrint}*/}
                        {/*        className="hover:bg-slate-50"*/}
                        {/*    >*/}
                        {/*        <Printer className="h-4 w-4 mr-2" />*/}
                        {/*        Print*/}
                        {/*    </Button>*/}
                        {/*    <Button*/}
                        {/*        style={{ backgroundColor: '#4a358e' }}*/}
                        {/*        className="text-white hover:opacity-90"*/}
                        {/*    >*/}
                        {/*        <Download className="h-4 w-4 mr-2" />*/}
                        {/*        Download*/}
                        {/*    </Button>*/}
                        {/*</div>*/}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 mb-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow  gap-3">
                            <CardHeader className=" border-b ">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="p-2 rounded-lg bg-[#4a358e]/10">
                                        <User className="h-5 w-5" style={{color: '#4a358e'}}/>
                                    </div>
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User
                                                    className="h-4 w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full
                                                    Name</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 pl-6">{data.name}</p>
                                        </div>
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail
                                                    className="h-4 w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                                            </div>
                                            <p className="text-sm text-slate-700 pl-6 break-all">{data.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Phone
                                                    className="h-4 w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mobile</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 pl-6">{data.mobile}</p>
                                        </div>
                                        <div className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin
                                                    className="h-4 w-4 text-slate-400 group-hover:text-[#4a358e] transition-colors"/>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</p>
                                            </div>
                                            <p className="text-sm text-slate-700 pl-6">{data.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {data.description && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-4 w-4" style={{color: '#4a358e'}}/>
                                        Order Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 leading-relaxed">{data.description}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                            <CardHeader className=" border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="p-2 rounded-lg bg-[#4a358e]/10">
                                        <Package className="h-5 w-5" style={{color: '#4a358e'}}/>
                                    </div>
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-slate-400"/>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Order
                                            Date</p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 pl-6">{data.created_at}</p>
                                </div>

                                <Separator/>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-4 w-4 text-slate-400"/>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Payment
                                            Method</p>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 pl-6">{data.payment_method}</p>
                                </div>

                                <Separator/>

                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Status</p>
                                    <div className="space-y-3 pl-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-600">Order Status</span>
                                            <Badge
                                                variant="outline"
                                                className={`${statusConfig[data.status as keyof typeof statusConfig]?.color || ""} font-medium px-3 py-1`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1"/>
                                                {data.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-600">Payment</span>
                                            <Badge
                                                variant="outline"
                                                className={`${paymentStatusConfig[data.payment_status as keyof typeof paymentStatusConfig]?.color || ""} font-medium px-3 py-1`}
                                            >
                                                <PaymentIcon className="h-3 w-3 mr-1"/>
                                                {data.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <Separator/>

                                <div
                                    className="bg-gradient-to-br from-[#4a358e]/5 to-[#4a358e]/10 rounded-lg p-4 border border-[#4a358e]/20">
                                    <p className="text-xs font-medium text-slate-600 mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold" style={{color: '#4a358e'}}>
                                        NPR {data.price.toLocaleString('en-NP', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {data.user_type}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className=" border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-[#4a358e]/10">
                                    <Package className="h-5 w-5" style={{color: '#4a358e'}}/>
                                </div>
                                Ordered Items
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {data.ordered_items.length} {data.ordered_items.length === 1 ? 'item' : 'items'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {data.ordered_items.map((item, index) => (
                                <div key={index}>
                                    <div
                                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-slate-900 text-base">{item.item_name}</h4>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs shrink-0 capitalize"
                                                >
                                                    {item.type}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                {item.variant_name && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">Variant</p>
                                                        <p className="font-medium text-slate-700">{item.variant_name}</p>
                                                    </div>
                                                )}
                                                {item.variant_size && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">Size</p>
                                                        <p className="font-medium text-slate-700">{item.variant_size}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Quantity</p>
                                                    <p className="font-semibold text-slate-900">{item.quantity}x</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Unit Price</p>
                                                    <p className="font-medium text-slate-700">
                                                        NPR {item.price.toLocaleString('en-NP', {minimumFractionDigits: 2})}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="sm:text-right sm:min-w-[140px] pt-2 sm:pt-0 sm:border-l sm:pl-4 border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1">Subtotal</p>
                                            <p className="text-lg font-bold" style={{color: '#4a358e'}}>
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

                        <Separator className="my-6"/>

                        <div className=" rounded-lg p-6 border border-slate-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Grand Total</p>
                                    <p className="text-xs text-slate-500">Including all items</p>
                                </div>
                                <p className="text-3xl font-bold text-primaryColor">
                                    NPR {data.price.toLocaleString('en-NP', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}