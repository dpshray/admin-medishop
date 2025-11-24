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
import {AlertTriangle, CheckCircle2, Package2, Plus, Save, Search, TrendingUp, X} from "lucide-react"
import vendorProductService from "@/service/product/vendor-product.service"
import {cn} from "@/lib/utils"
import {z} from "zod"

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
    <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-md"/>
            <Skeleton className="h-10 w-full rounded-md"/>
        </div>
        <Skeleton className="h-32 w-full rounded-md"/>
    </div>
)

interface BatchUpdateModalProps {
    actionLabel?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const BatchUpdateSchema = z.object({
    product_uuid: z.string().min(1, "Please select a product"),
    variations: z.array(
        z.object({
            product_variation_id: z.number(),
            variant_batch_no: z.string().min(1, "Batch number is required"),
        })
    ).min(1, "At least one variation is required"),
})

type BatchUpdateForm = z.infer<typeof BatchUpdateSchema>

const BatchUpdateModal = ({actionLabel = "Update Batch Numbers", open: controlledOpen, onOpenChange}: BatchUpdateModalProps) => {
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
    } = useForm<BatchUpdateForm>({
        resolver: zodResolver(BatchUpdateSchema),
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
            variant_batch_no: "",
        })
        toast.success("Variation added successfully", {
            description: `${variation.name} is now ready for batch number update`,
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

    const onSubmit = useCallback(async (data: BatchUpdateForm) => {
        try {
            setIsSubmitting(true)
            const res = await vendorService.updateBatchNumbers(data.product_uuid, data)
            if (res) {
                toast.success(res?.message || "Batch numbers updated successfully")
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
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                    {actionLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-[95vw] sm:w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader
                    className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-slate-200/60 backdrop-blur-sm bg-white/80 flex-shrink-0">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <div
                            className="p-2.5 sm:p-3.5 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                            <Package2 className="w-5 h-5 sm:w-7 sm:h-7 text-white"/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle
                                className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                                Batch Number Update
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">
                                Update batch numbers for product variations
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <LoadingSkeleton/> : (
                        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
                            <section
                                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                                <div
                                    className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/30">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div
                                            className="p-2 sm:p-2.5 bg-blue-100 rounded-lg sm:rounded-xl flex-shrink-0 shadow-sm">
                                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Product
                                                Selection</h2>
                                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
                                                Choose a product to update batch numbers
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="flex flex-col gap-3 sm:gap-4">
                                            <SearchSelectField
                                                label="Product"
                                                options={productsOptions}
                                                value={watchProductId}
                                                onChange={(val) => setValue("product_uuid", val as string)}
                                                placeholder="Search products..."
                                                error={errors.product_uuid?.message}
                                            />
                                            {selectedProduct && (
                                                <dl className="flex flex-col space-y-1 mt-1 sm:mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <dt className="text-xs sm:text-sm text-slate-600">Brand:</dt>
                                                        <dd className="text-xs sm:text-sm font-semibold text-slate-900">
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
                                            <Separator className="my-4 sm:my-6 lg:my-8"/>
                                            <div className="space-y-4 sm:space-y-6">
                                                <div
                                                    className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div
                                                            className="p-2 sm:p-2.5 bg-emerald-100 rounded-lg sm:rounded-xl flex-shrink-0 shadow-sm">
                                                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">
                                                                Available Variations
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 hidden sm:block">
                                                                Click to add variations for batch update
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary"
                                                           className="bg-blue-100 text-blue-700 border-blue-200 text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1 sm:py-2">
                                                        {availableVariations.length} available
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                    {availableVariations.map((variation) => {
                                                        const isSelected = addedVariations.has(variation.id)
                                                        return (
                                                            <Button
                                                                key={variation.id}
                                                                type="button"
                                                                variant={isSelected ? "secondary" : "outline"}
                                                                className={cn(
                                                                    "h-auto p-3 sm:p-4 text-left justify-start transition-all duration-200 hover:shadow-lg group border-2 rounded-lg",
                                                                    isSelected
                                                                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md"
                                                                        : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-blue-200"
                                                                )}
                                                                onClick={() => handleVariationClick(variation)}
                                                                disabled={isSelected}
                                                            >
                                                                <div className="w-full space-y-1.5 sm:space-y-2">
                                                                    <div
                                                                        className="flex items-center justify-between gap-2">
                                                                        <span
                                                                            className="font-semibold text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate flex-1">
                                                                            {variation.name}
                                                                        </span>
                                                                        {isSelected && <CheckCircle2
                                                                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0"/>}
                                                                    </div>
                                                                    {!isSelected && (
                                                                        <div
                                                                            className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium hidden sm:block">
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
                                            <Separator className="my-4 sm:my-6 lg:my-8"/>
                                            <div className="space-y-4 sm:space-y-6">
                                                <div
                                                    className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div
                                                            className="p-2 sm:p-2.5 bg-purple-100 rounded-lg sm:rounded-xl flex-shrink-0 shadow-sm">
                                                            <TrendingUp
                                                                className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">
                                                                Selected Variations
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 hidden sm:block">
                                                                Update batch numbers for each variation
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={cn('bg-purple-100 text-purple-800 border-purple-300 font-semibold px-2.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm', {'opacity-50': !isValid})}>
                                                        {fields.length} selected
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                                                    {fields.map((field, index) => {
                                                        const variationDetails = getVariationDetails(field.product_variation_id)
                                                        return (
                                                            <div
                                                                key={field.id}
                                                                className="border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-slate-50/50"
                                                            >
                                                                <div
                                                                    className="flex items-center justify-between mb-4 sm:mb-6">
                                                                    <div
                                                                        className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
                                                                        <div
                                                                            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                                                                            {index + 1}
                                                                        </div>
                                                                        <div
                                                                            className="min-w-0 flex-1 flex flex-col gap-1 sm:gap-1.5">
                                                                            <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                                                                {variationDetails?.name}
                                                                            </h4>
                                                                            {variationDetails?.size_unit && (
                                                                                <span
                                                                                    className="text-xs text-slate-700 bg-slate-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block w-fit font-medium">
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
                                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0 rounded-lg sm:rounded-xl"
                                                                    >
                                                                        <X className="w-4 h-4 sm:w-5 sm:h-5"/>
                                                                    </Button>
                                                                </div>
                                                                <input
                                                                    type="hidden"
                                                                    {...register(`variations.${index}.product_variation_id`, {valueAsNumber: true})}
                                                                />
                                                                <TextInputField
                                                                    label="Batch Number"
                                                                    {...register(`variations.${index}.variant_batch_no`)}
                                                                    error={errors.variations?.[index]?.variant_batch_no?.message}
                                                                    placeholder="Enter batch number"
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                {errors.variations?.root && (
                                                    <Alert variant="destructive" className="border-2">
                                                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5"/>
                                                        <AlertDescription className="font-medium text-xs sm:text-sm">
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

                <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 border-t border-slate-200 flex-shrink-0">
                    <div
                        className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={isSubmitting || !isDirty}
                            className="w-full sm:w-auto text-sm"
                        >
                            Reset Form
                        </Button>
                        <Button
                            type="button"
                            onClick={handleFormSubmit}
                            disabled={isSubmitting || !isValid || fields.length === 0}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
                        >
                            {isSubmitting ? (
                                <div
                                    className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
                            ) : (
                                <Save className="w-4 h-4 mr-2"/>
                            )}
                            Update Batch Numbers ({fields.length})
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BatchUpdateModal