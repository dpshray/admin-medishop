"use client"

import {useCallback, useEffect, useMemo, useState} from "react"
import {useFieldArray, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Skeleton} from "@/components/ui/skeleton"
import SearchSelectField from "@/components/field/search-select"
import TextInputField from "@/components/field/text-input"
import vendorService from "@/service/vendor.service"
import {toast} from "sonner"
import {AlertTriangle, CheckCircle2, Package2, Plus, Save, Search, SquareMenu, TrendingUp, X} from "lucide-react"

const VendorProductSchema = z.object({
    product_uuid: z.string().min(1, "Please select a product"),
    variations: z.array(
        z.object({
            product_variation_id: z.number(),
            units_in_stock: z.number().min(0, "Size value must be non-negative"),
            price: z.number().min(0, "Price must be non-negative"),
        })
    ).min(1, "At least one variation is required"),
})

interface Variation {
    id: number
    name: string
    size_value?: number
    size_unit?: string
    platform_price?: number
}

interface Product {
    product_uuid: string
    product_name: string
    brand: string
    variations: Variation[]
}

type VendorProductForm = z.infer<typeof VendorProductSchema>

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-64"/>
            <Skeleton className="h-4 w-96"/>
        </div>
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <Skeleton className="h-6 w-48"/>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
            </CardContent>
        </Card>
    </div>
)

