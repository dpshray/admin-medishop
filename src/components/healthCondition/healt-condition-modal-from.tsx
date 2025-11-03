'use client'

import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import healthConditionService from "@/service/healthCondition.service"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Loader2} from "lucide-react"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import {Button} from "@/components/ui/button"
import {useCallback, useEffect, useState} from "react"
import {toast} from "sonner"

interface HealthConditionFormProps {
    mode: "create" | "update"
    open: boolean
    onSubmitAction?: (data: HealthConditionFormValues) => Promise<void>
    onCloseAction: (isOpen: boolean) => void
    slug?: string
    loading?: boolean
}

interface HealthConditionFormValues {
    name: string
    description: string
    image?: File | string
}

const createHealthConditionSchema = z.object({
    name: z.string().min(1, "Health condition name is required").max(100, "Health condition name must be less than 100 characters"),
    description: z.string().min(1, "Health condition description is required").max(1000, "Health condition description must be less than 1000 characters"),
    image: z.instanceof(File, {message: "Image is required"})
})

const updateHealthConditionSchema = z.object({
    name: z.string().min(1, "Health condition name is required").max(100, "Health condition name must be less than 100 characters"),
    description: z.string().min(1, "Description is required").max(1000, "Health condition description must be less than 1000 characters"),
    image: z.instanceof(File).optional()
})

export default function HealthConditionForm({
                                                mode,
                                                open,
                                                onCloseAction,
                                                slug,
                                                loading
                                            }: HealthConditionFormProps) {
    const [isInitializing, setIsInitializing] = useState(false)
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        setValue,
        reset
    } = useForm<HealthConditionFormValues>({
        resolver: zodResolver(mode === "create" ? createHealthConditionSchema : updateHealthConditionSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            image: undefined,
        }
    })

    const fetchHealthCondition = useCallback(async () => {
        if (mode === "update" && slug) {
            setIsInitializing(true)
            try {
                const res = await healthConditionService.getHealthCondition(slug)
                const formData: HealthConditionFormValues = {
                    name: res.data.name,
                    description: res.data.description,
                    image: res.data.image,
                }
                reset(formData)
            } catch (error) {
                toast.error("Failed to load health condition details")
                onCloseAction(false)
            } finally {
                setIsInitializing(false)
            }
        }
    }, [mode, slug, reset, onCloseAction])

    useEffect(() => {
        if (open) {
            if (mode === "update" && slug) fetchHealthCondition()
            else reset({name: "", description: "", image: undefined})
        }
    }, [open, mode, slug, fetchHealthCondition, reset])

    const handleFileChange = useCallback(
        (files: File[]) => {
            const file = files[0]
            if (file) setValue("image", file, {shouldValidate: true})
        },
        [setValue]
    )

    const onSubmit = async (formData: HealthConditionFormValues) => {
        try {
            if (mode === "update" && slug) {
                await healthConditionService.updateHealthCondition(slug, formData).then((res) => {
                    toast.success(res.message || "Health condition updated successfully")
                })

            } else {
                await healthConditionService.createHealthCondition(formData).then((res) => {
                    toast.success(res.message || "Health condition created successfully")
                })
            }
            reset()
            onCloseAction(false)
        } catch {
            toast.error("An error occurred while submitting the form")
        }
    }

    const isFormLoading = isSubmitting || loading || isInitializing

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {mode === "create" ? "Create Health Condition" : "Update Health Condition"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        {mode === "create"
                            ? "Fill in the details to create a new health condition"
                            : "Update the health condition information"}
                    </DialogDescription>
                </DialogHeader>

                {isInitializing ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#4a358e]" aria-label="Loading" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <TextInputField
                            label="Name"
                            placeholder="Enter health condition name"
                            error={errors.name?.message}
                            disabled={isFormLoading}
                            required
                            {...register("name")}
                        />
                        <TextInputField
                            label="Description"
                            placeholder="Enter health condition description"
                            error={errors.description?.message}
                            disabled={isFormLoading}
                            textarea
                            rows={4}
                            required
                            {...register("description")}
                        />
                        <FileInputField
                            label="Image"
                            accept="image/*"
                            error={errors.image?.message}
                            onFileChange={handleFileChange}
                            disabled={isFormLoading}
                            required={mode === "create"}
                        />
                        <DialogFooter className="gap-2 sm:gap-0 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onCloseAction(false)}
                                disabled={isFormLoading}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isFormLoading}
                                className="w-full sm:w-auto bg-[#4a358e] hover:bg-[#3a2870] text-white"
                            >
                                {isFormLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {mode === "create" ? "Creating..." : "Updating..."}
                                    </>
                                ) : (
                                    mode === "create" ? "Create" : "Update"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
