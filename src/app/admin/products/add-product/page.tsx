"use client"

import {useFieldArray, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Layers, Package, Plus, Save, Tags, X, XCircle} from "lucide-react"
import {useEffect, useState} from "react"
import SearchSelectField from "@/components/field/search-select"
import TextInputField from "@/components/field/text-input"
import SelectInputField from "@/components/field/select-input"
import MultiSelectField from "@/components/field/multi-select-input"
import FileInputField from "@/components/field/file-input"
import {ProductFormValues} from "@/lib/productSchema"
import {z} from "zod"

// Define schemas
export const variationSchema = z.object({
    size_value: z.number().min(1, "Size is required"),
    size_unit: z.string().min(1, "Unit is required"),
    platform_price: z.number().min(1, "Price is required"),
})

export const productSchema = z.object({
    brand_id: z.number(),
    name: z.string().min(2, "Name is required"),
    description: z.string(),
    categories: z.array(z.number()).min(1, "Select at least one category"),
    tags: z.array(z.number()).min(1, "Select at least one tag"),
    variations: z.array(variationSchema).min(1, "Add at least one variation"),
    featured_image: z.instanceof(File).nullable().optional(),
    gallery_images: z.array(z.instanceof(File)).min(1, "Add at least one image"),
})

export type ProductFormValues = z.infer<typeof productSchema>

interface Brand {
    id: number
    name: string
}

interface Category {
    id: number
    name: string
}

interface Tag {
    id: number
    name: string
}

interface ProductFormProps {
    mode?: 'create' | 'edit'
    initialData?: Partial<ProductFormValues>
    onSubmit: (data: ProductFormValues) => Promise<void>
    onCancel?: () => void
}

