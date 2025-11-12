'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Edit, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import productService from '@/service/product/product.service'
import { ErrorFallback } from '@/components/Error/error-fallback'
import AdminProductDetailsSkeleton from '@/app/admin/products/view-product/[slug]/loading'
import ProductActionButton from '@/components/product/product-action-button'
import { AdminProductInfo, AdminProductSidebar } from '@/components/product/product-details-info'

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
    units_in_stock?: number
    stock_quantity?: number
    status?: string
}

export interface ProductImage {
    id: number
    url: string
}

export interface HealthCondition {
    name: string
}

export interface ProductAnalytics {
    status?: string
    rating?: number
    revenue?: number
    total_sales?: number
    conversion_rate?: number
    views?: number
}

export interface ProductData extends ProductAnalytics {
    id: number
    uuid: string
    name: string
    slug: string
    description: string
    added_date: string
    brand: Brand
    categories: Category[]
    tags: ProductTag[]
    variations: ProductVariation[]
    featured_image: ProductImage
    gallery_images: ProductImage[]
    health_conditions?: HealthCondition[]
    prescription_required?: boolean
    no_of_vendors: number
    total_units_in_stock: number
}

export interface AdminProductDetailsProps {
    slug: string
}


const AdminProductDetails: React.FC<AdminProductDetailsProps> = React.memo(({ slug }) => {
    const router = useRouter()

    const { data, isPending, isError, refetch } = useQuery({
        queryKey: ['admin-product', slug],
        queryFn: async (): Promise<ProductData> => {
            const response = await productService.getSingleProduct(slug)
            console.log('Response from Product Service:', response)
            if (!response?.data) throw new Error('Product not found')
            return response.data
        },
        staleTime: 300000,
        gcTime: 600000,
        retry: 2,
        refetchOnWindowFocus: false,
    })

    const handlePreview = React.useCallback(() => {
        window.open(`/products/${slug}`, '_blank')
    }, [slug])

    const handleEdit = React.useCallback(() => {
        if (data?.uuid) router.push(`/admin/products/edit-product/${data.uuid}`)
    }, [router, data?.uuid])

    const handleBack = React.useCallback(() => {
        router.back()
    }, [router])

    if (isPending) return <AdminProductDetailsSkeleton />

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
                <ErrorFallback
                    title="Failed to load product"
                    message="Unable to fetch product details. Please check your connection and try again."
                    primaryAction={{ label: 'Retry', onClick: refetch }}
                    secondaryAction={{ label: 'Back to Products', onClick: handleBack }}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 truncate">{data.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                            <span className="truncate">Product ID: #{data.uuid}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">Last updated 2 hours ago</span>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                        <ProductActionButton
                            icon={Eye}
                            label="Preview"
                            variant="secondary"
                            onClickAction={handlePreview}
                        />
                        <ProductActionButton
                            icon={Edit}
                            label="Edit Product"
                            variant="primary"
                            onClickAction={handleEdit}
                        />
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    <div className="lg:col-span-8">
                        <AdminProductInfo product={data} />
                    </div>
                    <div className="lg:col-span-4">
                        <AdminProductSidebar product={data} />
                    </div>
                </main>
            </div>
        </div>
    )
})

AdminProductDetails.displayName = 'AdminProductDetails'

export default AdminProductDetails
