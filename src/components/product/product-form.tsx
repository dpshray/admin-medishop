"use client";

import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Edit, Layers, Package, Plus, Save, Tags, X, XCircle,} from "lucide-react";
import {useCallback, useEffect, useState} from "react";
import SearchSelectField from "@/components/field/search-select";
import TextInputField from "@/components/field/text-input";
import SelectInputField from "@/components/field/select-input";
import MultiSelectField from "@/components/field/multi-select-input";
import FileInputField from "@/components/field/file-input";
import {ProductFormValues, productSchema, UpdateProductFormValues, updateProductSchema,} from "@/lib/productSchema";
import {useBrands, useCategories, useTags} from "@/hooks/all-hook";
import productService from "@/service/product.service";
import {toast} from "sonner";

interface ProductFormProps {
    mode?: "create" | "edit";
    productUuid?: string;
    initialData?: Partial<ProductFormValues>;
    onSuccess?: () => void;
}

export default function ProductManageForm({
                                              mode = "create",
                                              productUuid,
                                              initialData,
                                              onSuccess,
                                          }: ProductFormProps) {
    const {categories} = useCategories();
    const {tags} = useTags();
    const {brands} = useBrands();
    const isUpdateMode = mode === "edit";

    const categoriesOptions = categories.map((c) => ({
        id: c.id,
        name: c.name,
    }));
    const tagsOptions = tags.map((t) => ({id: t.id, name: t.name}));
    const brandsOptions = brands.map((b) => ({id: b.id, name: b.name}));

    const sizeUnits = [
        {id: "kg", name: "Kilogram"},
        {id: "lb", name: "Pound"},
        {id: "oz", name: "Ounce"},
        {id: "g", name: "Gram"},
        {id: "ml", name: "Milliliter"},
        {id: "l", name: "Liter"},
    ];

    const createDefaultValues: ProductFormValues = {
        name: "",
        brand_id: 0,
        description: "",
        variations: [{size_value: 1, size_unit: "kg", platform_price: 1}],
        categories: [],
        tags: [],
        featured_image: null,
        gallery_images: [],
    };

    const updateDefaultValues: Partial<UpdateProductFormValues> = {
        name: initialData?.name,
        brand_id: initialData?.brand_id,
        description: initialData?.description,
        variations: initialData?.variations,
        categories: initialData?.categories,
        tags: initialData?.tags,
        featured_image: initialData?.featured_image,
        gallery_images: initialData?.gallery_images,
    };

    const defaultValues = isUpdateMode ? updateDefaultValues : createDefaultValues;
    const schema = isUpdateMode ? updateProductSchema : productSchema;

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<ProductFormValues | UpdateProductFormValues>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const {fields, append, remove} = useFieldArray({
        control,
        name: "variations",
    });

    const watchCategories = watch("categories") || [];
    const watchTags = watch("tags") || [];
    const watchBrandId = watch("brand_id");

    const [isLoading, setIsLoading] = useState(false);

    const fetchProductData = useCallback(async () => {
        if (!productUuid || !isUpdateMode) return;
        try {
            setIsLoading(true);
            const response = await productService.getSingleProduct(productUuid);
            if (response && response.data) {
                const productData = response.data;

                setValue("name", productData.name || "");
                setValue("brand_id", productData.brand_id || 0);
                setValue("description", productData.description || "");
                setValue(
                    "variations",
                    productData.variations || [
                        {size_value: 1, size_unit: "kg", platform_price: 1},
                    ]
                );
                setValue("categories", productData.categories || []);
                setValue("tags", productData.tags || []);
                setValue("featured_image", productData.featured_image || null);
                setValue("gallery_images", productData.gallery_images || []);
            }
        } catch (error) {
            toast.error("Failed to fetch product data");
            console.error("Error fetching product data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [productUuid, isUpdateMode, setValue]);

    useEffect(() => {
        if (isUpdateMode && productUuid) {
            fetchProductData();
        }
    }, [fetchProductData, isUpdateMode, productUuid]);

    const handleBrandChange = (brandId: string | number) =>
        setValue("brand_id", typeof brandId === "string" ? parseInt(brandId) : brandId, {
            shouldValidate: true,
        });

    const handleCategoryChange = (values: (string | number)[]) => {
        const numeric = values.map((v) => (typeof v === "string" ? parseInt(v) : v));
        setValue("categories", numeric, {shouldValidate: true});
    };

    const handleTagChange = (values: (string | number)[]) => {
        const numeric = values.map((v) => (typeof v === "string" ? parseInt(v) : v));
        setValue("tags", numeric, {shouldValidate: true});
    };

    const handleSizeUnitChange = (index: number, value: string | number) =>
        setValue(`variations.${index}.size_unit`, value as string, {
            shouldValidate: true,
        });

    const handleFeaturedImageChange = (files: File[]) =>
        setValue("featured_image", files[0] ?? null, {shouldValidate: true});

    const handleGalleryImagesChange = (files: File[]) =>
        setValue("gallery_images", files, {shouldValidate: true});

    const onSubmit = async (data: ProductFormValues | UpdateProductFormValues) => {
        try {
            console.log("Form data:", data);
            let response: any;
            if (isUpdateMode && productUuid) {
                response = await productService.updateProduct(
                    productUuid,
                    data as UpdateProductFormValues
                );
                if (response) {
                    toast.success("Product updated successfully");
                    onSuccess?.();
                }
            } else {
                response = await productService.createProduct(data as ProductFormValues);
                if (response) {
                    toast.success("Product created successfully");
                    handleReset();
                }
            }
        } catch (error) {
            toast.error(`Error ${isUpdateMode ? "updating" : "creating"} product`);
            console.error("Error submitting form:", error);
        }
    };

    const handleReset = () => {
        reset(defaultValues);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-slate-600">Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {isUpdateMode ? "Update Product" : "Create Product"}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {isUpdateMode
                                    ? "Modify the product details and save your changes"
                                    : "Add a new product to your inventory with detailed information"}
                            </p>
                        </div>
                    </div>
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-0"
                            noValidate
                        >
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-lg ${
                                            isUpdateMode ? "bg-amber-100" : "bg-blue-100"
                                        }`}
                                    >
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TextInputField
                                        {...register("name")}
                                        label="Product Name"
                                        placeholder="Enter product name"
                                        error={errors.name?.message}
                                        required={!isUpdateMode}
                                    />
                                    <SearchSelectField
                                        options={brandsOptions.map((b) => ({
                                            value: b.id,
                                            label: b.name,
                                        }))}
                                        value={
                                            watchBrandId
                                                ? brandsOptions
                                                .map((b) => ({value: b.id, label: b.name}))
                                                .find((opt) => opt.value === watchBrandId) || null
                                                : null
                                        }
                                        onChangeAction={handleBrandChange}
                                        placeholder="Select Brand"
                                        label="Brand"
                                        error={errors.brand_id?.message}
                                        required={!isUpdateMode}
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
                                {!isUpdateMode && (
                                    <>
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
                                                    showPreviews
                                                    maxFileSize={5 * 1024 * 1024}
                                                />
                                                <FileInputField
                                                    label="Gallery Images"
                                                    accept="image/*"
                                                    multiple
                                                    onFileChange={handleGalleryImagesChange}
                                                    error={errors.gallery_images?.message}
                                                    showPreviews
                                                    maxFileSize={5 * 1024 * 1024}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
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
                                            options={categoriesOptions.map((c) => ({
                                                value: c.id,
                                                label: c.name,
                                            }))}
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
                                            options={tagsOptions.map((t) => ({
                                                value: t.id,
                                                label: t.name,
                                            }))}
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
                                    </div>
                                </div>
                                <Separator className="my-8"/>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Tags className="w-5 h-5 text-purple-600"/>
                                            </div>
                                            <h3 className="text-lg font-semibold">
                                                Product Variations
                                            </h3>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                append({
                                                    size_value: 1,
                                                    size_unit: "kg",
                                                    platform_price: 1,
                                                })
                                            }
                                            className="hover:bg-blue-50 hover:border-blue-200"
                                        >
                                            <Plus className="w-4 h-4 mr-2"/> Add Variation
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                            >
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
                                                            valueAsNumber: true,
                                                        })}
                                                        error={
                                                            errors.variations?.[index]?.size_value?.message
                                                        }
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
                                                            label: unit.name,
                                                        }))}
                                                        value={watch(`variations.${index}.size_unit`)}
                                                        onChangeAction={(val: string | number) =>
                                                            handleSizeUnitChange(index, val)
                                                        }
                                                        error={
                                                            errors.variations?.[index]?.size_unit?.message
                                                        }
                                                        required
                                                    />
                                                    <TextInputField
                                                        label="Price ($)"
                                                        {...register(`variations.${index}.platform_price`, {
                                                            valueAsNumber: true,
                                                        })}
                                                        error={
                                                            errors.variations?.[index]?.platform_price?.message
                                                        }
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
                                        <XCircle className="w-4 h-4 mr-2"/> Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className={`sm:w-auto w-full ${
                                            isUpdateMode
                                                ? "bg-amber-600 hover:bg-amber-700"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        }`}
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
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
