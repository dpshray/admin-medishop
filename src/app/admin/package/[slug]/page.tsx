'use client'

import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import packageService from "@/service/package.service"
import { useParams } from "next/navigation"
import { AlertTriangle, Loader2, Plus, Save, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts } from "@/hooks/useProduct"
import SearchSelectField from "@/components/field/search-select"
import TextInputField from "@/components/field/text-input"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import PackageDetailsCard from "@/components/package/package-details-card"
import AddProductToPackageSkeleton from "@/app/admin/package/[slug]/loading";

interface Product {
    id: number
    quantity: number
    variant_id: number
    variant_name: string
    product_name: string
    brand: string
    categories: string[]
}

interface PackageDetail {
    id: number
    name: string
    description: string
    price: number
    discount_percent: number
    status: boolean
    featured_image: string
    gallery_images: string[]
    products: Product[]
}

interface Variation {
    id: number
    name: string
    size_value: number
    size_unit: string
    platform_price: number
}

interface ProductWithVariations {
    uuid: string
    name: string
    brand: string
    variations: Variation[]
}

const productToAddSchema = z.object({
    products: z.array(
        z.object({
            product_uuid: z.string().min(1, "Product is required"),
            product_variation_id: z.number().positive("Variation is required"),
            quantity: z.number().min(1, "Quantity must be at least 1"),
        })
    ).min(1, "At least one product must be added"),
})

type ProductToAddForm = z.infer<typeof productToAddSchema>

