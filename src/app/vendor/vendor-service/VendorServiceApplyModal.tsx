"use client"

import * as React from "react"
import { useEffect, useCallback, memo } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import TextInputField from "@/components/field/text-input"
import { Info } from "lucide-react"

const vendorServiceApplySchema = z.object({
    is_available: z.boolean(),
    service_id: z.number(),
    price: z.number().min(0, "Price must be a positive number"),
})

type VendorServiceApplyFormValues = z.infer<typeof vendorServiceApplySchema>

interface VendorServiceApplyModalProps {
    open: boolean
    onCloseAction: (open: boolean) => void
    onSubmitAction: (values: VendorServiceApplyFormValues) => Promise<void> | void
    initialData?: Partial<VendorServiceApplyFormValues>
    serviceName?: string
    loading?: boolean
}

const VendorServiceApplyModal = memo(function VendorServiceApplyModal({
                                                                          open,
                                                                          onCloseAction,
                                                                          onSubmitAction,
                                                                          initialData,
                                                                          serviceName,
                                                                          loading = false,
                                                                      }: VendorServiceApplyModalProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm<VendorServiceApplyFormValues>({
        resolver: zodResolver(vendorServiceApplySchema),
        defaultValues: {
            is_available: true,
            service_id: 0,
            price: 0,
        },
    })

    const isEditMode = Boolean(initialData && initialData.service_id)
    const isAvailable = watch("is_available")

    const handleFormSubmit = useCallback(async (data: VendorServiceApplyFormValues) => {
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
            reset(initialData || {
                is_available: true,
                service_id: 0,
                price: 0,
            })
        }
    }, [open, initialData, reset])

    const isLoading = loading || isSubmitting

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="w-[95vw] max-w-[500px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => {
                    if (isLoading) e.preventDefault()
                }}
                onEscapeKeyDown={(e) => {
                    if (isLoading) e.preventDefault()
                }}
            >
                <DialogHeader className="space-y-2 sm:space-y-3">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold leading-tight">
                        {isEditMode ? "Update Service Application" : "Apply for Service"}
                    </DialogTitle>
                    {serviceName && (
                        <DialogDescription className="text-sm text-muted-foreground">
                            Configure pricing and availability for <span className="font-semibold">{serviceName}</span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-5 sm:space-y-6 mt-4"
                    noValidate
                >
                    <input
                        type="hidden"
                        {...register("service_id", { valueAsNumber: true })}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                            <div className="space-y-1 flex-1">
                                <Label
                                    htmlFor="is_available"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Service Availability
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Make this service available to customers
                                </p>
                            </div>
                            <Controller
                                name="is_available"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="is_available"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                        aria-label="Toggle service availability"
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <TextInputField
                                {...register("price", { valueAsNumber: true })}
                                label="Your Price"
                                type="number"
                                placeholder="0.00"
                                error={errors.price?.message}
                                disabled={isLoading}
                                required
                                min={0}
                                step="0.01"
                                helperText="Set your competitive price for this service"
                            />
                        </div>

                        {!isAvailable && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    This service will be hidden from customers when availability is disabled.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t">
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
                                ? "Submitting..."
                                : isEditMode
                                    ? "Update Application"
                                    : "Submit Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
})

VendorServiceApplyModal.displayName = "VendorServiceApplyModal"

export default VendorServiceApplyModal