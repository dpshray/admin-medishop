'use client'

import {useParams} from "next/navigation";
import {
    CheckCircle,
    Clock,
    Heart,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    TrendingUp,
    User as UserIcon,
    XCircle
} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";
import {userDetailsData} from "@/data";

interface Address {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
}

interface Order {
    order_id: string;
    date: string;
    status: string;
    items_count: number;
    total_amount: number;
    payment_method: string;
    delivery_date: string | null;
}

interface WishlistItem {
    product_id: number;
    name: string;
    category: string;
    price: number;
    in_stock: boolean;
    image_url: string;
}

interface RecentlyViewedItem {
    product_id: number;
    name: string;
    category: string;
    price: number;
}

interface ActivityLog {
    action: string;
    timestamp: string;
}

interface PaymentMethod {
    type: string;
    last_used: string;
}

interface User {
    id: number;
    uuid: string;
    name: string;
    email: string;
    mobile_number: string;
    status: boolean;
    email_verified: string;
    role: string;
    profile_image: string;
    date_joined: string;
    last_login: string;
    account_status: string;
    total_orders: number;
    total_items_purchased: number;
    total_purchase_amount: number;
    preferred_payment_method?: string;
    shipping_address: Address;
    billing_address: Address;
    orders: Order[];
    wishlist: WishlistItem[];
    recently_viewed: RecentlyViewedItem[];
    activity_log: ActivityLog[];
    payment_methods: PaymentMethod[];
    notifications: {
        email_notifications: boolean;
        sms_notifications: boolean;
        push_notifications: boolean;
    };
}


const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered':
            return <CheckCircle className="h-4 w-4"/>;
        case 'cancelled':
            return <XCircle className="h-4 w-4"/>;
        default:
            return <Clock className="h-4 w-4"/>;
    }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
        case 'delivered':
            return "default";
        case 'cancelled':
            return "destructive";
        default:
            return "secondary";
    }
};

export default function UserDetailPage() {
    const {slug} = useParams();
    const uuid = slug as string;

    const isLoading = false;
    const isError = false;
    const error = null;
    const data = userDetailsData;

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <Skeleton className="h-24 w-24 rounded-full"/>
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-8 w-48"/>
                                    <Skeleton className="h-4 w-64"/>
                                    <Skeleton className="h-4 w-32"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32"/>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading User</CardTitle>
                        <CardDescription>
                            {"User not found"}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
                <p className="text-muted-foreground">No user data found</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarImage src={data.profile_image} alt={data.name}/>
                                <AvatarFallback>
                                    <UserIcon className="h-12 w-12"/>
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{data.name}</h1>
                                    <Badge variant={data.account_status === 'active' ? 'default' : 'secondary'}>
                                        {data.account_status}
                                    </Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4"/>
                                        <a href={`mailto:${data.email}`}
                                           className="hover:text-primary transition-colors">
                                            {data.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4"/>
                                        <a href={`tel:${data.mobile_number}`}
                                           className="hover:text-primary transition-colors">
                                            {data.mobile_number}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                    <span>Joined: {formatDate(data.date_joined)}</span>
                                    <span>Last login: {formatDate(data.last_login)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Orders</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{data.total_orders}</p>
                                </div>
                                <Package className="h-10 w-10 text-blue-600 dark:text-blue-400"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Items
                                        Purchased</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{data.total_items_purchased}</p>
                                </div>
                                <ShoppingBag className="h-10 w-10 text-green-600 dark:text-green-400"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 sm:col-span-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total
                                        Spent</p>
                                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                                        {formatCurrency(data.total_purchase_amount)}
                                    </p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-purple-600 dark:text-purple-400"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5"/>
                                    Recent Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.orders.length > 0 ? (
                                    data.orders.map((order) => (
                                        <Card key={order.order_id}
                                              className="overflow-hidden transition-all hover:shadow-md">
                                            <CardContent className="p-4">
                                                <div
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                    <h3 className="font-semibold text-lg">{order.order_id}</h3>
                                                    <Badge variant={getStatusVariant(order.status)} className="w-fit">
                                                        <span className="flex items-center gap-1">
                                                            {getStatusIcon(order.status)}
                                                            {order.status}
                                                        </span>
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Date</p>
                                                        <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Items</p>
                                                        <p className="font-medium">{order.items_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Amount</p>
                                                        <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Payment</p>
                                                        <p className="font-medium">{order.payment_method}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">No orders found</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5"/>
                                    Wishlist ({data.wishlist?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {data.wishlist?.map((item) => (
                                        <Card key={item.product_id}
                                              className="overflow-hidden transition-all hover:shadow-md">
                                            <CardContent className="p-4">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-40 object-cover rounded-md mb-3"
                                                />
                                                <h3 className="font-semibold mb-1 line-clamp-2">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                                                    <Badge variant={item.in_stock ? 'default' : 'destructive'}>
                                                        {item.in_stock ? 'In Stock' : 'Out of Stock'}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5"/>
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <address className="not-italic text-sm space-y-1 text-muted-foreground">
                                    <p className="font-semibold text-foreground text-base">{data.shipping_address.full_name}</p>
                                    <p>{data.shipping_address.address_line_1}</p>
                                    <p>{data.shipping_address.address_line_2}</p>
                                    <p>{data.shipping_address.city}, {data.shipping_address.state}</p>
                                    <p>{data.shipping_address.country} - {data.shipping_address.postal_code}</p>
                                    <Separator className="my-2"/>
                                    <a href={`tel:${data.shipping_address.phone}`}
                                       className="text-primary hover:underline inline-block mt-2">
                                        {data.shipping_address.phone}
                                    </a>
                                </address>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </div>
        </div>
    );
}