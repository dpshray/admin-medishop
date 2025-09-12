"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"

const formSchema = z.object({
    name: z.string().min(1, "Brand name is required").max(100, "Brand name too long"),
    image: z.any().optional(),
    is_featured: z.boolean().default(false),
    is_popular: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface BrandFormModalProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction: (data: FormValues) => Promise<void> | void
    initialData?: Partial<FormValues>
    isLoading?: boolean
}

export function BrandFormModal({
                                   open,
                                   onCloseAction,
                                   onSubmitAction,
                                   initialData,
                                   isLoading = false,
                               }: BrandFormModalProps) {
    const isEditMode = Boolean(initialData?.name)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            image: undefined,
            is_featured: false,
            is_popular: false,
        },
    })

    React.useEffect(() => {
        if (open) {
            reset({
                name: initialData?.name || "",
                image: undefined,
                is_featured: initialData?.is_featured || false,
                is_popular: initialData?.is_popular || false,
            })
        }
    }, [open, initialData, reset])

    const submitHandler = async (data: FormValues) => {
        try {
            await onSubmitAction(data)
            if (!isEditMode) {
                reset()
            }
            onCloseAction()
        } catch (error) {
            console.error("Form submission error:", error)
        }
    }

    const handleClose = () => {
        if (!isSubmitting && !isLoading) {
            reset()
            onCloseAction()
        }
    }

    const isDisabled = isSubmitting || isLoading

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md mx-4 sm:mx-0">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            {isEditMode ? "Edit Brand" : "Create New Brand"}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                    <div className="space-y-4">
                        <TextInputField
                            {...register("name")}
                            label="Brand Name"
                            placeholder="Enter brand name"
                            error={errors.name?.message}
                            disabled={isDisabled}
                            className="w-full"
                        />
                        <FileInputField
                            label={`Brand Image ${isEditMode ? "(Optional)" : ""}`}
                            accept="image/*"
                            disabled={isDisabled}
                            onChangeAction={(files: File[]) => setValue("image", files[0] || null)}
                            error={errors.image?.message as string}
                        />
                        <div className="flex space-x-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_featured"
                                    {...register("is_featured")}
                                    disabled={isDisabled}
                                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <Label
                                    htmlFor="is_featured"
                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                    Featured Brand
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_popular"
                                    {...register("is_popular")}
                                    disabled={isDisabled}
                                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <Label
                                    htmlFor="is_popular"
                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                    Popular Brand
                                </Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isDisabled}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isDisabled || (!isDirty && isEditMode)}
                            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : isEditMode ? (
                                "Update Brand"
                            ) : (
                                "Create Brand"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
