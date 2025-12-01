"use client"

import * as React from "react"
import { useEffect, useCallback, memo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TextInputField from "@/components/field/text-input"

const serviceCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Category name is required")
        .max(100, "Category name must be less than 100 characters")
        .trim(),
})

type ServiceCategoryFormValues = z.infer<typeof serviceCategorySchema>

interface ServiceCategoryFormModalProps {
    open: boolean
    onCloseAction: (open: boolean) => void
    onSubmitAction: (values: ServiceCategoryFormValues) => Promise<void> | void
    initialData?: ServiceCategoryFormValues
    loading?: boolean
}

const ServiceCategoryFormModal = memo(function ServiceCategoryFormModal({
                                                                            open,
                                                                            onCloseAction,
                                                                            onSubmitAction,
                                                                            initialData,
                                                                            loading = false,
                                                                        }: ServiceCategoryFormModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ServiceCategoryFormValues>({
        resolver: zodResolver(serviceCategorySchema),
        defaultValues: {
            name: "",
        },
    })

    const isEditMode = Boolean(initialData)

    const handleFormSubmit = useCallback(async (data: ServiceCategoryFormValues) => {
        try {
            await onSubmitAction(data)
            reset()
            onCloseAction(false)
        } catch (error) {
            console.error("Failed to submit form:", error)
        }
    }, [onSubmitAction, reset, onCloseAction])

    const handleClose = useCallback(() => {
        if (!loading && !isSubmitting) {
            reset()
            onCloseAction(false)
        }
    }, [loading, isSubmitting, reset, onCloseAction])

    useEffect(() => {
        if (open) {
            reset(initialData || { name: "" })
        }
    }, [open, initialData, reset])

    const isLoading = loading || isSubmitting

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="w-[95vw] max-w-[425px] sm:max-w-md md:max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => {
                    if (isLoading) e.preventDefault()
                }}
                onEscapeKeyDown={(e) => {
                    if (isLoading) e.preventDefault()
                }}
            >
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold leading-tight">
                        {isEditMode ? "Edit Service Category" : "Create New Service Category"}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-gray-500">
                        {isEditMode
                            ? "Update the details of this service category."
                            : "Create a new service category to add to your store."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-4 sm:space-y-6 mt-4"
                    noValidate
                >
                    <TextInputField
                        {...register("name")}
                        label="Category Name"
                        placeholder="e.g., Blood Pressure Monitor, Heart Rate Monitor, etc."
                        error={errors.name?.message}
                        disabled={isLoading}
                        required
                        autoComplete="off"
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className="w-full"
                    />

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-primaryColor hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                            aria-busy={isLoading}
                        >
                            {isLoading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Category"
                                    : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
})

ServiceCategoryFormModal.displayName = "ServiceCategoryFormModal"

export default ServiceCategoryFormModal