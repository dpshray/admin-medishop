'use client'

import {useParams} from "next/navigation"
import {Heart, Mail, Package, Phone, ShoppingBag, ShoppingCart, Star, TrendingUp} from "lucide-react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Skeleton} from "@/components/ui/skeleton"
import {userDetailsData} from "@/data"
import {FormatCurrency, FormatDate, StatusBadge, StripHtml} from "@/lib/helper"
import {cn} from "@/lib/utils"
import {memo} from "react"
import Image from "next/image";

export interface UserDetails {
    id: number
    uuid: string
    name: string
    email: string
    mobile_number: string
    status: boolean
    email_verified: "Verified" | "Unverified" | string
    orders?: Order[]
    user_favourite?: FavouriteItem[]
    user_wishlist?: WishlistItem[]
    User_cart?: CartItem[]
}

export interface Order {
    order_id: number
    order_code: string
    price: number
    payment_method: string
    payment_status: "PAID" | "UNPAID" | string
    order_address: string
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DELIVERED" | string
    created_at: string
    order_items_detail: OrderItemDetail[]
}

export interface OrderItemDetail {
    item_type: "Product" | "Package" | string
    product_name: string | null
    variant_name: string | null
    quantity: number
    price: number
    total: number
    featured_image: string | null
    gallery_images: string | null
}

export interface FavouriteItem {
    type: "Product" | "Package" | string
    id: number
    name: string
    slug: string
    description: string
    featured_image: string
}

export interface WishlistItem {
    type: "Product" | "Package" | string
    id: number
    name: string
    slug: string
    description: string
    featured_image: string
}

export interface CartItem {
    cart_id: number
    item_name: string
    item_slug: string
    brand_name: string
    variant_name: string
    image: string
    quantity: number
    price: number
    subtotal: number
}


const LoadingSkeleton = memo(() => (
    <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
            <Card className="border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Skeleton className="h-24 w-24 rounded-full"/>
                        <div className="flex-1 space-y-3 w-full">
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
))

LoadingSkeleton.displayName = "LoadingSkeleton"

const StatsCard = memo(({title, value, icon: Icon, gradient}: {
    title: string
    value: string | number
    icon: typeof Package
    gradient: string
}) => (
    <Card className={cn("transition-all hover:shadow-lg hover:-translate-y-1 duration-300", gradient)}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium opacity-90">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <Icon className="h-10 w-10 opacity-80" aria-hidden="true"/>
            </div>
        </CardContent>
    </Card>
))

StatsCard.displayName = "StatsCard"

