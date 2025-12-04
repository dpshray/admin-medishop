"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SearchSelectField from "@/components/field/search-select"
import FileInputField from "@/components/field/file-input"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import { Edit, AlertCircle, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
    status: z.string().min(1, "Status is required"),
    report: z.instanceof(File).optional()
}).refine((data) => {
    if (data.status === "COMPLETED" && !data.report) {
        return false
    }
    return true
}, {
    message: "Report is required when marking as completed",
    path: ["report"]
})

type FormValues = z.infer<typeof formSchema>

interface StatusUpdateModalProps {
    open: boolean
    onClose: () => void
    booking?: any
    onSubmitAction?: () => Promise<void>
    onCloseAction?: () => void
}

const STATUS_OPTIONS = [
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Canceled", value: "CANCELED" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" }
]

const STATUS_DESCRIPTIONS: Record<string, string> = {
    CONFIRMED: "Booking has been confirmed and scheduled",
    CANCELED: "Booking has been cancelled",
    IN_PROGRESS: "Service is currently being performed",
    COMPLETED: "Service has been completed successfully"
}

export function StatusUpdateModal({
    open,
    onClose,
    booking,
    onCloseAction,
    onSubmitAction
}: StatusUpdateModalProps) {
    const {
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: booking?.status || "",
            report: undefined
        }
    })

    const watchedStatus = watch("status")
    const watchedReport = watch("report")

    useEffect(() => {
        if (open && booking) {
            reset({
                status: booking.status || "",
                report: undefined
            })
        } else if (!open) {
            reset({ status: "", report: undefined })
        }
    }, [open, booking, reset])

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose()
            onCloseAction?.()
        }
    }, [isSubmitting, onClose, onCloseAction])

    const handleStatusChange = useCallback((value: string | number) => {
        setValue("status", value as string, { shouldValidate: true })
    }, [setValue])

    const handleImageChange = useCallback((files: File[]) => {
        setValue("report", files[0] ?? undefined, { shouldValidate: true })
    }, [setValue])

    const onSubmitForm: SubmitHandler<FormValues> = useCallback(async (data) => {
        try {
            const payload = {
                status: data.status,
                report: data.report
            }
            await vendorServiceProviderService.updateServiceBookingStatus(
                booking.booking_uuid,
                payload
            )
            await onSubmitAction?.()
            handleClose()
        } catch (error) {
            console.error("Failed to update status:", error)
            throw error
        }
    }, [booking, onSubmitAction, handleClose])

    const isFormValid = useMemo(() => {
        return watchedStatus && !Object.keys(errors).length
    }, [watchedStatus, errors])

    const hasChanges = useMemo(() => {
        return watchedStatus !== booking?.status || watchedReport
    }, [watchedStatus, watchedReport, booking?.status])

    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        handleSubmit(onSubmitForm)(e)
    }, [handleSubmit, onSubmitForm])

    const isReportRequired = watchedStatus === "COMPLETED"

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="sm:max-w-[550px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
                aria-describedby="status-update-description"
            >
                <DialogHeader className="space-y-3 pb-4">
                    <DialogTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Update Booking Status
                    </DialogTitle>
                    <DialogDescription id="status-update-description" className="text-sm text-muted-foreground">
                        Update the status of the service booking. A report is required when marking as completed.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {booking && (
                        <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                            <p className="text-sm font-medium">Current Status</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                                    {booking.status?.replace(/_/g, ' ')}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <SearchSelectField
                            label="New Status"
                            placeholder="Select new status"
                            options={STATUS_OPTIONS}
                            value={watchedStatus}
                            onChange={handleStatusChange}
                            error={errors.status?.message}
                            required
                        />

                        {watchedStatus && STATUS_DESCRIPTIONS[watchedStatus] && (
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    {STATUS_DESCRIPTIONS[watchedStatus]}
                                </AlertDescription>
                            </Alert>
                        )}

                        <FileInputField
                            label={`Upload Report ${isReportRequired ? '*' : '(Optional)'}`}
                            accept="image/*"
                            error={errors.report?.message as string}
                            onFileChange={handleImageChange}
                            showPreviews
                            showFileList={false}
                            maxFileSize={5 * 1024 * 1024}
                            helperText="Upload an image report (Max 5MB)"
                            required={isReportRequired}
                        />

                        {isReportRequired && !watchedReport && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    A report is required when marking the booking as completed
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isFormValid || !hasChanges}
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Updating...
                                </span>
                            ) : (
                                "Update Status"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}