'use client'

import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Activity,
    AlertCircle,
    Archive,
    BarChart3,
    Building2,
    CheckCircle,
    Clock,
    Copy,
    DollarSign,
    Edit,
    Eye,
    Globe,
    MoreVertical,
    Package,
    Settings,
    Share2,
    Shield,
    Star,
    Tag,
    Trash2,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react'
import productService from '@/service/product.service'
import { ErrorFallback } from '@/components/Error/error-fallback'
import ImageGallery from '@/components/product/image-gallery'

export interface Brand {
    id: number
    name: string
}

export interface Category {
    id: number
    name: string
}

export interface ProductTag {
    id: number
    name: string
}

export interface ProductVariation {
    variation_id: number
    name: string
    size_value: number
    size_unit: string
    admin_price: number
    status?: string
    stock_quantity?: number
}

export interface ProductImage {
    id: number
    url: string
}

export interface ProductData {
    id: number
    name: string
    slug: string
    brand: Brand
    description: string
    added_date: string
    no_of_vendors: number
    categories: Category[]
    tags: ProductTag[]
    variations: ProductVariation[]
    featured_image: ProductImage
    gallery_images: ProductImage[]
    status: string
    rating?: number
    revenue?: number
    total_sales?: number
    conversion_rate?: number
    views?: number
}

interface AdminProductDetailsProps {
    slug: string
}

interface StatusConfig {
    icon: React.ElementType
    className: string
    dot: string
}

interface StatusConfigMap {
    active: StatusConfig
    inactive: StatusConfig
    draft: StatusConfig
    out_of_stock: StatusConfig
}

interface MetricCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    trend?: { value: number; isPositive: boolean }
    description?: string
}

interface ActionButtonProps {
    icon: React.ElementType
    label: string
    variant?: 'primary' | 'secondary' | 'danger'
    onClick?: () => void
}

interface StatusBadgeProps {
    status: string
}

const AdminProductDetailsSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Skeleton className="aspect-square w-full rounded-xl" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                            <Skeleton className="h-5 w-32 mb-4" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfigMap: StatusConfigMap = {
        active: {
            icon: CheckCircle,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
            dot: 'bg-emerald-500'
        },
        inactive: {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            dot: 'bg-amber-500'
        },
        draft: {
            icon: AlertCircle,
            className: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
            dot: 'bg-slate-500'
        },
        out_of_stock: {
            icon: AlertCircle,
            className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
            dot: 'bg-red-500'
        }
    }

    const config = statusConfigMap[status as keyof StatusConfigMap] || statusConfigMap.draft

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${config.className}`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        </div>
    )
}

const MetricCard = ({ title, value, icon: Icon, trend, description }: MetricCardProps) => (
    <div className="group bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{title}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
                {description && (
                    <p className="text-xs text-slate-500">{description}</p>
                )}
            </div>
        </div>
        {trend && (
            <div className="flex items-center gap-1 mt-4 pt-4 border-t border-slate-100">
                {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-slate-500 ml-1">vs last month</span>
            </div>
        )}
    </div>
)

const PriceDisplay = ({ price }: { price: number }) => (
    <span className="font-semibold text-lg text-slate-900">₹{price.toLocaleString('en-IN')}</span>
)

const ActionButton = ({ icon: Icon, label, variant = 'secondary', onClick }: ActionButtonProps) => {
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm',
        danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
    }

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${variantStyles[variant]}`}
            aria-label={label}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
        </button>
    )
}

