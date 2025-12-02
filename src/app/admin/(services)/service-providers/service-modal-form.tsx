"use client"

import * as React from "react"
import {memo, useCallback, useEffect, useMemo} from "react"
import {Controller, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import MultiSelectField from "@/components/field/multi-select-input"
import {useQuery} from "@tanstack/react-query"
import serviceCategoriesService from "@/service/(category)/service-categories.service"
import servicesTagService from "@/service/(tags)/services-tag.service"
import serviceProvider from "@/service/serivce-provider/service-provider.service"
import {ParamsType} from "@/types/types"
import {QUERY_STALE_TIME} from "@/config/app-constant";

const createServiceSchema = z.object({
    name: z.string().min(1, "Service name is required").max(200),
    is_active: z.boolean(),
    description: z.string().min(1, "Description is required"),
    test_requirements: z.string().min(1, "Test requirements are required"),
    price: z.number().min(0, "Price must be a positive number"),
    discount_percent: z.number().min(0).max(100).optional(),
    category_id: z.array(z.number()).min(1, "At least one category is required"),
    tag_id: z.array(z.number()).min(1, "At least one tag is required"),
    image: z.instanceof(File).optional()
})

const updateServiceSchema = z.object({
    name: z.string().min(1, "Service name is required").max(200).optional(),
    is_active: z.boolean().optional(),
    description: z.string().optional(),
    test_requirements: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number").optional(),
    discount_percent: z.number().min(0).max(100).optional(),
    category_id: z.array(z.number()).optional(),
    tag_id: z.array(z.number()).optional(),
    image: z.instanceof(File).optional()
})

type ServiceFormValues = z.infer<typeof createServiceSchema>

interface ServiceFormModalProps {
    open: boolean
    onCloseAction: (open: boolean) => void
    onSubmitAction?: () => void
    slug?: string
    loading?: boolean
    mode?: "create" | "edit"
}

const ServiceProviderFormModal = memo(function ServiceProviderFormModal({
                                                                            open,
                                                                            onCloseAction,
                                                                            onSubmitAction,
                                                                            slug,
                                                                            loading = false,
                                                                            mode = "create",
                                                                        }: ServiceFormModalProps) {
    const isEditMode = mode === "edit"

    const {
        register,
        handleSubmit,
        control,
        formState: {errors, isSubmitting},
        reset,
        setValue,
        watch,
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(isEditMode ? updateServiceSchema : createServiceSchema) as any,
        defaultValues: {
            name: "",
            is_active: true,
            description: "",
            test_requirements: "",
            price: 0,
            discount_percent: 0,
            category_id: [],
            tag_id: [],
            image: undefined
        },
    })

    const selectedCategories = watch("category_id")
    const selectedTags = watch("tag_id")

    const {data: serviceData} = useQuery({
        queryKey: ["service", slug],
        queryFn: async () => {
            if (!slug || !isEditMode) return null
            const response = await serviceProvider.getServiceProviderBySlug(slug)
            return response?.data
        },
        enabled: isEditMode && !!slug && open,
    })

    const {data: categoriesData} = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const params: ParamsType = {page: 1}
            const response = await serviceCategoriesService.getAllCategories(params)
            return response.items
        },
        enabled: open,
        staleTime: QUERY_STALE_TIME,
    })

    const {data: tagsData} = useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            const params: ParamsType = {page: 1}
            const response = await servicesTagService.getAllServicesTags(params)
            return response.items
        },
        enabled: open,
        staleTime: QUERY_STALE_TIME,
    })

    const categoryOptions = useMemo(() =>
            categoriesData?.map((category: any) => ({
                value: category.id,
                label: category.name
            })) || [],
        [categoriesData]
    )

    const tagOptions = useMemo(() =>
            tagsData?.map((tag: any) => ({
                value: tag.id,
                label: tag.name
            })) || [],
        [tagsData]
    )

    const handleFormSubmit = useCallback(async (data: ServiceFormValues) => {
        try {
            if (mode === 'create') {
                await serviceProvider.createServiceProvider(data)
            } else {
                console.log('Form data: ', data)
                await serviceProvider.updateServiceProvider(slug!, data)
            }

            reset()
            onCloseAction(false)
            onSubmitAction?.()
        } catch (error) {
            console.error("Failed to submit form:", error)
        }
    }, [onSubmitAction, mode, slug, reset, onCloseAction])


    const handleClose = useCallback(() => {
        if (!loading && !isSubmitting) {
            reset()
            onCloseAction(false)
        }
    }, [loading, isSubmitting, reset, onCloseAction])

    const handleImageChange = useCallback((files: File[]) => {
        setValue("image", files[0] ?? undefined, {shouldValidate: true})
    }, [setValue])

    const handleCategoryChange = useCallback((values: (string | number)[]) => {
        setValue("category_id", values as number[], {shouldValidate: true})
    }, [setValue])

    const handleTagChange = useCallback((values: (string | number)[]) => {
        setValue("tag_id", values as number[], {shouldValidate: true})
    }, [setValue])

    useEffect(() => {
        if (open && serviceData && isEditMode) {
            const categoryIds = serviceData.categories?.map((cat: any) => cat.id) || []
            const tagIds = serviceData.tags?.map((tag: any) => tag.id) || []

            reset({
                name: serviceData.name || "",
                is_active: serviceData.is_active ?? true,
                description: serviceData.description || "",
                test_requirements: serviceData.test_requirements || "",
                price: serviceData.price || 0,
                discount_percent: serviceData.discount_percent || 0,
                category_id: categoryIds,
                tag_id: tagIds,
                image: undefined,
            })
        } else if (open && !isEditMode) {
            reset({
                name: "",
                is_active: true,
                description: "",
                test_requirements: "",
                price: 0,
                discount_percent: 0,
                category_id: [],
                tag_id: [],
            })
        }
    }, [open, serviceData, isEditMode, reset, setValue])

    const isLoading = loading || isSubmitting
    const existingImageUrl = isEditMode && serviceData?.image ? serviceData.image : undefined

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="w-[95vw] max-w-2xl mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => {
                    if (isLoading) e.preventDefault()
                }}
                onEscapeKeyDown={(e) => {
                    if (isLoading) e.preventDefault()
                }}
            >
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold leading-tight">
                        {isEditMode ? "Edit Service" : "Create New Service"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-4 sm:space-y-5 mt-4"
                    noValidate
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div className="md:col-span-2">
                            <TextInputField
                                {...register("name")}
                                label="Service Name"
                                placeholder="e.g., Blood Test, X-Ray"
                                error={errors.name?.message}
                                disabled={isLoading}
                                required={!isEditMode}
                                autoComplete="off"
                            />
                        </div>

                        <TextInputField
                            {...register("price", {valueAsNumber: true})}
                            label="Price"
                            type="number"
                            placeholder="0.00"
                            error={errors.price?.message}
                            disabled={isLoading}
                            required={!isEditMode}
                            min={0}
                            step="0.01"
                        />

                        <TextInputField
                            {...register("discount_percent", {valueAsNumber: true})}
                            label="Discount (%)"
                            type="number"
                            placeholder="0"
                            error={errors.discount_percent?.message}
                            disabled={isLoading}
                            min={0}
                            max={100}
                        />

                        <div className="md:col-span-2">
                            <TextInputField
                                {...register("description")}
                                label="Description"
                                placeholder="Enter service description"
                                error={errors.description?.message}
                                disabled={isLoading}
                                required={!isEditMode}
                                rows={3}
                                textarea
                            />
                        </div>

                        <div className="md:col-span-2">
                            <TextInputField
                                {...register("test_requirements")}
                                label="Test Requirements"
                                placeholder="Enter test requirements"
                                error={errors.test_requirements?.message}
                                disabled={isLoading}
                                required={!isEditMode}
                                rows={3}
                                textarea
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({field}) => (
                                        <Checkbox
                                            id="is_active"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Active Service
                                </Label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <MultiSelectField
                                options={categoryOptions}
                                value={selectedCategories}
                                onValueChange={handleCategoryChange}
                                placeholder="Select categories"
                                label="Categories"
                                error={errors.category_id?.message}
                                searchable
                                clearable
                                required={!isEditMode}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <MultiSelectField
                                options={tagOptions}
                                value={selectedTags}
                                onValueChange={handleTagChange}
                                placeholder="Select tags"
                                label="Tags"
                                error={errors.tag_id?.message}
                                searchable
                                clearable
                                required={!isEditMode}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <FileInputField
                                label="Service Image"
                                accept="image/*"
                                error={errors.image?.message}
                                disabled={isLoading}
                                onFileChange={handleImageChange}
                                showPreviews
                                showFileList={false}
                                maxFileSize={5 * 1024 * 1024}
                                existingImageUrl={existingImageUrl}
                                helperText="Upload an image (Max 5MB)"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-primaryColor hover:bg-purple-700 disabled:opacity-50"
                            aria-busy={isLoading}
                        >
                            {isLoading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Service"
                                    : "Create Service"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
})

ServiceProviderFormModal.displayName = "ServiceProviderFormModal"

export default ServiceProviderFormModal