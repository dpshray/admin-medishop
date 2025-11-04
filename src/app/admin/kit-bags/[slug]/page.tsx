'use client'

import { useParams } from "next/navigation"
import { Calendar, Package, ShoppingBag, TrendingDown } from "lucide-react"
import { FormatCurrency } from "@/lib/helper"
import KitBagItem from "@/components/kit-bag/kitbag-item-card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import kitBagService from "@/service/kit-bag.service"

interface KitbagItemVariant {
    name: string
    size_value: number
    size_unit: string
    price: number
    previous_price: number | null
}

interface KitbagItem {
    product_name: string
    image: string
    quantity: number
    variant: KitbagItemVariant
}

interface Kitbag {
    created_at: string
    no_of_kitbag_items: number | null
    items: KitbagItem[]
}

export default function KitBagDetails() {
    const { slug } = useParams()

    const { data } = useQuery<Kitbag>({
        queryKey: ["kitbag", slug],
        queryFn: async () => {
            const res = await kitBagService.getKitBag(slug as string)
            return res?.data
        },
        enabled: !!slug,
    })

    const calculateTotal = () =>
        data?.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0) ?? 0

    const calculateSavings = () =>
        data?.items.reduce(
            (sum, item) =>
                sum + ((item.variant.previous_price ? item.variant.previous_price - item.variant.price : 0) * item.quantity),
            0
        ) ?? 0

    const totalItems = data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
    const totalSavings = calculateSavings()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <header className="relative bg-gradient-to-r from-primaryColor/50 via-primaryColor/60 to-primaryColor text-white py-8 px-4 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <ShoppingBag className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">My KitBag</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-semibold">
                            <Calendar className="w-4 h-4 mr-2" />
                            {data?.created_at}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-semibold">
                            <Package className="w-4 h-4 mr-2" />
                            {totalItems} {totalItems === 1 ? "Item" : "Items"}
                        </Badge>
                        {totalSavings > 0 && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg">
                                <TrendingDown className="w-4 h-4 mr-2" />
                                Saved {FormatCurrency(totalSavings)}
                            </Badge>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Items</h2>
                            <Badge variant="outline" className="text-base font-bold">
                                {data?.items.length ?? 0} Product{(data?.items.length ?? 0) !== 1 ? "s" : ""}
                            </Badge>
                        </div>
                        {data?.items.map((item, index) => (
                            <KitBagItem
                                key={index}
                                item={{
                                    product_name: item.product_name,
                                    image: item.image,
                                    quantity: item.quantity,
                                    variant: item.variant,
                                }}
                            />
                        ))}
                    </div>

                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 md:p-8 sticky top-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Summary</h2>
                                <div className="w-12 h-12 rounded-full bg-primaryColor/10 flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-primaryColor" />
                                </div>
                            </div>

                            <Separator className="bg-gray-200" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-semibold">Subtotal</span>
                                    <span className="text-xl font-bold text-gray-900">{FormatCurrency(calculateTotal())}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-semibold">Items</span>
                                    <Badge variant="secondary" className="font-bold">{totalItems}</Badge>
                                </div>

                                {totalSavings > 0 && (
                                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <span className="text-green-700 font-bold flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      You Save
                    </span>
                                        <span className="text-xl font-black text-green-600">{FormatCurrency(totalSavings)}</span>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-gray-200" />

                            <div className="flex justify-between items-center bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 p-5 rounded-xl">
                                <span className="text-xl font-black text-gray-900">Total</span>
                                <span className="text-2xl font-black text-primaryColor">{FormatCurrency(calculateTotal())}</span>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-gray-500 text-center font-medium bg-gray-50 p-3 rounded-lg">
                                    Free shipping on orders above NPR 2,000
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