export default function ProductForm({
                                        mode = 'create',
                                        initialData,
                                        onSubmit: onSubmitProp,
                                        onCancel
                                    }: ProductFormProps) {
    const categories: Category[] = [
        {id: 1, name: "Electronics"},
        {id: 2, name: "Clothing"},
        {id: 3, name: "Home & Garden"},
        {id: 4, name: "Sports"},
        {id: 5, name: "Books"},
    ]

    const brands: Brand[] = [
        {id: 1, name: "Apple"},
        {id: 2, name: "Samsung"},
        {id: 3, name: "Nike"},
        {id: 4, name: "Adidas"},
        {id: 5, name: "Sony"},
    ]

    const tags: Tag[] = [
        {id: 1, name: "Premium"},
        {id: 2, name: "Organic"},
        {id: 3, name: "Limited Edition"},
        {id: 4, name: "Bestseller"},
        {id: 5, name: "New Arrival"},
        {id: 6, name: "Sale"},
    ]

    const sizeUnits = [
        {id: "kg", name: "Kilogram"},
        {id: "lb", name: "Pound"},
        {id: "oz", name: "Ounce"},
        {id: "g", name: "Gram"},
        {id: "ml", name: "Milliliter"},
        {id: "l", name: "Liter"},
    ]

    // Set up default values based on mode
    const getDefaultValues = (): Partial<ProductFormValues> => {
        if (mode === 'edit' && initialData) {
            return {
                ...initialData,
                variations: initialData.variations?.length
                    ? initialData.variations
                    : [{size_value: 1, size_unit: "kg", platform_price: 1}],
                categories: initialData.categories || [],
                tags: initialData.tags || [],
                gallery_images: initialData.gallery_images || [],
            }
        }

        return {
            variations: [{size_value: 1, size_unit: "kg", platform_price: 1}],
            categories: [],
            tags: [],
            description: "",
            gallery_images: [],
        }
    }

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors, isSubmitting}
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: getDefaultValues(),
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: "variations"
    })

    const watchCategories = watch("categories") || []
    const watchTags = watch("tags") || []
    const watchBrandId = watch("brand_id")

    const [selectedCategories, setSelectedCategories] = useState<number[]>(watchCategories)
    const [selectedTags, setSelectedTags] = useState<number[]>(watchTags)

    useEffect(() => {
        setSelectedCategories(watchCategories)
    }, [watchCategories])

    useEffect(() => {
        setSelectedTags(watchTags)
    }, [watchTags])

    // Initialize form with data for edit mode
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            Object.entries(initialData).forEach(([key, value]) => {
                if (key === 'categories' || key === 'tags') {
                    setValue(key as keyof ProductFormValues, value as any, {shouldValidate: true})
                } else if (key !== 'variations') {
                    setValue(key as keyof ProductFormValues, value as any, {shouldValidate: true})
                }
            })
        }
    }, [mode, initialData, setValue])

    const handleBrandChange = (brandId: string | number) => {
        const parsed = typeof brandId === "string" ? parseInt(brandId) : brandId
        setValue("brand_id", parsed, {shouldValidate: true})
    }

    const handleCategoryChange = (categoryValues: (string | number)[]) => {
        const numericValues = categoryValues.map(v =>
            typeof v === "string" ? parseInt(v) : v
        )
        setSelectedCategories(numericValues)
        setValue("categories", numericValues, {shouldValidate: true})
    }

    const handleTagChange = (tagValues: (string | number)[]) => {
        const numericValues = tagValues.map(v =>
            typeof v === "string" ? parseInt(v) : v
        )
        setSelectedTags(numericValues)
        setValue("tags", numericValues, {shouldValidate: true})
    }

    const handleSizeUnitChange = (index: number, value: string | number) => {
        setValue(`variations.${index}.size_unit`, value as string, {
            shouldValidate: true
        })
    }

    const handleFeaturedImageChange = (files: File[]) => {
        const file = files[0] ?? null
        setValue("featured_image", file, {shouldValidate: true})
        console.log('Featured Image:', file)
    }

    const handleGalleryImagesChange = (files: File[]) => {
        setValue("gallery_images", files, {shouldValidate: true})
    }

    const onSubmit = async (data: ProductFormValues) => {
        try {
            await onSubmitProp(data)
            console.log("Form data:", data)
        } catch (error) {
            console.error("Error submitting form:", error)
        }
    }

    const handleReset = () => {
        reset(getDefaultValues())
        setSelectedCategories(initialData?.categories || [])
        setSelectedTags(initialData?.tags || [])
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {mode === 'edit' ? 'Edit Product' : 'Create Product'}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {mode === 'edit'
                                    ? 'Update product information and details'
                                    : 'Add a new product to your inventory with detailed information'
                                }
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                            >
                                <XCircle className="w-4 h-4 mr-2"/>
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600"/>
                                    </div>
                                    <CardTitle className="text-xl">Product Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TextInputField
                                        {...register("name")}
                                        label="Product Name"
                                        placeholder="Enter product name"
                                        error={errors.name?.message}
                                        required
                                    />
                                    <SearchSelectField
                                        options={brands.map((b) => ({value: b.id, label: b.name}))}
                                        value={watchBrandId || ""}
                                        onChangeAction={handleBrandChange}
                                        placeholder="Select Brand"
                                        label="Brand"
                                        error={errors.brand_id?.message}
                                        disabled={false}
                                        required
                                    />
                                </div>

                                <TextInputField
                                    {...register("description")}
                                    textarea
                                    label="Product Description"
                                    placeholder="Enter detailed product description"
                                    error={errors.description?.message}
                                    className="min-h-[100px]"
                                />

                                <Separator className="my-8"/>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Package className="w-5 h-5 text-orange-600"/>
                                        </div>
                                        <h3 className="text-lg font-semibold">Product Images</h3>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <FileInputField
                                            label="Featured Image"
                                            accept="image/*"
                                            multiple={false}
                                            onFileChange={handleFeaturedImageChange}
                                            error={errors.featured_image?.message}
                                            showPreviews={true}
                                            maxFileSize={5 * 1024 * 1024}
                                        />
                                        <FileInputField
                                            label="Gallery Images"
                                            accept="image/*"
                                            multiple={true}
                                            onFileChange={handleGalleryImagesChange}
                                            error={errors.gallery_images?.message}
                                            showPreviews={true}
                                            maxFileSize={5 * 1024 * 1024}
                                            required
                                        />
                                    </div>
                                </div>

                                <Separator className="my-8"/>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Layers className="w-5 h-5 text-green-600"/>
                                        </div>
                                        <h3 className="text-lg font-semibold">Categories & Tags</h3>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <MultiSelectField
                                            options={categories.map((c) => ({value: c.id, label: c.name}))}
                                            value={selectedCategories}
                                            onValueChange={handleCategoryChange}
                                            placeholder="Select categories"
                                            label="Categories"
                                            error={errors.categories?.message}
                                            maxSelected={3}
                                            searchable
                                            clearable
                                            required
                                        />
                                        <MultiSelectField
                                            options={tags.map((t) => ({value: t.id, label: t.name}))}
                                            value={selectedTags}
                                            onValueChange={handleTagChange}
                                            placeholder="Select tags"
                                            label="Tags"
                                            error={errors.tags?.message}
                                            maxSelected={5}
                                            searchable
                                            clearable
                                            required
                                        />
                                    </div>
                                </div>

                                <Separator className="my-8"/>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Tags className="w-5 h-5 text-purple-600"/>
                                            </div>
                                            <h3 className="text-lg font-semibold">Product Variations</h3>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({size_value: 1, size_unit: "kg", platform_price: 1})}
                                            className="hover:bg-blue-50 hover:border-blue-200"
                                        >
                                            <Plus className="w-4 h-4 mr-2"/>
                                            Add Variation
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id}
                                                 className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="font-medium text-slate-700 flex items-center gap-2">
                                                        <span
                                                            className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center justify-center font-semibold">
                                                            {index + 1}
                                                        </span>
                                                        Variation {index + 1}
                                                    </h4>
                                                    {fields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => remove(index)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4"/>
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <TextInputField
                                                        label="Size Value"
                                                        {...register(`variations.${index}.size_value`, {
                                                            valueAsNumber: true
                                                        })}
                                                        error={errors.variations?.[index]?.size_value?.message}
                                                        placeholder="Enter size"
                                                        type="number"
                                                        step="0.01"
                                                        min="1"
                                                        required
                                                    />

                                                    <SelectInputField
                                                        label="Size Unit"
                                                        placeholder="Select unit"
                                                        options={sizeUnits.map((unit) => ({
                                                            value: unit.id,
                                                            label: unit.name
                                                        }))}
                                                        value={watch(`variations.${index}.size_unit`)}
                                                        onChangeAction={(val: string | number) =>
                                                            handleSizeUnitChange(index, val)
                                                        }
                                                        error={errors.variations?.[index]?.size_unit?.message}
                                                        required
                                                    />

                                                    <TextInputField
                                                        label="Price ($)"
                                                        {...register(`variations.${index}.platform_price`, {
                                                            valueAsNumber: true
                                                        })}
                                                        error={errors.variations?.[index]?.platform_price?.message}
                                                        placeholder="0.00"
                                                        type="number"
                                                        step="0.01"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-8"/>

                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={handleReset}
                                        className="sm:w-auto w-full"
                                    >
                                        <XCircle className="w-4 h-4 mr-2"/>
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div
                                                    className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                                {mode === 'edit' ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2"/>
                                                {mode === 'edit' ? 'Update Product' : 'Create Product'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}