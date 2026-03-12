"use client"

import React, {useCallback, useEffect, useMemo, useState} from "react"
import {useFieldArray, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Skeleton} from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import SearchSelectField from "@/components/field/search-select"
import TextInputField from "@/components/field/text-input"
import vendorService from "@/service/vendor.service"
import {toast} from "sonner"
import {AlertTriangle, Calendar, CheckCircle2, Factory, Package2, Plus, Save, Search, TrendingUp, X} from "lucide-react"
import vendorProductService from "@/service/product/vendor-product.service"
import {VendorProductForm, VendorProductSchema} from "@/lib/schema/schema"
import {cn} from "@/lib/utils"

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

const LoadingSkeleton = () => (
    <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-md"/>
            <Skeleton className="h-10 w-full rounded-md"/>
        </div>
        <Skeleton className="h-32 w-full rounded-md"/>
    </div>
)

interface VendorProductModalProps {
    mode?: 'create' | 'update'
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const VendorProductModal = ({trigger, open: controlledOpen, onOpenChange}: VendorProductModalProps) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [availableVariations, setAvailableVariations] = useState<Variation[]>([])
    const [selectedProductName, setSelectedProductName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [addedVariations, setAddedVariations] = useState<Set<number>>(new Set())

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen

    const {
        register,
        control,
        setValue,
        watch,
        handleSubmit,
        reset,
        formState: {errors, isValid, isDirty}
    } = useForm<VendorProductForm>({
        resolver: zodResolver(VendorProductSchema),
        defaultValues: {product_uuid: "", variations: []},
        mode: "onChange",
    })

    const {fields, append, remove} = useFieldArray({control, name: "variations"})
    const watchProductId = watch("product_uuid")

    const productsOptions = useMemo(() => products.map((product) => ({
        value: product.product_uuid,
        label: `${product.product_name} - ${product.brand}`,
    })), [products])

    const selectedProduct = products.find(product => product.product_uuid === watchProductId)

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await vendorProductService.getVendorAvailableProducts()
            setProducts(response?.items || [])
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load products.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) fetchProducts()
    }, [isOpen, fetchProducts])

    useEffect(() => {
        if (!watchProductId) {
            setSelectedProductName("")
            setAvailableVariations([])
            setValue("variations", [])
            setAddedVariations(new Set())
            return
        }
        const product = products.find((p) => p.product_uuid === watchProductId)
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
        setAddedVariations((prev) => new Set(prev).add(variation.id))
        append({
            product_variation_id: variation.id,
            units_in_stock: 0,
            price: 0,
            variant_batch_no: "",
            variant_expiry_date: "",
        })
        toast.success("Variation added successfully", {
            description: `${variation.name} is now ready for configuration`,
            icon: <CheckCircle2 className="w-4 h-4"/>,
        })
    }, [addedVariations, append])

    const handleRemoveVariation = useCallback((index: number) => {
        const variationId = fields[index]?.product_variation_id
        const variation = availableVariations.find((v) => v.id === variationId)
        remove(index)
        if (variationId !== undefined) {
            setAddedVariations((prev) => {
                const newSet = new Set(prev)
                newSet.delete(variationId)
                return newSet
            })
        }
        toast("Variation removed", {
            description: `${variation?.name ?? "Variation"} removed from selection`,
        })
    }, [remove, fields, availableVariations])

    const handleReset = useCallback(() => {
        reset({product_uuid: "", variations: []})
        setSelectedProductName("")
        setAvailableVariations([])
        setAddedVariations(new Set())
    }, [reset])

    const onSubmit = useCallback(async (data: VendorProductForm) => {
        try {
            setIsSubmitting(true)
            console.log("Form Data:", data)
            const res = await vendorService.addProductByVendor(data.product_uuid, data)
            if (res) {
                toast.success(res?.message || "Product variations updated successfully")
                handleReset()
                setIsOpen(false)
            }
        } catch (error: any) {
            toast.error(error?.message || "Update failed", {description: "Check your connection and try again"})
        } finally {
            setIsSubmitting(false)
        }
    }, [handleReset, setIsOpen])

    const getVariationDetails = useCallback((variationId: number) => availableVariations.find((v) => v.id === variationId), [availableVariations])

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) handleReset()
    }, [setIsOpen, handleReset])

    const handleFormSubmit = () => {
        handleSubmit(onSubmit)()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-7xl w-full min-w-[600px] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-200/60 backdrop-blur-sm bg-white/80 flex-shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-lg flex-shrink-0">
                            <Package2 className="w-7 h-7 text-white"/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-3xl font-bold text-slate-900 tracking-tight">
                                Product Variation Manager
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-600 mt-2">
                                Streamline your product catalog with intelligent variation management
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <LoadingSkeleton/> : (
                        <div className="px-4 py-8 space-y-8">
                            <section className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-blue-100 rounded-xl flex-shrink-0 shadow-sm">
                                            <Search className="w-5 h-5 text-blue-600"/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-xl font-bold text-slate-900">Product Selection</h2>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Choose a product to manage its variations
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-4">
                                            <SearchSelectField
                                                label="Product"
                                                options={productsOptions}
                                                value={watchProductId}
                                                onChange={(val) => setValue("product_uuid", val as string)}
                                                placeholder="Search products..."
                                                error={errors.product_uuid?.message}
                                            />
                                            {selectedProduct && (
                                                <dl className="flex flex-col space-y-1 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <dt className="text-sm text-slate-600">Brand:</dt>
                                                        <dd className="text-sm font-semibold text-slate-900">
                                                            {selectedProduct.brand}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            )}
                                        </div>
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
                                            <Separator className="my-8"/>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between flex-wrap gap-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-emerald-100 rounded-xl flex-shrink-0 shadow-sm">
                                                            <Plus className="w-5 h-5 text-emerald-600"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                Available Variations
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mt-0.5">
                                                                Click to add variations to your selection
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-sm font-semibold px-4 py-2">
                                                        {availableVariations.length} available
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {availableVariations.map((variation) => {
                                                        console.log("Checking variation:", variation.name, "ID:", variation.id, "Added Variations:", Array.from(addedVariations))
                                                        const isSelected = addedVariations.has(variation.id)
                                                        return (
                                                            <Button
                                                                key={variation.id}
                                                                type="button"
                                                                variant={isSelected ? "secondary" : "outline"}
                                                                className={cn(
                                                                    "h-auto p-4 text-left justify-start transition-all duration-200 hover:shadow-lg group border-2 rounded-lg",
                                                                    isSelected
                                                                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md"
                                                                        : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-blue-200"
                                                                )}
                                                                onClick={() => handleVariationClick(variation)}
                                                                disabled={isSelected}
                                                                aria-pressed={isSelected}
                                                                aria-label={`Add ${variation.name} variation`}
                                                            >
                                                                <div className="w-full space-y-2">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="font-semibold text-sm group-hover:text-blue-600 transition-colors truncate flex-1">
                                                                            {variation.name}
                                                                        </span>
                                                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600"/>}
                                                                    </div>
                                                                    {!isSelected && (
                                                                        <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                                                            Click to add →
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {fields.length > 0 && (
                                        <>
                                            <Separator className="my-8"/>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between flex-wrap gap-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-purple-100 rounded-xl flex-shrink-0 shadow-sm">
                                                            <TrendingUp className="w-5 h-5 text-purple-600"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                Selected Variations
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mt-0.5">
                                                                Configure pricing and details for each variation
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn('bg-purple-100 text-purple-800 border-purple-300 font-semibold px-4 py-2', {'opacity-50': !isValid})}>
                                                        {fields.length} configured
                                                    </Badge>
                                                </div>
                                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                                    {fields.map((field, index) => {
                                                        const variationDetails = getVariationDetails(field.product_variation_id)
                                                        return (
                                                            <div
                                                                key={field.id}
                                                                className="border-2 border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-slate-50/50"
                                                            >
                                                                <div className="flex items-center justify-between mb-6">
                                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                        <div
                                                                            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm flex items-center justify-center font-bold flex-shrink-0 shadow-md"
                                                                            title={variationDetails?.name || `Variation ${index + 1}`}
                                                                        >
                                                                            {index + 1}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                                                                            <h4 className="font-bold text-slate-900 text-base truncate">
                                                                                {variationDetails?.name}
                                                                            </h4>
                                                                            {variationDetails?.size_unit && (
                                                                                <span className="text-xs text-slate-700 bg-slate-200 px-3 py-1 rounded-full inline-block w-fit font-medium">
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
                                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0 flex-shrink-0 rounded-xl"
                                                                        aria-label={`Remove ${variationDetails?.name ?? "variation"}`}
                                                                    >
                                                                        <X className="w-5 h-5"/>
                                                                    </Button>
                                                                </div>
                                                                <input
                                                                    type="hidden"
                                                                    {...register(`variations.${index}.product_variation_id`, {valueAsNumber: true})}
                                                                />
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                                    <TextInputField
                                                                        label="Stock Quantity"
                                                                        {...register(`variations.${index}.units_in_stock`, {valueAsNumber: true})}
                                                                        error={errors.variations?.[index]?.units_in_stock?.message}
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                        placeholder="0"
                                                                    />
                                                                    <TextInputField
                                                                        label="Price"
                                                                        {...register(`variations.${index}.price`, {valueAsNumber: true})}
                                                                        error={errors.variations?.[index]?.price?.message}
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                    />
                                                                    <TextInputField
                                                                        label="Batch Number"
                                                                        {...register(`variations.${index}.variant_batch_no`)}
                                                                        error={errors.variations?.[index]?.variant_batch_no?.message}
                                                                        placeholder="Enter batch number"
                                                                    />
                                                                    <TextInputField
                                                                        label="Expiry Date"
                                                                        {...register(`variations.${index}.variant_expiry_date`)}
                                                                        error={errors.variations?.[index]?.variant_expiry_date?.message}
                                                                        icon={Calendar}
                                                                        type="date"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                {errors.variations?.root && (
                                                    <Alert variant="destructive" role="alert" className="border-2">
                                                        <AlertTriangle className="h-5 w-5"/>
                                                        <AlertDescription className="font-medium">
                                                            {errors.variations.root.message}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 border-t border-slate-200 flex-shrink-0">
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4">
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
                            type="button"
                            onClick={handleFormSubmit}
                            disabled={isSubmitting || !isValid || fields.length === 0}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
                            ) : (
                                <Save className="w-4 h-4 mr-2"/>
                            )}
                            Save Changes ({fields.length})
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default VendorProductModal