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
import {productSchema} from "@/lib/productSchema"
import {z} from "zod"

export type ProductFormValues = z.infer<typeof productSchema>

export default function ProductForm() {
    const categories = [
        {id: 1, name: "Electronics"},
        {id: 2, name: "Clothing"},
        {id: 3, name: "Home & Garden"},
        {id: 4, name: "Sports"},
        {id: 5, name: "Books"},
    ]

    const brands = [
        {id: 1, name: "Apple"},
        {id: 2, name: "Samsung"},
        {id: 3, name: "Nike"},
        {id: 4, name: "Adidas"},
        {id: 5, name: "Sony"},
    ]

    const tags = [
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

    const defaultValues: ProductFormValues = {
        name: "",
        brand_id: brands[0].id,
        description: "",
        variations: [{size_value: 1, size_unit: "kg", platform_price: 1}],
        categories: [],
        tags: [],
        featured_image: null,
        gallery_images: [],
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
        defaultValues,
    })

    const {fields, append, remove} = useFieldArray({control, name: "variations"})
    const watchCategories = watch("categories") || []
    const watchTags = watch("tags") || []
    const watchBrandId = watch("brand_id")
    const [selectedCategories, setSelectedCategories] = useState<number[]>(watchCategories)
    const [selectedTags, setSelectedTags] = useState<number[]>(watchTags)

    useEffect(() => setSelectedCategories(watchCategories), [watchCategories])
    useEffect(() => setSelectedTags(watchTags), [watchTags])

    const handleBrandChange = (brandId: string | number) => setValue("brand_id", typeof brandId === "string" ? parseInt(brandId) : brandId, {shouldValidate: true})
    const handleCategoryChange = (categoryValues: (string | number)[]) => {
        const numericValues = categoryValues.map(v => typeof v === "string" ? parseInt(v) : v)
        setSelectedCategories(numericValues)
        setValue("categories", numericValues, {shouldValidate: true})
    }
    const handleTagChange = (tagValues: (string | number)[]) => {
        const numericValues = tagValues.map(v => typeof v === "string" ? parseInt(v) : v)
        setSelectedTags(numericValues)
        setValue("tags", numericValues, {shouldValidate: true})
    }
    const handleSizeUnitChange = (index: number, value: string | number) => setValue(`variations.${index}.size_unit`, value as string, {shouldValidate: true})
    const handleFeaturedImageChange = (files: File[]) => setValue("featured_image", files[0] ?? null, {shouldValidate: true})
    const handleGalleryImagesChange = (files: File[]) => setValue("gallery_images", files, {shouldValidate: true})

    const onSubmit = async (data: ProductFormValues) => console.log("Form data:", data)
    const handleReset = () => {
        reset(defaultValues);
        setSelectedCategories([]);
        setSelectedTags([])
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Product</h1>
                            <p className="text-slate-600 mt-1">Add a new product to your inventory with detailed
                                information</p>
                        </div>
                    </div>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg"><Package
                                        className="w-5 h-5 text-blue-600"/></div>
                                    <CardTitle className="text-xl">Product Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TextInputField {...register("name")} label="Product Name"
                                                    placeholder="Enter product name" error={errors.name?.message}
                                                    required/>
                                    <SearchSelectField options={brands.map(b => ({value: b.id, label: b.name}))}
                                                       value={watchBrandId || ""} onChangeAction={handleBrandChange}
                                                       placeholder="Select Brand" label="Brand"
                                                       error={errors.brand_id?.message} required/>
                                </div>

                                <TextInputField {...register("description")} textarea label="Product Description"
                                                placeholder="Enter detailed product description"
                                                error={errors.description?.message} className="min-h-[100px]"/>

                                <Separator className="my-8"/>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-orange-100 rounded-lg"><Package
                                            className="w-5 h-5 text-orange-600"/></div>
                                        <h3 className="text-lg font-semibold">Product Images</h3>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <FileInputField label="Featured Image" accept="image/*" multiple={false}
                                                        onFileChange={handleFeaturedImageChange}
                                                        error={errors.featured_image?.message} showPreviews
                                                        maxFileSize={5 * 1024 * 1024}/>
                                        <FileInputField label="Gallery Images" accept="image/*" multiple
                                                        onFileChange={handleGalleryImagesChange}
                                                        error={errors.gallery_images?.message} showPreviews
                                                        maxFileSize={5 * 1024 * 1024} required/>
                                    </div>
                                </div>

                                <Separator className="my-8"/>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg"><Layers
                                            className="w-5 h-5 text-green-600"/></div>
                                        <h3 className="text-lg font-semibold">Categories & Tags</h3>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <MultiSelectField options={categories.map(c => ({value: c.id, label: c.name}))}
                                                          value={selectedCategories}
                                                          onValueChange={handleCategoryChange}
                                                          placeholder="Select categories" label="Categories"
                                                          error={errors.categories?.message} maxSelected={3} searchable
                                                          clearable required/>
                                        <MultiSelectField options={tags.map(t => ({value: t.id, label: t.name}))}
                                                          value={selectedTags} onValueChange={handleTagChange}
                                                          placeholder="Select tags" label="Tags"
                                                          error={errors.tags?.message} maxSelected={5} searchable
                                                          clearable required/>
                                    </div>
                                </div>

                                <Separator className="my-8"/>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg"><Tags
                                                className="w-5 h-5 text-purple-600"/></div>
                                            <h3 className="text-lg font-semibold">Product Variations</h3>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({
                                            size_value: 1,
                                            size_unit: "kg",
                                            platform_price: 1
                                        })} className="hover:bg-blue-50 hover:border-blue-200">
                                            <Plus className="w-4 h-4 mr-2"/> Add Variation
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id}
                                                 className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="font-medium text-slate-700 flex items-center gap-2">
                                                        <span
                                                            className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center justify-center font-semibold">{index + 1}</span>
                                                        Variation {index + 1}
                                                    </h4>
                                                    {fields.length > 1 &&
                                                        <Button type="button" variant="ghost" size="sm"
                                                                onClick={() => remove(index)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"><X
                                                            className="w-4 h-4"/></Button>}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <TextInputField
                                                        label="Size Value" {...register(`variations.${index}.size_value`, {valueAsNumber: true})}
                                                        error={errors.variations?.[index]?.size_value?.message}
                                                        placeholder="Enter size" type="number" step="0.01" min="1"
                                                        required/>
                                                    <SelectInputField label="Size Unit" placeholder="Select unit"
                                                                      options={sizeUnits.map(unit => ({
                                                                          value: unit.id,
                                                                          label: unit.name
                                                                      }))}
                                                                      value={watch(`variations.${index}.size_unit`)}
                                                                      onChangeAction={(val: string | number) => handleSizeUnitChange(index, val)}
                                                                      error={errors.variations?.[index]?.size_unit?.message}
                                                                      required/>
                                                    <TextInputField
                                                        label="Price ($)" {...register(`variations.${index}.platform_price`, {valueAsNumber: true})}
                                                        error={errors.variations?.[index]?.platform_price?.message}
                                                        placeholder="0.00" type="number" step="0.01" min="1" required/>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-8"/>

                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" size="lg" onClick={handleReset}
                                            className="sm:w-auto w-full"><XCircle
                                        className="w-4 h-4 mr-2"/> Reset</Button>
                                    <Button type="submit" size="lg" disabled={isSubmitting}
                                            className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700">
                                        {isSubmitting ? <>
                                            <div
                                                className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                            Creating...</> : <><Save className="w-4 h-4 mr-2"/>Create Product</>}
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
