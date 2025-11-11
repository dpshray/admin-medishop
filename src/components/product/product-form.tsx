"use client"

import {useFieldArray, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Edit, Layers, Package, Plus, Save, Tags, X, XCircle} from "lucide-react"
import {useCallback, useEffect, useState} from "react"
import SearchSelectField from "@/components/field/search-select"
import TextInputField from "@/components/field/text-input"
import MultiSelectField from "@/components/field/multi-select-input"
import FileInputField from "@/components/field/file-input"
import {createProductSchema, ProductCreate, ProductUpdate, updateProductSchema} from "@/lib/schema/productSchema"
import {useBrands, useCategories, useProductUnits, useTags} from "@/hooks/all-hook"
import productService from "@/service/product/product.service"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import ProductManageFormSkeleton from "@/app/admin/products/add-product/laoding";
import {MAX_FILE_SIZE} from "@/config/app-constant";
import {useQuery} from "@tanstack/react-query";
import healthConditionService from "@/service/healthCondition.service";

interface ProductManageFormProps {
    mode?: "create" | "edit"
    productUuid?: string
    initialData?: Partial<ProductCreate>
    onSuccessAction?: () => void
}

interface SelectOption {
    id: number
    name: string
}


const ProductManageForm = ({
                               mode = "create",
                               productUuid,
                               onSuccessAction,
                           }: ProductManageFormProps) => {
    const {categories} = useCategories()
    const {tags} = useTags()
    const {brands} = useBrands()
    const {productUnits} = useProductUnits()
    const isUpdateMode = mode === "edit"
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false)


    const {data: healthCondition} = useQuery({
        queryKey: ["health-condition"],
        queryFn: async () => {
            return await healthConditionService.getHealthConditionList().then((res) => res.items)
        }
    })
    console.log('Health Condition', healthCondition)
    const healthConditionOptions =
        healthCondition?.map((item: any) => ({
            value: item.id,
            label: item.name,
        })) || []
    console.log('Health Condition Options', healthConditionOptions)

    const categoriesOptions: SelectOption[] = categories.map((category) => ({
        id: category.id,
        name: category.name
    }))

    const tagsOptions: SelectOption[] = tags.map((tag) => ({
        id: tag.id,
        name: tag.name
    }))

    const brandsOptions: SelectOption[] = brands.map((brand) => ({
        id: brand.id,
        name: brand.name
    }))

    const createDefaultValues: ProductCreate = {
        name: "",
        brand_id: brands[0]?.id ?? 0,
        description: "",
        variations: [
            {
                name: "",
                size_value: 1,
                size_unit: productUnits[0]?.value ?? "mg",
                platform_price: 1,
            },
        ],
        categories: [],
        tags: [],
        featured_image: new File([], ""),
        gallery_images: [],
        prescription_required: false,
        health_condition: []
    }

    const updateDefaultValues: ProductUpdate = {
        name: "",
        brand_id: 0,
        description: "",
        variations: [
            {
                name: "",
                size_value: 1,
                size_unit: "mg",
                platform_price: 1,
            },
        ],
        categories: [],
        tags: [],
        featured_image: null,
        gallery_images: [],
        prescription_required: false,
        health_condition: []
    }

    const defaultValues = isUpdateMode ? updateDefaultValues : createDefaultValues
    const schema = isUpdateMode ? updateProductSchema : createProductSchema

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors, isSubmitting },
    } = useForm<ProductCreate | ProductUpdate>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onBlur",
    })

    const {fields, append, remove, replace} = useFieldArray({
        control,
        name: "variations"
    })

    const watchCategories = watch("categories") as number[] || []
    const watchTags = watch("tags") as number[] || []
    const watchBrandId = watch("brand_id")
    const watchHealthCondition = watch("health_condition") as number[] || []

    const categorySelectOptions = categoriesOptions.map((category) => ({
        value: category.id,
        label: category.name
    }))

    const tagSelectOptions = tagsOptions.map((tag) => ({
        value: tag.id,
        label: tag.name
    }))

    const fetchProductData = useCallback(async () => {
        if (!productUuid || !isUpdateMode) return

        try {
            setIsLoading(true)
            const response = await productService.getSingleProduct(productUuid)

            if (response?.data) {
                const productData = response.data

                const mappedVariations = productData.variations?.map((variation: any) => ({
                    variation_id: variation.variation_id,
                    name: variation.name || "",
                    size_value: variation.size_value || 1,
                    size_unit: variation.size_unit || "mg",
                    platform_price: variation.admin_price || variation.platform_price || 1,
                })) || []

                setValue("name", productData.name || "")
                setValue("brand_id", productData.brand?.id || 0)
                setValue("description", productData.description || "")
                setValue("categories", productData.categories?.map((cat: any) => cat.id) || [])
                setValue("tags", productData.tags?.map((tag: any) => tag.id) || [])
                setValue("prescription_required", productData.prescription_required || false)
                setValue("health_condition", productData.health_condition?.map((healthCondition: any) => healthCondition.id) || [])

                if (mappedVariations.length > 0) {
                    replace(mappedVariations)
                }

                setIsDataLoaded(true)
            }
        } catch (error) {
            console.error("Error fetching product data:", error)
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
        const numericId = typeof brandId === "string" ? parseInt(brandId, 10) : brandId
        setValue("brand_id", numericId, {shouldValidate: true})
    }, [setValue])

    const handleCategoryChange = useCallback((values: (string | number)[]) => {
        const numericValues = values.map((value) =>
            typeof value === "string" ? parseInt(value, 10) : value
        )
        setValue("categories", numericValues, {shouldValidate: true})
    }, [setValue])

    const handleTagChange = useCallback((values: (string | number)[]) => {
        const numericValues = values.map((value) =>
            typeof value === "string" ? parseInt(value, 10) : value
        )
        setValue("tags", numericValues, {shouldValidate: true})
    }, [setValue])
    const handleHealthConditionChange = useCallback((values: (string | number)[]) => {
        const numericValues = values.map((value) =>
            typeof value === "string" ? parseInt(value, 10) : value
        )
        setValue("health_condition", numericValues, {shouldValidate: true})
    }, [setValue])

    const handleSizeUnitChange = useCallback((index: number) => (value: string | number) => {
        setValue(`variations.${index}.size_unit` as const, value as string, {shouldValidate: true})
    }, [setValue])

    const handleFeaturedImageChange = useCallback((files: File[]) => {
        setValue("featured_image", files[0] ?? null, {shouldValidate: true})
    }, [setValue])

    const handleGalleryImagesChange = useCallback((files: File[]) => {
        setValue("gallery_images", files, {shouldValidate: true})
    }, [setValue])

    const handleAddVariation = useCallback(() => {
        const defaultUnit = productUnits[0]?.value ?? "mg"
        append({
            name: "",
            size_value: 1,
            size_unit: defaultUnit,
            platform_price: 1
        })
    }, [append, productUnits])

    const handleRemoveVariation = useCallback((index: number) => () => {
        remove(index)
    }, [remove])

    const onSubmit = useCallback(async (data: ProductCreate | ProductUpdate) => {
        try {
            if (isUpdateMode && productUuid) {
                const response = await productService.updateProduct(
                    productUuid,
                    data as ProductUpdate
                )
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
        } catch (error:any) {
            console.error("Submit error:", error?.message)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {isUpdateMode ? "Update Product" : "Create Product"}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {isUpdateMode
                                    ? "Modify the product details and save your changes"
                                    : "Add a new product to your inventory with detailed information"
                                }
                            </p>
                        </div>
                    </header>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-0">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isUpdateMode ? "bg-amber-100" : "bg-blue-100"}`}>
                                        {isUpdateMode ? (
                                            <Edit className="w-5 h-5 text-amber-600"/>
                                        ) : (
                                            <Package className="w-5 h-5 text-blue-600"/>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl">Product Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TextInputField
                                        {...register("name")}
                                        label="Product Name"
                                        placeholder="Enter product name"
                                        error={errors.name?.message}
                                        required={!isUpdateMode}
                                        autoComplete="off"
                                    />
                                    <SearchSelectField
                                        options={brandsOptions.map((brand) => ({
                                            value: brand.id,
                                            label: brand.name
                                        }))}
                                        value={watchBrandId}
                                        onChange={handleBrandChange}
                                        placeholder="Select Brand"
                                        label="Brand"
                                        error={errors.brand_id?.message}
                                        required={!isUpdateMode}
                                    />
                                </section>

                                <TextInputField
                                    {...register("description")}
                                    textarea
                                    label="Product Description"
                                    placeholder="Enter detailed product description"
                                    error={errors.description?.message}
                                    className="min-h-[100px]"
                                />

                                {!isUpdateMode && (
                                    <>
                                        <Separator className="my-8"/>
                                        <section className="space-y-6">
                                            <header className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Package className="w-5 h-5 text-orange-600"/>
                                                </div>
                                                <h2 className="text-lg font-semibold">Product Images</h2>
                                            </header>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <FileInputField
                                                    label="Featured Image"
                                                    accept="image/*"
                                                    multiple={false}
                                                    onFileChange={handleFeaturedImageChange}
                                                    error={errors.featured_image?.message}
                                                    showPreviews
                                                    maxFileSize={MAX_FILE_SIZE}
                                                    required
                                                    helperText={'Only one image is allowed and max file size is ' + MAX_FILE_SIZE + 'KB'}

                                                />
                                                <FileInputField
                                                    label="Gallery Images"
                                                    accept="image/*"
                                                    multiple
                                                    onFileChange={handleGalleryImagesChange}
                                                    error={errors.gallery_images?.message}
                                                    showPreviews
                                                    maxFileSize={MAX_FILE_SIZE}
                                                    required
                                                    helperText={'Multiple images are allowed and max file size is ' + MAX_FILE_SIZE + 'KB'}
                                                />
                                            </div>
                                        </section>
                                    </>
                                )}

                                <Separator className="my-8"/>

                                <section className="space-y-6">
                                    <header className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Layers className="w-5 h-5 text-green-600"/>
                                        </div>
                                        <h2 className="text-lg font-semibold">Categories & Tags</h2>
                                    </header>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <MultiSelectField
                                            options={categorySelectOptions}
                                            value={watchCategories}
                                            onValueChange={handleCategoryChange}
                                            placeholder="Select categories"
                                            label="Categories"
                                            error={errors.categories?.message}
                                            maxSelected={10}
                                            searchable
                                            clearable
                                            required={!isUpdateMode}
                                        />
                                        <MultiSelectField
                                            options={tagSelectOptions}
                                            value={watchTags}
                                            onValueChange={handleTagChange}
                                            placeholder="Select tags"
                                            label="Tags"
                                            error={errors.tags?.message}
                                            maxSelected={10}
                                            searchable
                                            clearable
                                            required={!isUpdateMode}
                                        />
                                        <MultiSelectField
                                            options={healthConditionOptions}
                                            value={watchHealthCondition}
                                            onValueChange={handleHealthConditionChange}
                                            placeholder="Select health conditions"
                                            label="Health Conditions"
                                            error={errors.health_condition?.message}
                                            maxSelected={10}
                                            searchable
                                            clearable
                                            required={!isUpdateMode}
                                        />
                                    </div>
                                </section>

                                <Separator className="my-8"/>

                                <section className="space-y-6">
                                    <header className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Tags className="w-5 h-5 text-purple-600"/>
                                            </div>
                                            <h2 className="text-lg font-semibold">Product Variations</h2>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddVariation}
                                            className="hover:bg-blue-50 hover:border-blue-200"
                                        >
                                            <Plus className="w-4 h-4 mr-2"/>
                                            Add Variation
                                        </Button>
                                    </header>

                                    <div className="space-y-4">
                                        {fields.map((field, index) => {
                                            const currentSizeUnit = watch(`variations.${index}.size_unit`)

                                            return (
                                                <div
                                                    key={field.id}
                                                    className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                                >
                                                    <header className="flex items-center justify-between mb-6">
                                                        <h3 className="font-medium text-slate-700 flex items-center gap-2">
                                                            <span
                                                                className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center justify-center font-semibold">
                                                                {index + 1}
                                                            </span>
                                                            Variation {index + 1}
                                                        </h3>
                                                        {fields.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={handleRemoveVariation(index)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <X className="w-4 h-4"/>
                                                            </Button>
                                                        )}
                                                    </header>

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        <TextInputField
                                                            label="Variation Name"
                                                            {...register(`variations.${index}.name`)}
                                                            error={errors.variations?.[index]?.name?.message}
                                                            placeholder="Enter variation name"
                                                            required
                                                            autoComplete="off"
                                                        />
                                                        <TextInputField
                                                            label="Quantity"
                                                            {...register(`variations.${index}.size_value`, {
                                                                valueAsNumber: true
                                                            })}
                                                            error={errors.variations?.[index]?.size_value?.message}
                                                            placeholder="Enter size"
                                                            type="number"
                                                            required
                                                        />
                                                        <SearchSelectField
                                                            label="Size Unit"
                                                            placeholder="Select unit"
                                                            options={productUnits.map((unit: any) => ({
                                                                value: unit.value,
                                                                label: unit.label || unit.value
                                                            }))}
                                                            value={currentSizeUnit}
                                                            onChange={handleSizeUnitChange(index)}
                                                            error={errors.variations?.[index]?.size_unit?.message}
                                                            required
                                                        />
                                                        <TextInputField
                                                            label="Price (NRs)"
                                                            {...register(`variations.${index}.platform_price`, {
                                                                valueAsNumber: true
                                                            })}
                                                            error={errors.variations?.[index]?.platform_price?.message}
                                                            placeholder="0.00"
                                                            type="number"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>

                                <Separator className="my-8"/>

                                <footer className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={handleReset}
                                        className="sm:w-auto w-full"
                                        disabled={isSubmitting}
                                    >
                                        <XCircle className="w-4 h-4 mr-2"/>
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className={`sm:w-auto w-full ${
                                            isUpdateMode
                                                ? "bg-primaryColor hover:bg-primaryColor/90 focus:ring-primaryColor/50"
                                                : "bg-primaryColor hover:bg-primaryColor/90 focus:ring-primaryColor/50"
                                        } focus:ring-2 focus:ring-offset-2`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div
                                                    className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                                {isUpdateMode ? "Updating..." : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2"/>
                                                {isUpdateMode ? "Update Product" : "Create Product"}
                                            </>
                                        )}
                                    </Button>
                                </footer>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ProductManageForm