export default function AddProductToPackage() {
    const params = useParams()
    const slug = params.slug as string

    const {
        control,
        handleSubmit,
        register,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ProductToAddForm>({
        resolver: zodResolver(productToAddSchema),
        defaultValues: { products: [{ product_uuid: "", product_variation_id: 0, quantity: 1 }] }
    })

    const { fields, append, remove } = useFieldArray({ control, name: "products" })

    const { data, isLoading, error, refetch } = useQuery<PackageDetail>({
        queryKey: ["package", slug],
        queryFn: () => packageService.getPackageDetail(slug),
        enabled: !!slug,
    })

    const { products } = useProducts()

    const productsOptions = useMemo(
        () => products.map(product => ({
            value: product.uuid,
            label: `${product.name} • ${product.brand}`,
        })),
        [products]
    )

    const addProductRow = useCallback(() => {
        append({ product_uuid: "", product_variation_id: 0, quantity: 1 })
    }, [append])

    const removeProductRow = useCallback((index: number) => {
        if (fields.length > 1) remove(index)
    }, [fields.length, remove])

    const handleProductSubmit = async (data: ProductToAddForm) => {
        try {
            await packageService.addProductToPackage(slug, data)
            toast.success("Products added successfully", {
                description: `${data.products.length} product${data.products.length > 1 ? "s" : ""} added.`,
            })
            reset()
            await refetch()
        } catch (error: any) {
            toast.error("Failed to add products", {
                description: error?.message || "An error occurred.",
            })
        }
    }

    const getSelectedProduct = useCallback(
        (uuid: string): ProductWithVariations | undefined =>
            products.find(p => p.uuid === uuid),
        [products]
    )

    const resetForm = useCallback(() => {
        reset()
        toast.info("Form reset", { description: "All fields cleared." })
    }, [reset])

    const handleDeleteProduct = useCallback(async (productVariationId: number) => {
        if (!slug) return
        try {
            await packageService.deleteProductFromPackage(slug, productVariationId).then(() => {
                toast.success("Product removed successfully")
            })
            await refetch()
        } catch (error: any) {
            toast.error(error?.message || "Failed to remove product")
        }
    }, [slug, refetch])

    if (isLoading) {
        return (
            <AddProductToPackageSkeleton/>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertDescription>Error loading package details. Please try again.</AlertDescription>
                </Alert>
            </div>
        )
    }

    const validProductCount = fields.filter((_, index) => {
        const productUuid = watch(`products.${index}.product_uuid`)
        const variationId = watch(`products.${index}.product_variation_id`)
        return productUuid && variationId > 0
    }).length

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            {data && (
                <PackageDetailsCard
                    name={data.name}
                    description={data.description}
                    price={data.price}
                    discount_percent={data.discount_percent}
                    status={data.status}
                    featured_image={data.featured_image}
                    gallery_images={data.gallery_images}
                    products={data.products}
                    onDeleteAction={handleDeleteProduct}
                />
            )}

            <Card className="overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 py-0">
                <form onSubmit={handleSubmit(handleProductSubmit)} noValidate>
                    <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50/80 to-background p-6 border-b">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4a358e] to-[#6b4db8] text-white shadow-lg sm:h-16 sm:w-16 ring-4 ring-purple-100">
                                <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-bold sm:text-3xl text-gray-900">Add New Products</CardTitle>
                                <CardDescription className="text-sm sm:text-base text-gray-600">
                                    Select products, variations, and quantities to add to this package.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                        <div className="space-y-5">
                            {fields.map((field, index) => {
                                const productUuid = watch(`products.${index}.product_uuid`)
                                const variationId = watch(`products.${index}.product_variation_id`)
                                const selectedProduct = getSelectedProduct(productUuid)
                                const selectedVariation = selectedProduct?.variations.find(v => v.id === variationId)
                                const variationOptions = selectedProduct?.variations.map(v => ({
                                    value: v.id,
                                    label: `${v.name} - ${v.size_value} ${v.size_unit} (Rs. ${v.platform_price})`,
                                })) || []

                                return (
                                    <Card key={field.id} className="border-2 hover:shadow-lg hover:border-purple-200 transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex flex-col gap-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4a358e] to-[#6b4db8] text-sm font-bold text-white shadow-md sm:h-11 sm:w-11">
                                                        {index + 1}
                                                    </div>

                                                    <div className="grid flex-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                                        <div className="space-y-2">
                                                            <SearchSelectField
                                                                options={productsOptions}
                                                                value={productUuid}
                                                                onChange={(val) => {
                                                                    setValue(`products.${index}.product_uuid`, val as string)
                                                                    setValue(`products.${index}.product_variation_id`, 0)
                                                                }}
                                                                placeholder="Search products..."
                                                                label="Select Product"
                                                                required
                                                            />
                                                            {errors.products?.[index]?.product_uuid && (
                                                                <p className="text-xs font-semibold text-destructive">
                                                                    {errors.products[index].product_uuid?.message}
                                                                </p>
                                                            )}
                                                            {selectedProduct && (
                                                                <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
                                                                    {selectedProduct.brand}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <SearchSelectField
                                                                options={variationOptions}
                                                                value={variationId}
                                                                onChange={(val) =>
                                                                    setValue(`products.${index}.product_variation_id`, Number(val))
                                                                }
                                                                placeholder="Search variations..."
                                                                label="Select Variation"
                                                                disabled={!selectedProduct}
                                                                required
                                                            />
                                                            {errors.products?.[index]?.product_variation_id && (
                                                                <p className="text-xs font-semibold text-destructive">
                                                                    {errors.products[index].product_variation_id?.message}
                                                                </p>
                                                            )}
                                                            {selectedVariation && (
                                                                <Badge variant="outline" className="text-xs font-semibold border-green-300 bg-green-50 text-green-700">
                                                                    Rs. {selectedVariation.platform_price.toLocaleString()}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <TextInputField
                                                                type="number"
                                                                min="1"
                                                                {...register(`products.${index}.quantity`, { valueAsNumber: true })}
                                                                placeholder="Enter quantity"
                                                                label="Quantity"
                                                                required
                                                                error={errors.products?.[index]?.quantity?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {fields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeProductRow(index)}
                                                            className="h-10 w-10 rounded-full text-destructive hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addProductRow}
                            className="w-full border-2 border-[#4a358e] text-sm font-bold text-[#4a358e] hover:bg-purple-50"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Another Product
                        </Button>

                        <Separator className="my-6" />

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto border-2 hover:bg-gray-50"
                                size="lg"
                            >
                                Reset Form
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || validProductCount === 0}
                                className="w-full bg-gradient-to-r from-[#4a358e] to-[#6b4db8] text-white shadow-lg hover:shadow-xl disabled:opacity-50 sm:w-auto"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Adding Products...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Add to Package ({validProductCount})
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
