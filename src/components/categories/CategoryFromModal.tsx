'use client'

import {useCallback, useEffect, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import {cn} from "@/lib/utils"
import categoriesService from "@/service/(category)/categories.service"
import {toast} from "sonner"
import {Loader2} from "lucide-react"

const categorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100, "Name must be less than 100 characters"),
    discount_percent: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined
            const num = Number(val)
            return isNaN(num) ? undefined : num
        },
        z.number().min(0, "Discount must be 0 or greater").max(100, "Discount cannot exceed 100%").optional()
    ),
    menu_order: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return null
            const num = Number(val)
            return isNaN(num) ? null : num
        },
        z.number().min(0, "Menu order must be 0 or greater").nullable().optional()
    ),
    image: z.instanceof(File).optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface InitialData {
    id: number
    slug: string
    name: string
    menu_order: number
    image: string
    discount_percent: number
}

interface CategoryFormModalProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction?: () => Promise<void>
    slug?: string
    isLoading?: boolean
    initialData?: InitialData
    mode: "create" | "edit"
}

export function CategoryFormModal({
                                      open,
                                      onCloseAction,
                                      onSubmitAction,
                                      slug,
                                      isLoading = false,
                                      initialData,
                                      mode = "create"
                                  }: CategoryFormModalProps) {
    const isEditMode = mode === "edit"
    const [isFetchingData, setIsFetchingData] = useState(false)
    const [fetchedData, setFetchedData] = useState<InitialData | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined)

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting}
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: "",
            discount_percent: undefined,
            menu_order: null,
            image: undefined
        }
    })

    const disabled = isLoading || isSubmitting || isFetchingData

    const fetchCategoryData = useCallback(async () => {
        if (!slug || !open || !isEditMode) return

        setIsFetchingData(true)
        try {
            const res = await categoriesService.getCategoryBySlug(slug)
            if (res?.data) {
                setFetchedData(res.data)
            }
        } catch (error) {
            toast.error("Failed to load category data")
        } finally {
            setIsFetchingData(false)
        }
    }, [slug, open, isEditMode])

    useEffect(() => {
        if (open && isEditMode && slug && !initialData) {
            fetchCategoryData()
        }
    }, [open, isEditMode, slug, initialData, fetchCategoryData])

    useEffect(() => {
        const dataToUse = initialData || fetchedData

        if (open && dataToUse) {
            reset({
                name: dataToUse.name,
                discount_percent: dataToUse.discount_percent ?? undefined,
                menu_order: dataToUse.menu_order ?? null,
                image: undefined
            })
            setSelectedImage(undefined)
        } else if (open && !dataToUse && !isEditMode) {
            reset({
                name: "",
                discount_percent: undefined,
                menu_order: null,
                image: undefined
            })
            setSelectedImage(undefined)
        }
    }, [open, initialData, fetchedData, isEditMode, reset])

    const handleDialogChange = useCallback((isOpen: boolean) => {
        if (!isOpen && !disabled) {
            onCloseAction()
            setFetchedData(null)
            setSelectedImage(undefined)
        }
    }, [disabled, onCloseAction])

    const handleFormSubmit = useCallback(async (data: CategoryFormValues) => {
        try {
            const formDataToSubmit = {
                ...data,
                image: selectedImage
            }

            if (mode === "create") {
                const res = await categoriesService.createCategory(formDataToSubmit)
                toast.success(res?.message || "Category created successfully")
            } else {
                const dataToUse = initialData || fetchedData
                if (!dataToUse?.id) {
                    toast.error("Category ID is required for update")
                    return
                }
                const res = await categoriesService.updateCategory(dataToUse.id, formDataToSubmit)
                toast.success(res?.message || "Category updated successfully")
            }

            if (onSubmitAction) {
                await onSubmitAction()
            }

            onCloseAction()
            setFetchedData(null)
            setSelectedImage(undefined)
        } catch (error: any) {
            const errorMessage = error?.message || `Failed to ${mode} category`
            toast.error(errorMessage)
        }
    }, [mode, onSubmitAction, onCloseAction, selectedImage, initialData, fetchedData])

    const handleFileChange = useCallback((files: File[]) => {
        setSelectedImage(files[0] || undefined)
    }, [])

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] flex flex-col overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {isEditMode ? "Edit Category" : "Create New Category"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEditMode ? "Update category details below." : "Fill in the details to create a new category."}
                    </DialogDescription>
                </DialogHeader>

                {isFetchingData ? (
                    <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true"/>
                        <span className="sr-only">Loading category data...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                        <TextInputField
                            {...register("name")}
                            label="Category Name"
                            placeholder="Enter category name"
                            error={errors.name?.message}
                            disabled={disabled}
                            required
                            aria-required="true"
                        />

                        <TextInputField
                            {...register("discount_percent")}
                            type="number"
                            label="Discount Percent"
                            placeholder="Enter discount percentage (0-100)"
                            error={errors.discount_percent?.message}
                            disabled={disabled}
                            min={0}
                            max={100}
                            step="0.01"
                            aria-label="Discount percentage"
                        />

                        <TextInputField
                            {...register("menu_order")}
                            label="Menu Order"
                            type="number"
                            placeholder="Enter display order"
                            error={errors.menu_order?.message}
                            disabled={disabled}
                            min={0}
                            step={1}
                            helperText="Order in which the category appears in the menu"
                            aria-label="Menu display order"
                        />

                        <FileInputField
                            label="Category Image"
                            accept="image/*"
                            disabled={disabled}
                            onFileChange={handleFileChange}
                            error={errors.image?.message as string}
                            showPreviews
                            maxFileSize={5242880}
                            aria-label="Upload category image"
                            existingImageUrl={(initialData || fetchedData)?.image}
                        />

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCloseAction}
                                disabled={disabled}
                                className="w-full sm:w-auto"
                                aria-label="Cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={disabled}
                                className={cn(
                                    "w-full sm:w-auto bg-primaryColor hover:bg-primaryColor/90 transition-colors",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                                aria-label={isEditMode ? "Update category" : "Create category"}
                            >
                                {disabled ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true"/>
                                        Saving...
                                    </>
                                ) : isEditMode ? "Update Category" : "Create Category"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}