const ProductVariantUpdateForm = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [availableVariations, setAvailableVariations] = useState<Variation[]>([])
    const [selectedProductName, setSelectedProductName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [addedVariations, setAddedVariations] = useState<Set<number>>(new Set())

    const {
        register,
        control,
        setValue,
        watch,
        handleSubmit,
        reset,
        formState: {errors, isValid, isDirty},
    } = useForm<VendorProductForm>({
        resolver: zodResolver(VendorProductSchema),
        defaultValues: {
            product_uuid: "",
            variations: [],
        },
        mode: "onChange",
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: "variations",
    })

    const watchProductId = watch("product_uuid")

    const selectedProduct = useMemo(
        () => products.find(p => p.product_uuid === watchProductId),
        [products, watchProductId]
    )

    const productsOptions = useMemo(
        () => products.map(product => ({
            value: product.product_uuid,
            label: `${product.product_name} • ${product.brand}`,
        })),
        [products]
    )

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await vendorService.getProductsByVendor()
            console.log("Resposne from vendor", response)
            setProducts(response?.items || [])
        } catch (error) {
            toast.error("Failed to load products. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    useEffect(() => {
        if (!watchProductId) {
            setSelectedProductName("")
            setAvailableVariations([])
            setValue("variations", [])
            setAddedVariations(new Set())
            return
        }
        const product = products.find(p => p.product_uuid === watchProductId)
        if (product) {
            setSelectedProductName(product.product_name)
            setAvailableVariations(product.variations)
            setValue("variations", [])
            setAddedVariations(new Set())
        }
    }, [watchProductId, products, setValue])

    const handleVariationClick = useCallback((variation: Variation) => {
        if (addedVariations.has(variation.id)) {
            toast("This variation is already selected", {
                description: "Each variation can only be added once",
                icon: <AlertTriangle className="w-4 h-4"/>,
            })
            return
        }
        setAddedVariations(prev => new Set(prev).add(variation.id))
        append({
            product_variation_id: variation.id,
            units_in_stock: 0,
            price: 0,
        })
        toast.success("Variation added successfully", {
            description: `${variation.name} is now ready for configuration`,
            icon: <CheckCircle2 className="w-4 h-4"/>,
        })
    }, [addedVariations, append])

    const handleRemoveVariation = useCallback((index: number) => {
        const variationId = fields[index]?.product_variation_id
        const variation = availableVariations.find(v => v.id === variationId)
        remove(index)
        if (variationId !== undefined) {
            setAddedVariations(prev => {
                const newSet = new Set(prev)
                newSet.delete(variationId)
                return newSet
            })
        }
        toast("Variation removed", {
            description: `${variation?.name ?? "Variation"} has been removed from selection`,
        })
    }, [remove, fields, availableVariations])

    const handleReset = useCallback(() => {
        reset({
            product_uuid: "",
            variations: [],
        })
        setSelectedProductName("")
        setAvailableVariations([])
        setAddedVariations(new Set())
        toast("Form reset", {
            description: "All changes have been cleared",
        })
    }, [reset])

    const onSubmit = useCallback(async (data: VendorProductForm) => {
        try {
            console.log('VendorProductForm', data)
            setIsSubmitting(true)
            const res = await vendorService.addProductByVendor(data.product_uuid, data)
            console.log('response form VendorProductForm ', res)
            if (res) {
                toast.success(res?.message || "Product variations updated successfully")
                handleReset()
            }

        } catch (error:any) {
            toast.error( error?.message ||"Update failed", {
                description: "Please check your connection and try again",
            })
        } finally {
            setIsSubmitting(false)
        }
    }, [handleReset])

    const getVariationDetails = useCallback(
        (variationId: number) => availableVariations.find(v => v.id === variationId),
        [availableVariations]
    )

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <LoadingSkeleton/>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <section className="space-y-8">
                    <header className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                                <Package2 className="w-8 h-8 text-white"/>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Product Variation Manager
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Streamline your product catalog with intelligent variation management
                        </p>
                    </header>

                    <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <CardHeader className="pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Search className="w-5 h-5 text-blue-600"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Product Selection</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Choose a product to manage its variations
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <SearchSelectField
                                        label="Product"
                                        options={productsOptions}
                                        value={
                                            watchProductId
                                                ? {
                                                    value: watchProductId,
                                                    label: selectedProduct
                                                        ? `${selectedProduct.product_name} • ${selectedProduct.brand}`
                                                        : "",
                                                }
                                                : null
                                        }
                                        onChangeAction={val => setValue("product_uuid", val as string)}
                                        placeholder="Search products..."
                                        error={errors.product_uuid?.message}
                                    />
                                    <TextInputField
                                        label="Product Name"
                                        name="product_name"
                                        disabled
                                        value={selectedProductName}
                                        readOnly
                                    />
                                </div>

                                {availableVariations.length > 0 && (
                                    <>
                                        <Separator/>
                                        <section className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                                        <Plus className="w-5 h-5 text-emerald-600"/>
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-semibold">Available Variations</h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            Click to add variations to your selection
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary"
                                                       className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {availableVariations.length} available
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {availableVariations.map(variation => {
                                                    const isSelected = addedVariations.has(variation.id)
                                                    return (
                                                        <Button
                                                            type="button"
                                                            key={`available-${variation.id} + ${variation.name}`}
                                                            variant={isSelected ? "secondary" : "outline"}
                                                            className={`h-auto p-4 text-left justify-start transition-all duration-200 hover:shadow-md group ${
                                                                isSelected
                                                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                                                                    : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                                                            }`}
                                                            onClick={() => handleVariationClick(variation)}
                                                            disabled={isSelected}
                                                            aria-pressed={isSelected}
                                                            aria-label={`Add ${variation.name} variation`}
                                                        >
                                                            <div className="w-full space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                  <span
                                                                      className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                                                                    {variation.name}
                                                                  </span>
                                                                    <span
                                                                        className={'text-xs bg-blue-500 p-2 rounded-full text-white'}>
                                                                        {variation.size_unit}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <CheckCircle2
                                                                            className="w-4 h-4 text-blue-600"/>
                                                                    )}
                                                                </div>
                                                                {!isSelected && (
                                                                    <div
                                                                        className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        Click to add →
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </section>
                                    </>
                                )}

                                {fields.length > 0 && (
                                    <>
                                        <Separator/>
                                        <section className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        <TrendingUp className="w-5 h-5 text-purple-600"/>
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-semibold">Selected Variations</h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            Configure pricing for each variation
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                    {fields.length} configured
                                                </Badge>
                                            </div>
                                            <div className="space-y-4">
                                                {fields.map((field, index) => {
                                                    const variationDetails = getVariationDetails(field.product_variation_id)
                                                    return (
                                                        <Card
                                                            key={field.product_variation_id}
                                                            className="border border-gray-200 bg-gradient-to-r from-gray-50/50 to-white shadow-sm"
                                                        >
                                                            <CardContent className="p-6">
                                                                <div className="flex items-center justify-between mb-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm flex items-center justify-center font-semibold"
                                                                            title={variationDetails?.name || `Variation ${index + 1}`}
                                                                        >
                                                                            {index + 1}
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="font-semibold text-gray-900">
                                                                                {variationDetails?.name}
                                                                            </h3>
                                                                            {variationDetails?.size_unit && (
                                                                                <span
                                                                                    className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                                    {variationDetails.size_unit}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveVariation(index)}
                                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                                        aria-label={`Remove ${variationDetails?.name ?? "variation"}`}
                                                                    >
                                                                        <X className="w-4 h-4"/>
                                                                    </Button>
                                                                </div>
                                                                <input
                                                                    type="hidden"
                                                                    {...register(`variations.${index}.product_variation_id`, {valueAsNumber: true})}
                                                                />
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <TextInputField
                                                                        label="Variation Quantity"
                                                                        {...register(`variations.${index}.units_in_stock`, {valueAsNumber: true})}
                                                                        error={errors.variations?.[index]?.units_in_stock?.message}
                                                                        icon={SquareMenu}
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                    />
                                                                    <TextInputField
                                                                        label="Variation Price"
                                                                        {...register(`variations.${index}.price`, {valueAsNumber: true})}
                                                                        error={errors.variations?.[index]?.price?.message}
                                                                        icon={SquareMenu}
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                    />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                            {errors.variations?.root && (
                                                <Alert variant="destructive" role="alert">
                                                    <AlertTriangle className="h-4 w-4"/>
                                                    <AlertDescription>{errors.variations.root.message}</AlertDescription>
                                                </Alert>
                                            )}
                                        </section>
                                    </>
                                )}

                                <Separator/>
                                <div
                                    className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        disabled={isSubmitting || !isDirty}
                                        className="w-full sm:w-auto"
                                    >
                                        Reset Form
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !isValid || fields.length === 0}
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div
                                                    className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2"/>
                                                Save Changes ({fields.length})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </section>
            </div>
        </main>
    )
}

export default ProductVariantUpdateForm