const AdminProductInfo = ({ product }: { product: ProductData }) => (
    <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Package className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Product Overview</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={product.status} />
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Globe className="h-3 w-3" aria-hidden="true" />
                                <span>Live since {new Date(product.added_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="More options"
                    >
                        <MoreVertical className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                            <Image
                                src={product.featured_image.url}
                                alt={`${product.name} - Featured image`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                priority
                                sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                                    aria-label="View image"
                                >
                                    <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
                                </button>
                                <button
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                                    aria-label="Share product"
                                >
                                    <Share2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        {product.gallery_images.length > 0 && (
                            <Suspense fallback={<Skeleton className="h-20 w-full rounded-lg" />}>
                                <ImageGallery images={product.gallery_images} />
                            </Suspense>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                <Building2 className="h-4 w-4" aria-hidden="true" />
                                <span className="font-medium">{product.brand.name}</span>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 mb-3">{product.name}</h1>

                            <div className="flex items-center gap-2 mb-4">
                                <code className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">
                                    /{product.slug}
                                </code>
                                <button
                                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                                    aria-label="Copy slug"
                                >
                                    <Copy className="h-3 w-3 text-slate-500" aria-hidden="true" />
                                </button>
                            </div>

                            <div
                                className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vendors</div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                    <span className="font-semibold text-slate-900">{product.no_of_vendors}</span>
                                    <span className="text-sm text-slate-500">active</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-500 fill-current" aria-hidden="true" />
                                    <span className="font-semibold text-slate-900">{product.rating || 4.5}</span>
                                    <span className="text-sm text-slate-500">(128 reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
            <Tabs defaultValue="variations" className="w-full">
                <div className="border-b border-slate-100 px-6 pt-6">
                    <TabsList className="h-10 p-1 bg-slate-100 rounded-xl">
                        <TabsTrigger
                            value="variations"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            Pricing & Stock
                        </TabsTrigger>
                        <TabsTrigger
                            value="taxonomy"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            Categories
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="variations" className="p-6 space-y-4">
                    <div className="space-y-3">
                        {product.variations.map((variation) => (
                            <div
                                key={variation.variation_id}
                                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="font-semibold text-slate-900">
                                            {variation.size_value}{variation.size_unit}
                                        </span>
                                    </div>
                                    {variation.status && <StatusBadge status={variation.status} />}
                                </div>
                                <div className="flex items-center gap-6">
                                    {variation.stock_quantity && (
                                        <div className="text-right">
                                            <div className="text-sm text-slate-500">Stock</div>
                                            <div className="font-medium text-slate-900">{variation.stock_quantity}</div>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Price</div>
                                        <PriceDisplay price={variation.admin_price} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="taxonomy" className="p-6 space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                                >
                                    <Tag className="h-3 w-3" aria-hidden="true" />
                                    {category.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
                                >
                                    {tag.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
)

const AdminSidebar = ({ product }: { product: ProductData }) => (
    <aside className="space-y-6">
        <div className="grid gap-4">
            <MetricCard
                title="Total Revenue"
                value={`₹${(product.revenue || 245680).toLocaleString('en-IN')}`}
                icon={DollarSign}
                trend={{ value: 12.5, isPositive: true }}
                description="This month"
            />
            <MetricCard
                title="Units Sold"
                value={product.total_sales || 1284}
                icon={BarChart3}
                trend={{ value: 8.2, isPositive: true }}
                description="This month"
            />
            <MetricCard
                title="Conversion Rate"
                value={`${product.conversion_rate || 3.2}%`}
                icon={Zap}
                trend={{ value: 2.1, isPositive: true }}
                description="Last 30 days"
            />
            <MetricCard
                title="Page Views"
                value={(product.views || 12450).toLocaleString()}
                icon={Eye}
                trend={{ value: 15.3, isPositive: true }}
                description="This month"
            />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-slate-100">
                    <Settings className="h-4 w-4 text-slate-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            </div>

            <div className="space-y-3">
                <ActionButton icon={Edit} label="Edit Product" variant="primary" />
                <ActionButton icon={Eye} label="Preview Live" variant="secondary" />
                <ActionButton icon={Activity} label="View Analytics" variant="secondary" />
                <ActionButton icon={Share2} label="Share Product" variant="secondary" />

                <div className="pt-3 border-t border-slate-100">
                    <ActionButton icon={Archive} label="Archive" variant="secondary" />
                    <div className="mt-2">
                        <ActionButton icon={Trash2} label="Delete Product" variant="danger" />
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100">
                    <Shield className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-slate-900">Product Health</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">SEO Score</span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
                            <div className="w-4/5 h-full bg-emerald-500 rounded-full" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">85%</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Content Quality</span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={78} aria-valuemin={0} aria-valuemax={100}>
                            <div className="w-3/4 h-full bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">78%</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Image Optimization</span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={95} aria-valuemin={0} aria-valuemax={100}>
                            <div className="w-full h-full bg-emerald-500 rounded-full" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">95%</span>
                    </div>
                </div>
            </div>
        </div>
    </aside>
)

const AdminProductDetails = ({ slug }: AdminProductDetailsProps) => {
    const { data, isPending, isError, refetch } = useQuery({
        queryKey: ['admin-product', slug],
        queryFn: async (): Promise<ProductData> => {
            const response = await productService.getSingleProduct(slug)
            if (!response?.data) throw new Error('Product not found')
            return response.data
        },
        staleTime: 300000,
        gcTime: 600000,
        retry: 2,
        refetchOnWindowFocus: false,
    })

    if (isPending) return <AdminProductDetailsSkeleton />

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <ErrorFallback
                    title="Failed to load product"
                    message="Unable to fetch product details. Please check your connection and try again."
                    primaryAction={{ label: 'Retry', onClick: () => refetch() }}
                    secondaryAction={{ label: 'Back to Products', onClick: () => window.history.back() }}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="container mx-auto px-6 py-8">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">{data.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Product ID: #{data.id}</span>
                            <span>•</span>
                            <span>Last updated 2 hours ago</span>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <ActionButton icon={Eye} label="Preview" variant="secondary" />
                        <ActionButton icon={Edit} label="Edit Product" variant="primary" />
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <AdminProductInfo product={data} />
                    </div>
                    <div className="lg:col-span-4">
                        <AdminSidebar product={data} />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminProductDetails