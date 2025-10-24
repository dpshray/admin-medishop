'use client'

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import Image from "next/image"
import { cn } from "@/lib/utils"

const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100, "Category name must be less than 100 characters"),
    discount_percent: z.string().optional(),
    image: z.instanceof(File).optional(),
})

const updateCategorySchema = z.object({
    name: z.string().max(100, "Category name must be less than 100 characters").optional(),
    discount_percent: z.string().optional(),
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
        discount_percent?: string
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
        formState: { errors, isSubmitting }
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(isEditMode ? updateCategorySchema : createCategorySchema),
        defaultValues: { name: "", image: undefined }
    })

    const disabled = isLoading || isSubmitting

    useEffect(() => {
        if (open && initialData) {
            reset({ name: initialData.name, image: undefined })
        } else if (open && !initialData) {
            reset({ name: "", image: undefined })
        }
    }, [open, initialData, reset])

    const handleDialogChange = (isOpen: boolean) => {
        if (!isOpen && !disabled) onCloseAction()
    }

    const handleFormSubmit = async (data: CategoryFormValues) => {
        await onSubmitAction(data)
    }

    const handleFileChange = (files: File[]) => {
        setValue("image", files[0] || undefined)
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] flex flex-col overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {isEditMode ? "Edit Category" : "Create New Category"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <TextInputField
                        {...register("name")}
                        label="Category Name"
                        placeholder="Enter category name"
                        error={errors.name?.message}
                        disabled={disabled}
                        required={!isEditMode}
                    />
                    <TextInputField
                        {...register("discount_percent")}
                        label="Discount Percent"
                        placeholder="Enter discount percent"
                        error={errors.discount_percent?.message}
                        disabled={disabled}
                    />
                    <FileInputField
                        label={`Category Image${isEditMode ? " (Optional)" : ""}`}
                        accept="image/*"
                        disabled={disabled}
                        onFileChange={handleFileChange}
                        error={errors.image?.message as string}
                    />
                    {initialData?.image && isEditMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Current Image</label>
                            <div className="relative w-28 h-28 border border-gray-200 rounded-lg overflow-hidden">
                                <Image
                                    width={100}
                                    height={100}
                                    src={initialData.image}
                                    alt="Current category image"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onCloseAction} disabled={disabled}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={disabled} className={cn("bg-primaryColor hover:bg-primaryColor/80")}>
                            {disabled ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
