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
import PackageDetailsCard from "@/components/package/package-details-card";


interface Product {
    id: number
    quantity: number
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
        defaultValues: {
            products: [{ product_uuid: "", product_variation_id: 0, quantity: 1 }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products"
    })

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
        if (fields.length > 1) {
            remove(index)
        }
    }, [fields.length, remove])

    const handleProductSubmit = async (data: ProductToAddForm) => {
        try {
            await packageService.addProductToPackage(slug, data)
            toast.success("Products added successfully!", {
                description: `${data.products.length} product${data.products.length > 1 ? 's' : ''} added to the package.`,
            })
            reset()
            refetch()
        } catch (error: any) {
            toast.error("Failed to add products", {
                description: error?.message || "An error occurred while adding products to the package.",
            })
        }
    }

    const getSelectedProduct = useCallback((uuid: string): ProductWithVariations | undefined => {
        return products.find(p => p.uuid === uuid)
    }, [products])

    const resetForm = useCallback(() => {
        reset()
        toast.info("Form reset", {
            description: "All fields have been cleared.",
        })
    }, [reset])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4a358e]" />
                    <p className="text-sm font-medium text-muted-foreground">Loading package details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4" role="alert">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertDescription className="font-medium">
                        Error loading package details. Please try again.
                    </AlertDescription>
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
                />
            )}

            <Card className="overflow-hidden border-border shadow-sm py-0 pb-4">
                <form onSubmit={handleSubmit(handleProductSubmit)} noValidate aria-label="Add products to package form">
                    <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50/80 to-background p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4a358e] text-white shadow-md sm:h-14 sm:w-14"
                                aria-hidden="true"
                            >
                                <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold sm:text-2xl">Add New Products</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Select products, variations and quantities to add to this package
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6 sm:space-y-6 sm:pt-8">
                        <div className="space-y-3 sm:space-y-4" role="list" aria-label="Products to add">
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
                                    <Card key={field.id} className="border-2 border-border transition-shadow hover:shadow-md" role="listitem">
                                        <CardContent className="p-4 sm:p-5 lg:p-6">
                                            <div className="flex flex-col gap-4 sm:gap-5">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a358e] text-sm font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-base"
                                                        aria-label={`Product ${index + 1}`}
                                                    >
                                                        {index + 1}
                                                    </div>

                                                    <div className="grid flex-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                                                        <div className="space-y-2">
                                                            <SearchSelectField
                                                                options={productsOptions}
                                                                value={productsOptions.find(option => option.value === productUuid) || null}
                                                                onChangeAction={(val) => {
                                                                    setValue(`products.${index}.product_uuid`, val as string)
                                                                    setValue(`products.${index}.product_variation_id`, 0)
                                                                }}
                                                                placeholder="Search products..."
                                                                label="Select Product"
                                                                required
                                                            />
                                                            {errors.products?.[index]?.product_uuid && (
                                                                <p className="text-xs font-medium text-destructive">
                                                                    {errors.products[index].product_uuid?.message}
                                                                </p>
                                                            )}
                                                            {selectedProduct && (
                                                                <Badge variant="secondary" className="text-xs font-medium">
                                                                    {selectedProduct.brand}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <SearchSelectField
                                                                options={variationOptions}
                                                                value={
                                                                    selectedVariation
                                                                        ? {
                                                                            value: variationId,
                                                                            label: `${selectedVariation.name} - ${selectedVariation.size_value} ${selectedVariation.size_unit}`,
                                                                        }
                                                                        : null
                                                                }
                                                                onChangeAction={(val) => setValue(`products.${index}.product_variation_id`, parseInt(val.toString()))}
                                                                placeholder="Search variations..."
                                                                label="Select Variation"
                                                                disabled={!selectedProduct}
                                                                required
                                                            />
                                                            {errors.products?.[index]?.product_variation_id && (
                                                                <p className="text-xs font-medium text-destructive">
                                                                    {errors.products[index].product_variation_id?.message}
                                                                </p>
                                                            )}
                                                            {selectedVariation && (
                                                                <Badge variant="outline" className="text-xs font-medium">
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
                                                            className="h-9 w-9 shrink-0 rounded-full border-2 border-transparent text-destructive transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive sm:h-10 sm:w-10"
                                                            aria-label={`Remove product ${index + 1}`}
                                                        >
                                                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addProductRow}
                                className="w-full border-[#4a358e] text-sm font-semibold text-[#4a358e] transition-colors hover:bg-purple-50 sm:text-base"
                                aria-label="Add another product row"
                            >
                                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                Add Another Product
                            </Button>
                        </div>

                        <Separator className="my-4 sm:my-6" />

                        <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end sm:pb-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                                size="lg"
                            >
                                Reset Form
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || validProductCount === 0}
                                className="w-full bg-[#4a358e] text-white shadow-lg transition-shadow hover:bg-[#3d2d75] hover:shadow-xl sm:w-auto"
                                size="lg"
                                aria-label={`Add ${validProductCount} product${validProductCount !== 1 ? 's' : ''} to package`}
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