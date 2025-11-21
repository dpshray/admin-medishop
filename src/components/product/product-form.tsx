"use client"

import {Controller, useFieldArray, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {Edit, Layers, Package, Plus, Save, Tags, X, XCircle} from "lucide-react"
import {useCallback, useEffect, useMemo, useState} from "react"
import SearchSelectField from "@/components/field/search-select"
import TextInputField from "@/components/field/text-input"
import MultiSelectField from "@/components/field/multi-select-input"
import FileInputField from "@/components/field/file-input"
import DatePickerField from "@/components/field/date-picker"
import {createProductSchema, ProductCreate, ProductUpdate, updateProductSchema} from "@/lib/schema/productSchema"
import {useBrands, useCategories, useGenericName, useProductUnits, useTags} from "@/hooks/all-hook"
import productService from "@/service/product/product.service"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import ProductManageFormSkeleton from "@/app/admin/products/add-product/laoding"
import {CURRENCY_SYMBOL, MAX_FILE_SIZE} from "@/config/app-constant"
import {useQuery} from "@tanstack/react-query"
import healthConditionService from "@/service/healthCondition.service"
import {Switch} from "@/components/ui/switch"
import {cn} from "@/lib/utils"

interface ProductManageFormProps {
    mode?: "create" | "edit"
    productUuid?: string
    onSuccessAction?: () => void
}

const ProductManageForm = ({mode = "create", productUuid, onSuccessAction}: ProductManageFormProps) => {
    const {categories} = useCategories()
    const {tags} = useTags()
    const {brands} = useBrands()
    const {productUnits} = useProductUnits()
    const {genericNames} = useGenericName()
    const isUpdateMode = mode === "edit"
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    const {data: healthCondition} = useQuery({
        queryKey: ["health-condition"],
        queryFn: async () => await healthConditionService.getHealthConditionList().then((res) => res.items)
    })

    const genericNameOptions = useMemo(() =>
            genericNames?.map((item: any) => ({value: item.id, label: item.name})) || [],
        [genericNames]
    )

    const healthConditionOptions = useMemo(() =>
            healthCondition?.map((item: any) => ({value: item.id, label: item.name})) || [],
        [healthCondition]
    )

    const categoriesOptions = useMemo(() =>
            categories.map((category) => ({id: category.id, name: category.name})),
        [categories]
    )

    const tagsOptions = useMemo(() =>
            tags.map((tag) => ({id: tag.id, name: tag.name})),
        [tags]
    )

    const brandsOptions = useMemo(() =>
            brands.map((brand) => ({id: brand.id, name: brand.name})),
        [brands]
    )

    const categorySelectOptions = useMemo(() =>
            categoriesOptions.map((category) => ({value: category.id, label: category.name})),
        [categoriesOptions]
    )

    const tagSelectOptions = useMemo(() =>
            tagsOptions.map((tag) => ({value: tag.id, label: tag.name})),
        [tagsOptions]
    )

    const defaultValues = useMemo(() => {
        const baseVariation = {
            variant_name: "",
            variant_price: 1,
            variant_stock: 1,
            variant_unit: productUnits[0]?.value ?? "mg",
            variant_batch_no: "",
            variant_expiry_date: "",
            variant_manufacturer: "",
        }

        if (isUpdateMode) {
            return {
                name: "",
                brand_id: 0,
                description: "",
                variations: [{...baseVariation, variant_unit: "mg"}],
                categories: [],
                tags: [],
                featured_image: null,
                gallery_images: [],
                prescription_required: false,
                health_condition: [],
                discount_percent: 0
            }
        }

        return {
            name: "",
            brand_id: 0,
            description: "",
            variations: [baseVariation],
            categories: [],
            tags: [],
            featured_image: new File([], ""),
            gallery_images: [],
            prescription_required: false,
            health_condition: [],
            discount_percent: 0,
            generic_product_name_id: 0,
        }
    }, [isUpdateMode, productUnits])

    const schema = isUpdateMode ? updateProductSchema : createProductSchema

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors, isSubmitting}
    } = useForm<ProductCreate | ProductUpdate>({
        resolver: zodResolver(schema) as any,
        defaultValues,
        mode: "onBlur",
    })

    const {fields, append, remove, replace} = useFieldArray({control, name: "variations"})

    const watchCategories = watch("categories") as number[] || []
    const watchTags = watch("tags") as number[] || []
    const watchBrandId = watch("brand_id")
    const watchGenericId = watch("generic_product_name_id")
    const watchHealthCondition = watch("health_condition") as number[] || []
    const watchPrescriptionRequired = watch("prescription_required")

    const fetchProductData = useCallback(async () => {
        if (!productUuid || !isUpdateMode) return
        try {
            setIsLoading(true)
            const response = await productService.getSingleProduct(productUuid)
            console.log("Product Data:", response?.data)
            if (response?.data) {
                const productData = response.data
                const mappedVariations = productData.variations?.map((variation: any) => ({
                    variant_name: variation.variant_name || "",
                    variant_price: variation.variant_price || 1,
                    variant_stock: variation.variant_stock || 1,
                    variant_unit: variation.variant_unit || "mg",
                    variant_batch_no: variation.variant_batch_no || "",
                    variant_expiry_date: variation.variant_expiry_date || "",
                    variant_manufacturer: variation.variant_manufacturer || "",
                })) || []

                setValue("name", productData.name || "")
                setValue("brand_id", productData.brand?.id || 0)
                setValue("description", productData.description || "")
                setValue("categories", productData.categories?.map((cat: any) => cat.id) || [])
                setValue("tags", productData.tags?.map((tag: any) => tag.id) || [])
                setValue("prescription_required", productData.prescription_required || false)
                setValue("health_condition", productData.health_conditions?.map((h: any) => h.id) || [])
                setValue("discount_percent", productData.discount_percent || 0)
                setValue("generic_product_name_id", productData.generic_product?.generic_product_id || 0)
                if (mappedVariations.length > 0) replace(mappedVariations)
                setIsDataLoaded(true)
            }
        } catch (error) {
            console.error("Failed to fetch product data:", error)
            toast.error("Failed to fetch product data")
        } finally {
            setIsLoading(false)
        }
    }, [productUuid, isUpdateMode, setValue, replace])

    useEffect(() => {
        if (isUpdateMode && productUuid && brands.length > 0 && productUnits.length > 0) {
            fetchProductData()
        }
    }, [fetchProductData, isUpdateMode, productUuid, brands.length, productUnits.length])

    const handleBrandChange = useCallback((brandId: string | number) => {
        setValue("brand_id", typeof brandId === "string" ? parseInt(brandId, 10) : brandId, {shouldValidate: true})
    }, [setValue])

    const handleGenericNameChange = useCallback((genericId: string | number) => {
        setValue("generic_product_name_id", typeof genericId === "string" ? parseInt(genericId, 10) : genericId, {shouldValidate: true})
    }, [setValue])

    const handleCategoryChange = useCallback((values: (string | number)[]) => {
        setValue("categories", values.map(Number), {shouldValidate: true})
    }, [setValue])

    const handleTagChange = useCallback((values: (string | number)[]) => {
        setValue("tags", values.map(Number), {shouldValidate: true})
    }, [setValue])

    const handleHealthConditionChange = useCallback((values: (string | number)[]) => {
        setValue("health_condition", values.map(Number), {shouldValidate: true})
    }, [setValue])

    const handleSizeUnitChange = useCallback((index: number) => (value: string | number) => {
        setValue(`variations.${index}.variant_unit`, value as string, {shouldValidate: true})
    }, [setValue])

    const handleFeaturedImageChange = useCallback((files: File[]) => {
        setValue("featured_image", files[0] ?? null, {shouldValidate: true})
    }, [setValue])

    const handleGalleryImagesChange = useCallback((files: File[]) => {
        setValue("gallery_images", files, {shouldValidate: true})
    }, [setValue])

    const handleAddVariation = useCallback(() => {
        append({
            variant_name: "",
            variant_price: 1,
            variant_stock: 1,
            variant_unit: productUnits[0]?.value ?? "mg",
            variant_batch_no: "",
            variant_expiry_date: "",
            variant_manufacturer: "",
        })
    }, [append, productUnits])

    const handleRemoveVariation = useCallback((index: number) => () => {
        remove(index)
    }, [remove])

    const handlePrescriptionToggle = useCallback((checked: boolean) => {
        setValue("prescription_required", checked, {shouldValidate: true})
    }, [setValue])

    const handleExpiryDateChange = useCallback((index: number) => (date: Date | undefined) => {
        setValue(`variations.${index}.variant_expiry_date`, date ? date.toISOString().split('T')[0] : "", {shouldValidate: true})
    }, [setValue])

    const onSubmit = useCallback(async (data: ProductCreate | ProductUpdate) => {
        try {
            if (isUpdateMode && productUuid) {
                const response = await productService.updateProduct(productUuid, data as ProductUpdate)
                if (response) {
                    toast.success(response?.message || "Product updated successfully")
                    onSuccessAction?.()
                    router.push("/admin/products")
                }
            } else {
                const response = await productService.createProduct(data as ProductCreate)
                if (response) {
                    toast.success(response?.message || "Product created successfully")
                    router.push("/admin/products")
                }
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit product")
        }
    }, [isUpdateMode, productUuid, onSuccessAction, router])

    const handleReset = useCallback(() => {
        reset(defaultValues)
    }, [reset, defaultValues])

    if (isLoading || (isUpdateMode && !isDataLoaded)) {
        return <ProductManageFormSkeleton/>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div
                        className={cn("rounded-xl p-3 shadow-sm", isUpdateMode ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-blue-500 to-indigo-600")}>
                        {isUpdateMode ? <Edit className="h-6 w-6 text-white"/> :
                            <Package className="h-6 w-6 text-white"/>}
                    </div>
                    <div className="flex-1">
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                            {isUpdateMode ? "Update Product" : "Create New Product"}
                        </h1>
                        <p className="mt-1 text-base text-slate-600 sm:text-lg">
                            {isUpdateMode ? "Modify product details and save your changes" : "Add a new product with comprehensive information"}
                        </p>
                    </div>
                </div>

                <div onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2">
                                <Package className="h-5 w-5 text-blue-600"/>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Basic Information</h2>
                        </div>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                            <TextInputField {...register("name")} label="Product Name" placeholder="Enter product name"
                                            error={errors.name?.message} required={!isUpdateMode} autoComplete="off"/>
                            <SearchSelectField
                                options={brandsOptions.map((brand) => ({value: brand.id, label: brand.name}))}
                                value={watchBrandId} onChange={handleBrandChange} placeholder="Select Brand"
                                label="Brand" error={errors.brand_id?.message} required={!isUpdateMode}/>
                            <SearchSelectField label="Generic Name" options={genericNameOptions} value={watchGenericId}
                                               onChange={handleGenericNameChange} placeholder="Select Generic Name"
                                               error={errors.generic_product_name_id?.message}
                                               required={!isUpdateMode}/>
                        </div>
                        <TextInputField {...register("description")} textarea label="Description"
                                        placeholder="Enter detailed product description"
                                        error={errors.description?.message} className="min-h-[100px] sm:min-h-[120px]"
                                        required={!isUpdateMode}/>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 md:grid-cols-2">
                            <TextInputField {...register("discount_percent")} label="Discount Percentage" type="number"
                                            placeholder="Enter discount percentage"
                                            error={errors.discount_percent?.message} required={!isUpdateMode}/>
                            <div
                                className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 transition-colors hover:border-slate-300 sm:p-5">
                                <div className="space-y-0.5 sm:space-y-1">
                                    <label htmlFor="prescription-required"
                                           className="cursor-pointer text-sm font-semibold text-slate-900">Prescription
                                        Required</label>
                                    <p className="text-xs text-slate-500 sm:text-sm">Requires valid prescription</p>
                                </div>
                                <Switch id="prescription-required" checked={watchPrescriptionRequired}
                                        onCheckedChange={handlePrescriptionToggle}
                                        aria-label="Toggle prescription requirement"/>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-orange-50 p-2">
                                <Package className="h-5 w-5 text-orange-600"/>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Product Images</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                            <FileInputField
                                label="Featured Image"
                                accept="image/*"
                                multiple={false}
                                onFileChange={handleFeaturedImageChange}
                                error={errors.featured_image?.message}
                                showPreviews
                                maxFileSize={MAX_FILE_SIZE}
                                required={!isUpdateMode}
                                helperText={`Only one image is allowed and max file size is ${MAX_FILE_SIZE}KB`}
                            />
                            <FileInputField
                                label="Gallery Images"
                                accept="image/*"
                                multiple
                                onFileChange={handleGalleryImagesChange}
                                error={errors.gallery_images?.message}
                                showPreviews
                                maxFileSize={MAX_FILE_SIZE}
                                required={!isUpdateMode}
                                helperText={`Multiple images are allowed and max file size is ${MAX_FILE_SIZE}KB`}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-green-50 p-2">
                                <Layers className="h-5 w-5 text-green-600"/>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Categories &
                                Classification</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                            <MultiSelectField options={categorySelectOptions} value={watchCategories}
                                              onValueChange={handleCategoryChange} placeholder="Select categories"
                                              label="Categories" error={errors.categories?.message} maxSelected={10}
                                              searchable clearable required={!isUpdateMode}/>
                            <MultiSelectField options={tagSelectOptions} value={watchTags}
                                              onValueChange={handleTagChange} placeholder="Select tags" label="Tags"
                                              error={errors.tags?.message} maxSelected={10} searchable clearable
                                              required={!isUpdateMode}/>
                            <MultiSelectField options={healthConditionOptions} value={watchHealthCondition}
                                              onValueChange={handleHealthConditionChange}
                                              placeholder="Select health conditions" label="Health Conditions"
                                              error={errors.health_condition?.message} maxSelected={10} searchable
                                              clearable required={!isUpdateMode}/>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg sm:p-8">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-50 p-2">
                                    <Tags className="h-5 w-5 text-purple-600"/>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Product Variations</h2>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddVariation}
                                    className="w-full border-2 hover:border-blue-300 hover:bg-blue-50 sm:w-auto">
                                <Plus className="mr-2 h-4 w-4"/>
                                Add Variation
                            </Button>
                        </div>

                        <div className="space-y-4 sm:space-y-5">
                            {fields.map((field, index) => {
                                const currentSizeUnit = watch(`variations.${index}.variant_unit`)
                                return (
                                    <div key={field.id}
                                         className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50/50 to-white p-4 transition-all hover:border-slate-300 sm:p-6">
                                        <div className="mb-4 flex items-center justify-between sm:mb-6">
                                            <h3 className="flex items-center gap-2 font-semibold text-slate-800 sm:gap-3">
                                                <span
                                                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm sm:h-8 sm:w-8">{index + 1}</span>
                                                <span className="text-sm sm:text-base">Variation {index + 1}</span>
                                            </h3>
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="sm"
                                                        onClick={handleRemoveVariation(index)}
                                                        className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    <X className="mr-1 h-4 w-4"/>
                                                    <span className="hidden sm:inline">Remove</span>
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                                            <TextInputField
                                                label="Variation Name" {...register(`variations.${index}.variant_name`)}
                                                error={errors.variations?.[index]?.variant_name?.message}
                                                placeholder="e.g. 500mg Tablet" required autoComplete="off"/>
                                            <TextInputField
                                                label="Stock Quantity" {...register(`variations.${index}.variant_stock`, {
                                                valueAsNumber: true,
                                                min: {value: 0, message: "Stock quantity must be at least 0"}
                                            })}
                                                error={errors.variations?.[index]?.variant_stock?.message}
                                                placeholder="e.g. 100" type="number" required/>
                                            <SearchSelectField label="Unit" placeholder="Select Unit"
                                                               options={productUnits.map((unit: any) => ({
                                                                   value: unit.value,
                                                                   label: unit.label || unit.value
                                                               }))} value={currentSizeUnit}
                                                               onChange={handleSizeUnitChange(index)}
                                                               error={errors.variations?.[index]?.variant_unit?.message}
                                                               required/>
                                            <TextInputField
                                                label={`Price (${CURRENCY_SYMBOL})`} {...register(`variations.${index}.variant_price`, {
                                                valueAsNumber: true,
                                                min: {value: 1, message: "Price must be at least 1"}
                                            })}
                                                error={errors.variations?.[index]?.variant_price?.message}
                                                placeholder="0.00" type="number" required/>
                                            <TextInputField
                                                label="Batch Number " {...register(`variations.${index}.variant_batch_no`)}
                                                error={errors.variations?.[index]?.variant_batch_no?.message}
                                                placeholder="e.g. BTH-2024-001" required/>
                                            <Controller
                                                name={`variations.${index}.variant_expiry_date`}
                                                control={control}
                                                render={({field}) => (
                                                    <DatePickerField
                                                        label="Expiry Date"
                                                        placeholder="Select expiry date"
                                                        value={field.value ? new Date(field.value) : undefined}
                                                        onChangeAction={handleExpiryDateChange(index)}
                                                        error={errors.variations?.[index]?.variant_expiry_date?.message}
                                                        required
                                                        minDate={new Date()}
                                                        dateFormat="PPP"
                                                        clearable
                                                    />
                                                )}
                                            />
                                            <TextInputField
                                                label="Manufacturer" {...register(`variations.${index}.variant_manufacturer`)}
                                                error={errors.variations?.[index]?.variant_manufacturer?.message}
                                                placeholder="e.g. ABC Pharma" required/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row sm:gap-4">
                        <Button type="button" variant="outline" size="lg" onClick={handleReset}
                                className="w-full border-2 hover:bg-slate-50 sm:w-auto" disabled={isSubmitting}>
                            <XCircle className="mr-2 h-4 w-4"/>
                            Reset Form
                        </Button>
                        <Button type="submit" size="lg" disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all sm:w-auto"
                                onClick={handleSubmit(onSubmit)}>
                            {isSubmitting ? (
                                <>
                                    <div
                                        className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                    {isUpdateMode ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4"/>
                                    {isUpdateMode ? "Update Product" : "Create Product"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductManageForm