'use client'

import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import Image from "next/image"
import {cn} from "@/lib/utils"

const createCategorySchema = z.object({
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

const updateCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100, "Name must be less than 100 characters").optional(),
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

export type CategoryFormValues = z.infer<typeof createCategorySchema> | z.infer<typeof updateCategorySchema>

interface CategoryFormModalProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction: (category: CategoryFormValues) => Promise<void> | void
    slug?: string
    isLoading?: boolean
    initialData?: {
        name: string
        image?: string
        discount_percent?: number
        menu_order?: number | null
    }
}

export function CategoryFormModal({
                                      open,
                                      onCloseAction,
                                      onSubmitAction,
                                      slug,
                                      isLoading = false,
                                      initialData
                                  }: CategoryFormModalProps) {
    const isEditMode = Boolean(slug || initialData)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: {errors, isSubmitting}
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(isEditMode ? updateCategorySchema : createCategorySchema) as any,
        defaultValues: {
            name: "",
            discount_percent: undefined,
            menu_order: null,
            image: undefined
        }
    })

    const disabled = isLoading || isSubmitting

    useEffect(() => {
        if (open && initialData) {
            reset({
                name: initialData.name,
                discount_percent: initialData.discount_percent ?? undefined,
                menu_order: initialData.menu_order ?? null,
                image: undefined
            })
        } else if (open && !initialData) {
            reset({
                name: "",
                discount_percent: undefined,
                menu_order: null,
                image: undefined
            })
        }
    }, [open, initialData, reset])

    const handleDialogChange = (isOpen: boolean) => {
        if (!isOpen && !disabled) {
            onCloseAction()
        }
    }

    const handleFormSubmit = async (data: CategoryFormValues) => {
        const cleanedData = {
            ...data,
            discount_percent: data.discount_percent || undefined,
            menu_order: data.menu_order || null
        }
        await onSubmitAction(cleanedData)
    }

    const handleFileChange = (files: File[]) => {
        setValue("image", files[0] || undefined, {shouldValidate: true})
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] flex flex-col overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {isEditMode ? "Edit Category" : "Create New Category"}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {isEditMode ? "Update category details below." : "Fill in the details to create a new category."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <TextInputField
                        {...register("name")}
                        label="Category Name"
                        placeholder="Enter category name"
                        error={errors.name?.message}
                        disabled={disabled}
                        required
                    />

                    <TextInputField
                        {...register("discount_percent")}
                        type="number"
                        label="Discount Percent (Optional)"
                        placeholder="Enter discount percentage"
                        error={errors.discount_percent?.message}
                        disabled={disabled}
                        min={0}
                        max={100}
                        step="0.01"
                    />

                    <TextInputField
                        {...register("menu_order")}
                        label="Menu Order (Optional)"
                        type="number"
                        placeholder="Enter display order"
                        error={errors.menu_order?.message}
                        disabled={disabled}
                        min={0}
                        step={1}
                        helperText="Order in which the category appears in the menu"
                    />

                    <FileInputField
                        label="Category Image (Optional)"
                        accept="image/*"
                        disabled={disabled}
                        onFileChange={handleFileChange}
                        error={errors.image?.message as string}
                        showPreviews
                        maxFileSize={5000}
                    />

                    {initialData?.image && isEditMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Image</label>
                            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                                <Image
                                    width={128}
                                    height={128}
                                    src={initialData.image}
                                    alt="Current category"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCloseAction}
                            disabled={disabled}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={disabled}
                            className={cn("w-full sm:w-auto bg-primaryColor hover:bg-primaryColor/80")}
                        >
                            {disabled ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}