const OrderCard = memo(({order}: { order: Order }) => (
    <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 duration-300">
        <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Order #{order.order_code}</h3>
                    <p className="text-sm text-muted-foreground">{FormatDate(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.status}/>
                    <Badge variant={order.payment_status === 'PAID' ? 'default' : 'secondary'} className="capitalize">
                        {order.payment_status.toLowerCase()}
                    </Badge>
                </div>
            </div>

            <Separator className="my-4"/>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                    <p className="text-muted-foreground font-medium">Total Amount</p>
                    <p className="font-semibold text-base">{FormatCurrency(order.price)}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-muted-foreground font-medium">Items</p>
                    <p className="font-semibold text-base">{order.order_items_detail.length}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-muted-foreground font-medium">Payment Method</p>
                    <p className="font-semibold text-base">{order.payment_method}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-muted-foreground font-medium">Address</p>
                    <p className="font-semibold text-base truncate"
                       title={order.order_address}>{order.order_address}</p>
                </div>
            </div>

            {order.order_items_detail.length > 0 && (
                <>
                    <Separator className="my-4"/>
                    <div className="space-y-3">
                        <p className="font-medium text-sm">Order Items</p>
                        <div className="space-y-2">
                            {order.order_items_detail.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                    {item.featured_image && (
                                        <Image
                                            src={item.featured_image}
                                            alt={item.product_name || 'Product'}
                                            className="h-12 w-12 object-cover rounded-md"
                                            loading="lazy"
                                            onError={
                                                (e) => {
                                                    e.currentTarget.src = '/placeholder.png';
                                                }
                                            }
                                            width={200}
                                            height={200}
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                            {item.product_name || item.item_type}
                                            {item.variant_name &&
                                                <span className="text-muted-foreground"> - {item.variant_name}</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {FormatCurrency(item.price)}</p>
                                    </div>
                                    <p className="font-semibold text-sm">{FormatCurrency(item.total)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </CardContent>
    </Card>
))

OrderCard.displayName = "OrderCard"

const WishlistCard = memo(({item}: { item: WishlistItem }) => (
    <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-700 duration-300 group">
        <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
                src={item.featured_image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={
                    (e) => {
                        e.currentTarget.src = '/placeholder.png';
                    }
                }
                width={200}
                height={200}
            />
            <Badge className="absolute top-2 right-2 bg-purple-600 text-white border-0">
                {item.type}
            </Badge>
        </div>
        <CardContent className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]" title={item.name}>{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{StripHtml(item.description)}</p>
        </CardContent>
    </Card>
))

WishlistCard.displayName = "WishlistCard"

const FavouriteCard = memo(({item}: { item: FavouriteItem }) => (
    <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-700 duration-300 group">
        <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
                src={item.featured_image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={
                    (e) => {
                        e.currentTarget.src = '/placeholder.png';
                    }
                }
                width={200}
                height={200}
            />
            <div className="absolute top-2 right-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-label="Favourite"/>
            </div>
        </div>
        <CardContent className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]" title={item.name}>{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{StripHtml(item.description)}</p>
        </CardContent>
    </Card>
))

FavouriteCard.displayName = "FavouriteCard"

const CartItemCard = memo(({item}: { item: CartItem }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-300">
        <Image
            src={item.image}
            alt={item.item_name}
            className="h-20 w-20 object-cover rounded-md"
            loading="lazy"
            onError={
                (e) => {
                    e.currentTarget.src = '/placeholder.png';
                }
            }
            width={200}
            height={200}
        />
        <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate" title={item.item_name}>{item.item_name}</h4>
            <p className="text-sm text-muted-foreground">{item.brand_name} - {item.variant_name}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                <Separator orientation="vertical" className="h-4"/>
                <span className="text-sm font-medium">{FormatCurrency(item.price)}</span>
            </div>
        </div>
        <p className="font-bold text-lg">{FormatCurrency(item.subtotal)}</p>
    </div>
))

CartItemCard.displayName = "CartItemCard"

export default function UserDetailPage() {
    const {slug} = useParams()
    const uuid = slug as string

    const isLoading = false
    const isError = false
    const data = userDetailsData

    if (isLoading) {
        return <LoadingSkeleton/>
    }

    if (isError) {
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading User</CardTitle>
                        <p className="text-sm text-muted-foreground">User not found</p>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!data) {
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4">
                <p className="text-muted-foreground">No user data found</p>
            </div>
        )
    }

    const totalOrders = data.orders?.length || 0
    const totalItems = data.orders?.reduce((sum, order) => sum + order.order_items_detail.length, 0) || 0
    const totalSpent = data.orders?.reduce((sum, order) => sum + order.price, 0) || 0

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <Card className="overflow-hidden border-purple-200 dark:border-purple-800 shadow-lg">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <Avatar
                                className="h-24 w-24 border-4 border-purple-200 dark:border-purple-800 shadow-xl ring-4 ring-purple-100 dark:ring-purple-900">
                                <AvatarImage src="" alt={data.name}/>
                                <AvatarFallback
                                    className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-2xl">
                                    {data.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                                        {data.name}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={data.status ? 'default' : 'secondary'}
                                               className="bg-purple-600">
                                            {data.status ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge variant={data.email_verified === 'Verified' ? 'default' : 'secondary'}>
                                            {data.email_verified}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                                    <a
                                        href={`mailto:${data.email}`}
                                        className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        aria-label={`Email ${data.name}`}
                                    >
                                        <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true"/>
                                        <span className="truncate">{data.email}</span>
                                    </a>
                                    <a
                                        href={`tel:${data.mobile_number}`}
                                        className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        aria-label={`Call ${data.name}`}
                                    >
                                        <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true"/>
                                        <span>{data.mobile_number}</span>
                                    </a>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <span>User ID: {data.uuid}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Orders"
                        value={totalOrders}
                        icon={Package}
                        gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                    />
                    <StatsCard
                        title="Items Purchased"
                        value={totalItems}
                        icon={ShoppingBag}
                        gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
                    />
                    <StatsCard
                        title="Cart Items"
                        value={data.User_cart?.length || 0}
                        icon={ShoppingCart}
                        gradient="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100"
                    />
                    <StatsCard
                        title="Total Spent"
                        value={FormatCurrency(totalSpent)}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Recent Orders ({totalOrders})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.orders && data.orders.length > 0 ? (
                                    data.orders.map((order) => (
                                        <OrderCard key={order.order_id} order={order}/>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                                                 aria-hidden="true"/>
                                        <p className="text-muted-foreground">No orders found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Wishlist ({data.user_wishlist?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.user_wishlist && data.user_wishlist.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {data.user_wishlist.map((item) => (
                                            <WishlistCard key={item.id} item={item}/>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                                               aria-hidden="true"/>
                                        <p className="text-muted-foreground">No items in wishlist</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Favourites ({data.user_favourite?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.user_favourite && data.user_favourite.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {data.user_favourite.map((item) => (
                                            <FavouriteCard key={item.id} item={item}/>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                                              aria-hidden="true"/>
                                        <p className="text-muted-foreground">No favourite items</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Shopping Cart ({data.User_cart?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.User_cart && data.User_cart.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.User_cart.map((item) => (
                                            <CartItemCard key={item.cart_id} item={item}/>
                                        ))}
                                        <Separator/>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="font-semibold">Total:</span>
                                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {FormatCurrency(data.User_cart.reduce((sum, item) => sum + item.subtotal, 0))}
                      </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                                                      aria-hidden="true"/>
                                        <p className="text-muted-foreground">Cart is empty</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}