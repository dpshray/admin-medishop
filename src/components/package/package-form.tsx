"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import { GalleryThumbnails, Loader2, Package, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import packageService from "@/service/package.service"
import {
    CreatePackageForm,
    createPackageSchema,
    UpdatePackageForm,
    updatePackageSchema,
} from "@/lib/schema/packageSchema"
import SelectInputField from "@/components/field/select-input"

interface PackageFormProps {
    slug?: string
    mode?: "create" | "edit"
}

type PackageFormData = CreatePackageForm | UpdatePackageForm

export default function PackageForm({ slug, mode = "create" }: PackageFormProps) {
    const router = useRouter()
    const isEditMode = mode === "edit"
    const [isLoading, setIsLoading] = useState(false)

    const statusOptions = useMemo(
        () => [
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
        ],
        []
    )

    const schema = useMemo(() => (isEditMode ? updatePackageSchema : createPackageSchema), [isEditMode])

    const form = useForm<PackageFormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: "",
            price: 0,
            discount_percent: 0,
            status: false,
            description: "",
            featured_image: undefined,
            gallery_images: [],
        },
    })

    const {
        handleSubmit,
        setValue,
        reset,
        register,
        formState: { errors, isSubmitting },
    } = form

    const fetchPackageDetail = useCallback(async () => {
        if (!isEditMode || !slug) return
        setIsLoading(true)
        try {
            const response: any = await packageService.getPackageDetail(slug)
            console.log("Response", response)
            if (response) {
                const packageData = response
                reset({
                    name: packageData.name || "",
                    price: packageData.price || 0,
                    discount_percent: packageData.discount_percent || 0,
                    status: Boolean(packageData.status),
                    description: packageData.description || "",
                    featured_image: undefined,
                    gallery_images: [],
                    slug: packageData.slug || "",
                })
            }
        } catch {
            toast.error("Failed to fetch package details")
            router.push("/admin/packages")
        } finally {
            setIsLoading(false)
        }
    }, [isEditMode, slug, reset, router])

    useEffect(() => {
        fetchPackageDetail()
    }, [fetchPackageDetail])

    const onSubmit = useCallback(
        async (data: PackageFormData) => {
            try {
                console.log("Form data ")
                const response =
                    isEditMode && slug
                        ? await packageService.updatePackage(slug, data)
                        : await packageService.createPackage(data)
                if (response) {
                    toast.success(response?.message || `Package ${isEditMode ? "updated" : "created"} successfully`)
                    reset()
                    router.push("/admin/package")
                }
            } catch (error: any) {
                const errorMessage =
                    error?.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} package`
                toast.error(errorMessage)
            }
        },
        [isEditMode, reset, router, slug]
    )

    const handleFileChange = useCallback(
        (field: keyof PackageFormData, files: File[]) => {
            const file = files[0] || null
            setValue(field, file || undefined, { shouldValidate: true, shouldDirty: true })
        },
        [setValue]
    )

    const handleMultipleFilesChange = useCallback(
        (field: keyof PackageFormData, files: File[]) => {
            setValue(field, files, { shouldValidate: true, shouldDirty: true })
        },
        [setValue]
    )

    const handleCancel = useCallback(() => {
        router.push("/admin/package")
    }, [router])

    const handleStatusChange = useCallback(
        (value: string | number) => {
            setValue("status", value === 1 || value === "1", { shouldValidate: true, shouldDirty: true })
        },
        [setValue]
    )

    const handleReset = useCallback(() => {
        if (isEditMode) {
            fetchPackageDetail()
        } else {
            reset()
        }
    }, [isEditMode, fetchPackageDetail, reset])

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
            <div className="container mx-auto px-4 py-6">
                <div className="w-full mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                {isEditMode ? "Edit Package" : "Create Package"}
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-1">
                                {isEditMode ? "Update package details" : "Add new package details"}
                            </p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
                            <CardHeader className="pb-4 sm:pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">Package Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8 sm:space-y-10">
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <TextInputField
                                        {...register("name")}
                                        label="Package Name"
                                        error={errors.name?.message}
                                        required={!isEditMode}
                                        autoComplete="off"
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
                                        value={form.watch("status") ? 1 : 0}
                                    />
                                </section>

                                <section>
                                    <TextInputField
                                        {...register("description")}
                                        label="Description"
                                        textarea
                                        error={errors.description?.message}
                                        required={!isEditMode}
                                        rows={4}
                                        disabled={isSubmitting}
                                    />
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <GalleryThumbnails className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-base sm:text-lg font-semibold">Images</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <FileInputField
                                            label="Featured Image"
                                            onFileChange={handleFileChange.bind(null, "featured_image")}
                                            error={errors.featured_image?.message as string}
                                            accept="image/*"
                                            required={!isEditMode}
                                            disabled={isSubmitting}
                                        />
                                        <FileInputField
                                            label="Gallery Images"
                                            multiple
                                            onFileChange={handleMultipleFilesChange.bind(null, "gallery_images")}
                                            error={errors.gallery_images?.message as string}
                                            accept="image/*"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                        disabled={isSubmitting}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : isEditMode ? (
                                            "Update Package"
                                        ) : (
                                            "Create Package"
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
