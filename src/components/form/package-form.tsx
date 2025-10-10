"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import { Boxes, Clock, GalleryThumbnails, Loader2, Package, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import packageService from "@/service/package.service"
import {
    CreatePackageForm,
    createPackageSchema,
    UpdatePackageForm,
    updatePackageSchema
} from "@/lib/schema/packageSchema"
import SelectInputField from "@/components/field/select-input"
import DatePickerField from "@/components/field/date-picker"

interface PackageFormProps {
    slug?: string
    mode?: "create" | "edit"
}

type PackageFormData = CreatePackageForm | UpdatePackageForm

export default function PackageForm({ slug, mode = "create" }: PackageFormProps) {
    const router = useRouter()
    const isEditMode = mode === "edit"
    const [isLoading, setIsLoading] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()

    const statusOptions = useMemo(() => [
        { value: 1, label: "Active" },
        { value: 0, label: "Inactive" }
    ], [])

    const schema = useMemo(() => isEditMode ? updatePackageSchema : createPackageSchema, [isEditMode])

    const form = useForm<PackageFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            price: 0,
            discount_percent: 0,
            status: false,
            description: "",
            start_timestamps: "",
            end_timestamps: "",
            products: [{ product_variation_id: 0, quantity: 1 }],
            featured_image: undefined,
            gallery_images: [],
        },
    })

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        register,
        formState: { errors, isSubmitting },
    } = form

    const { fields, append, remove } = useFieldArray({ control, name: "products" })

    const fetchPackageDetail = useCallback(async () => {
        if (!isEditMode || !slug) return

        setIsLoading(true)
        try {
            const response: any = await packageService.getPackageDetail(slug)

            if (response?.data) {
                const packageData = response.data

                const startTimestamp = packageData.start_timestamps
                    ? new Date(packageData.start_timestamps)
                    : undefined
                const endTimestamp = packageData.end_timestamps
                    ? new Date(packageData.end_timestamps)
                    : undefined

                setStartDate(startTimestamp)
                setEndDate(endTimestamp)

                reset({
                    name: packageData.name || "",
                    price: packageData.price || 0,
                    discount_percent: packageData.discount_percent || 0,
                    status: packageData.status || false,
                    description: packageData.description || "",
                    start_timestamps: packageData.start_timestamps || "",
                    end_timestamps: packageData.end_timestamps || "",
                    products: packageData.products?.length > 0
                        ? packageData.products
                        : [{ product_variation_id: 0, quantity: 1 }],
                    featured_image: undefined,
                    gallery_images: [],
                    slug: packageData.slug || "",
                })
            }
        } catch (error) {
            toast.error("Failed to fetch package details")
            console.error("Fetch error:", error)
            router.push("/admin/packages")
        } finally {
            setIsLoading(false)
        }
    }, [isEditMode, slug, reset, router])

    useEffect(() => {
        fetchPackageDetail()
    }, [fetchPackageDetail])

    const onSubmit = useCallback(async (data: PackageFormData) => {
        console.log("=== Form Data Before Submission ===")
        console.log("Raw form data:", data)

        try {
            const response = isEditMode && slug
                ? await packageService.updatePackage(slug, data)
                : await packageService.createPackage(data)

            if (response) {
                toast.success(response?.message || `Package ${isEditMode ? "updated" : "created"} successfully`)
                router.push("/admin/packages")
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} package`
            toast.error(errorMessage)
            console.error("Form submission error:", error)
        }
    }, [isEditMode, slug, router])

    const handleFileChange = useCallback((field: keyof PackageFormData, files: File[]) => {
        const file = files[0] || null
        setValue(field, file || undefined, { shouldValidate: true, shouldDirty: true })
    }, [setValue])

    const handleMultipleFilesChange = useCallback((field: keyof PackageFormData, files: File[]) => {
        setValue(field, files, { shouldValidate: true, shouldDirty: true })
    }, [setValue])

    const handleCancel = useCallback(() => {
        router.push("/admin/packages")
    }, [router])

    const handleStatusChange = useCallback((value: string | number) => {
        setValue("status", value === 1 || value === "1", { shouldValidate: true, shouldDirty: true })
    }, [setValue])

    const handleStartDateChange = useCallback((date: Date | undefined) => {
        setStartDate(date)
        setValue("start_timestamps", date?.toISOString() || "", { shouldValidate: true, shouldDirty: true })
    }, [setValue])

    const handleEndDateChange = useCallback((date: Date | undefined) => {
        setEndDate(date)
        setValue("end_timestamps", date?.toISOString() || "", { shouldValidate: true, shouldDirty: true })
    }, [setValue])

    const handleReset = useCallback(() => {
        if (isEditMode) {
            fetchPackageDetail()
        } else {
            reset()
            setStartDate(undefined)
            setEndDate(undefined)
        }
    }, [isEditMode, fetchPackageDetail, reset])

    const handleAddProduct = useCallback(() => {
        append({ product_variation_id: 0, quantity: 1 })
    }, [append])

    const handleRemoveProduct = useCallback((index: number) => {
        if (fields.length > 1) {
            remove(index)
        }
    }, [remove, fields.length])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-600">Loading package details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                {isEditMode ? "Edit Package" : "Create Package"}
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-1">
                                {isEditMode ? "Update package details and products" : "Add new package details and assign products"}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            aria-label="Cancel and go back"
                        >
                            <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                            Cancel
                        </Button>
                    </div>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
                            <CardHeader className="pb-4 sm:pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg" aria-hidden="true">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">Package Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8 sm:space-y-10">
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" aria-label="Basic package information">
                                    <TextInputField
                                        {...register("name")}
                                        label="Package Name"
                                        error={errors.name?.message}
                                        required={!isEditMode}
                                        autoComplete="off"
                                        aria-required={!isEditMode}
                                        disabled={isSubmitting}
                                    />
                                    <TextInputField
                                        {...register("price", { valueAsNumber: true })}
                                        label="Price"
                                        type="number"
                                        error={errors.price?.message}
                                        required={!isEditMode}
                                        min="0"
                                        step="0.01"
                                        autoComplete="off"
                                        aria-required={!isEditMode}
                                        disabled={isSubmitting}
                                    />
                                    <TextInputField
                                        {...register("discount_percent", { valueAsNumber: true })}
                                        label="Discount Percent"
                                        type="number"
                                        error={errors.discount_percent?.message}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        autoComplete="off"
                                        disabled={isSubmitting}
                                    />
                                    <SelectInputField
                                        label="Status"
                                        placeholder="Select Status"
                                        options={statusOptions}
                                        onChangeAction={handleStatusChange}
                                        disabled={isSubmitting}
                                    />
                                </section>

                                <section aria-label="Package description">
                                    <TextInputField
                                        {...register("description")}
                                        label="Description"
                                        textarea
                                        error={errors.description?.message}
                                        required={!isEditMode}
                                        rows={4}
                                        aria-required={!isEditMode}
                                        disabled={isSubmitting}
                                    />
                                </section>

                                <section aria-label="Package duration">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                        <h2 className="text-base sm:text-lg font-semibold">Package Duration</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <DatePickerField
                                            label="Start Date & Time"
                                            placeholder="Choose start date and time"
                                            value={startDate}
                                            onChangeAction={handleStartDateChange}
                                            showTime={true}
                                            timeFormat="24h"
                                            error={errors.start_timestamps?.message}
                                            required={!isEditMode}
                                            disabled={isSubmitting}
                                            helperText="Select when the package starts"
                                        />
                                        <DatePickerField
                                            label="End Date & Time"
                                            placeholder="Choose end date and time"
                                            value={endDate}
                                            onChangeAction={handleEndDateChange}
                                            showTime={true}
                                            timeFormat="24h"
                                            error={errors.end_timestamps?.message}
                                            required={!isEditMode}
                                            disabled={isSubmitting}
                                            minDate={startDate}
                                            helperText="Select when the package ends"
                                        />
                                    </div>
                                </section>

                                <section aria-label="Package products">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Boxes className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                        <h2 className="text-base sm:text-lg font-semibold">Products</h2>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-end p-3 sm:p-4 bg-slate-50 rounded-lg"
                                                role="group"
                                                aria-label={`Product ${index + 1}`}
                                            >
                                                <TextInputField
                                                    {...register(`products.${index}.product_variation_id`, { valueAsNumber: true })}
                                                    label="Product Variation ID"
                                                    type="number"
                                                    error={errors.products?.[index]?.product_variation_id?.message}
                                                    min="0"
                                                    autoComplete="off"
                                                    disabled={isSubmitting}
                                                />
                                                <TextInputField
                                                    {...register(`products.${index}.quantity`, { valueAsNumber: true })}
                                                    label="Quantity"
                                                    type="number"
                                                    error={errors.products?.[index]?.quantity?.message}
                                                    min="1"
                                                    autoComplete="off"
                                                    disabled={isSubmitting}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                                                    disabled={fields.length === 1 || isSubmitting}
                                                    aria-label={`Remove product ${index + 1}`}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleAddProduct}
                                            aria-label="Add another product"
                                            disabled={isSubmitting}
                                        >
                                            Add Product
                                        </Button>
                                    </div>
                                </section>

                                <section aria-label="Package images">
                                    <div className="flex items-center gap-2 mb-4">
                                        <GalleryThumbnails className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                        <h2 className="text-base sm:text-lg font-semibold">Images</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <FileInputField
                                            label="Featured Image"
                                            onFileChange={handleFileChange.bind(null, "featured_image")}
                                            error={errors.featured_image?.message as string}
                                            accept="image/*"
                                            aria-label="Upload featured image"
                                            required={!isEditMode}
                                            disabled={isSubmitting}
                                        />
                                        <FileInputField
                                            label="Gallery Images"
                                            multiple
                                            onFileChange={handleMultipleFilesChange.bind(null, "gallery_images")}
                                            error={errors.gallery_images?.message as string}
                                            accept="image/*"
                                            aria-label="Upload gallery images"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                                        disabled={isSubmitting}
                                        aria-label="Reset form to default values"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                                        disabled={isSubmitting}
                                        aria-label={isSubmitting ? "Submitting form" : "Submit form"}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            isEditMode ? "Update Package" : "Create Package"
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