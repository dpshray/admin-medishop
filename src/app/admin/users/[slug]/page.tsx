'use client'

import {useParams} from "next/navigation"
import {Heart, Mail, Package, Phone, ShoppingBag, ShoppingCart, Star, TrendingUp} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {FormatCurrency, FormatDate, StatusBadge, StripHtml} from "@/lib/helper"
import {memo} from "react"
import Image from "next/image"
import {useQuery} from "@tanstack/react-query"
import userService from "@/service/user.service"
import {DashboardCard} from "@/components/dashboard/dashboard-card"
import {ORDER_STATUS, ORDER_TYPE, PAYMENT_STATUS} from "@/types/enum"
import LoadingSkeleton from "@/app/admin/vendors/view-vendor/[slug]/loading";

interface UserDetails {
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

interface Order {
    order_id: number
    order_code: string
    price: number
    payment_method: string
    payment_status: PAYMENT_STATUS | string
    order_address: string
    status: ORDER_STATUS | string
    created_at: string
    order_items_detail: OrderItemDetail[]
}

interface OrderItemDetail {
    item_type: ORDER_TYPE | string
    product_name: string | null
    variant_name: string | null
    quantity: number
    price: number
    total: number
    featured_image: string | null
    gallery_images: string | null
}

interface FavouriteItem {
    type: ORDER_TYPE | string
    id: number
    name: string
    slug: string
    description: string
    featured_image: string
}

interface WishlistItem {
    type: ORDER_TYPE | string
    id: number
    name: string
    slug: string
    description: string
    featured_image: string
}

interface CartItem {
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


const OrderCard = memo(({order}: { order: Order }) => (
    <div
        className="rounded-xl border bg-card p-4 sm:p-6 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">Order #{order.order_code}</h3>
                <p className="text-sm text-muted-foreground">{FormatDate(order.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <StatusBadge status={order.status}/>
                <StatusBadge status={order.payment_status}/>
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
                <p className="font-semibold text-base capitalize">{order.payment_method}</p>
            </div>
            <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Address</p>
                <p className="font-semibold text-base truncate" title={order.order_address}>
                    {order.order_address}
                </p>
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
                                        alt={item.product_name || "Product"}
                                        className="h-12 w-12 object-cover rounded-md flex-shrink-0"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.png"
                                        }}
                                        width={48}
                                        height={48}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {item.product_name || item.item_type}
                                        {item.variant_name && (
                                            <span className="text-muted-foreground"> - {item.variant_name}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Qty: {item.quantity} × {FormatCurrency(item.price)}
                                    </p>
                                </div>
                                <p className="font-semibold text-sm whitespace-nowrap">{FormatCurrency(item.total)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
))
OrderCard.displayName = "OrderCard"

const WishlistCard = memo(({item}: { item: WishlistItem }) => (
    <div
        className="rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-700 group">
        <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
                src={item.featured_image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.src = "/placeholder.png"
                }}
                width={300}
                height={300}
            />
            <Badge className="absolute top-2 right-2 bg-purple-600 text-white border-0 capitalize">
                {item.type.toLowerCase()}
            </Badge>
        </div>
        <div className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]" title={item.name}>
                {item.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{StripHtml(item.description)}</p>
        </div>
    </div>
))
WishlistCard.displayName = "WishlistCard"

const FavouriteCard = memo(({item}: { item: FavouriteItem }) => (
    <div
        className="rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-700 group">
        <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
                src={item.featured_image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.src = "/placeholder.png"
                }}
                width={300}
                height={300}
            />
            <div className="absolute top-2 right-2 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-lg">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-label="Favourite"/>
            </div>
        </div>
        <div className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]" title={item.name}>
                {item.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{StripHtml(item.description)}</p>
        </div>
    </div>
))
FavouriteCard.displayName = "FavouriteCard"

const CartItemCard = memo(({item}: { item: CartItem }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all">
        <Image
            src={item.image}
            alt={item.item_name}
            className="h-20 w-20 object-cover rounded-md flex-shrink-0"
            loading="lazy"
            onError={(e) => {
                e.currentTarget.src = "/placeholder.png"
            }}
            width={80}
            height={80}
        />
        <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate" title={item.item_name}>
                {item.item_name}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
                {item.brand_name} - {item.variant_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                <Separator orientation="vertical" className="h-4"/>
                <span className="text-sm font-medium">{FormatCurrency(item.price)}</span>
            </div>
        </div>
        <p className="font-bold text-lg whitespace-nowrap">{FormatCurrency(item.subtotal)}</p>
    </div>
))
CartItemCard.displayName = "CartItemCard"

const EmptyState = memo(({icon: Icon, message}: { icon: typeof Package; message: string }) => (
    <div className="text-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true"/>
        <p className="text-muted-foreground">{message}</p>
    </div>
))
EmptyState.displayName = "EmptyState"

export default function UserDetailPage() {
    const {slug} = useParams()
    const uuid = slug as string

    const {data, isLoading, isError} = useQuery<UserDetails>({
        queryKey: ["user", uuid],
        queryFn: async () => userService.getUserById(uuid).then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    })

    if (isLoading) return <LoadingSkeleton/>

    if (isError)
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4">
                <div className="w-full max-w-md border border-destructive rounded-xl bg-card p-6">
                    <h2 className="text-xl font-bold text-destructive mb-2">Error Loading User</h2>
                    <p className="text-sm text-muted-foreground">Unable to load user data. Please try again.</p>
                </div>
            </div>
        )

    if (!data)
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4">
                <p className="text-muted-foreground">No user data found</p>
            </div>
        )

    const totalOrders = data.orders?.length || 0
    const totalItems = data.orders?.reduce((sum, order) => sum + order.order_items_detail.length, 0) || 0
    const totalSpent = data.orders?.reduce((sum, order) => sum + order.price, 0) || 0
    const cartTotal = data.User_cart?.reduce((sum, item) => sum + item.subtotal, 0) || 0

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div
                    className="rounded-xl border border-purple-200 dark:border-purple-800 bg-card p-6 sm:p-8 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <Avatar
                            className="h-24 w-24 border-4 border-purple-200 dark:border-purple-800 shadow-xl ring-4 ring-purple-100 dark:ring-purple-900 flex-shrink-0">
                            <AvatarImage src="" alt={data.name}/>
                            <AvatarFallback
                                className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-2xl">
                                {data.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3 w-full min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent truncate">
                                    {data.name}
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={data.status ? "default" : "secondary"} className="bg-purple-600">
                                        {data.status ? "Active" : "Inactive"}
                                    </Badge>
                                    <StatusBadge status={data.email_verified}/>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                                <a
                                    href={`mailto:${data.email}`}
                                    className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-w-0"
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
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard
                        title="Total Orders"
                        value={totalOrders.toString()}
                        icon={Package}
                        color="text-blue-600"
                        bgColor="bg-blue-50 dark:bg-blue-950"
                        index={0}
                    />
                    <DashboardCard
                        title="Items Purchased"
                        value={totalItems.toString()}
                        icon={ShoppingBag}
                        color="text-green-600"
                        bgColor="bg-green-50 dark:bg-green-950"
                        index={1}
                    />
                    <DashboardCard
                        title="Cart Items"
                        value={(data.User_cart?.length || 0).toString()}
                        icon={ShoppingCart}
                        color="text-orange-600"
                        bgColor="bg-orange-50 dark:bg-orange-950"
                        index={2}
                    />
                    <DashboardCard
                        title="Total Spent"
                        value={FormatCurrency(totalSpent)}
                        icon={TrendingUp}
                        color="text-purple-600"
                        bgColor="bg-purple-50 dark:bg-purple-950"
                        index={3}
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div
                            className="rounded-xl border border-purple-200 dark:border-purple-800 bg-card overflow-hidden">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Recent Orders ({totalOrders})
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {data.orders && data.orders.length > 0 ? (
                                    data.orders.map((order) => <OrderCard key={order.order_id} order={order}/>)
                                ) : (
                                    <EmptyState icon={Package} message="No orders found"/>
                                )}
                            </div>
                        </div>

                        <div
                            className="rounded-xl border border-purple-200 dark:border-purple-800 bg-card overflow-hidden">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Wishlist ({data.user_wishlist?.length || 0})
                                </h2>
                            </div>
                            <div className="p-6">
                                {data.user_wishlist && data.user_wishlist.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {data.user_wishlist.map((item) => (
                                            <WishlistCard key={item.id} item={item}/>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={Heart} message="No wishlist items"/>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div
                            className="rounded-xl border border-purple-200 dark:border-purple-800 bg-card overflow-hidden">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Shopping Cart ({data.User_cart?.length || 0})
                                </h2>
                            </div>
                            <div className="p-6">
                                {data.User_cart && data.User_cart.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.User_cart.map((item) => (
                                            <CartItemCard key={item.cart_id} item={item}/>
                                        ))}
                                        <Separator/>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="font-semibold">Total:</span>
                                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {FormatCurrency(cartTotal)}
                      </span>
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState icon={ShoppingCart} message="Cart is empty"/>
                                )}
                            </div>
                        </div>

                        <div
                            className="rounded-xl border border-purple-200 dark:border-purple-800 bg-card overflow-hidden">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Star className="h-5 w-5 text-purple-600" aria-hidden="true"/>
                                    Favourites ({data.user_favourite?.length || 0})
                                </h2>
                            </div>
                            <div className="p-6">
                                {data.user_favourite && data.user_favourite.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {data.user_favourite.map((item) => (
                                            <FavouriteCard key={item.id} item={item}/>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={Star} message="No favourite items"/>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
