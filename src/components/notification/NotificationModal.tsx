'use client'

import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {Loader2} from "lucide-react"
import {cn} from "@/lib/utils"
import TextInputField from "@/components/field/text-input"
import {RichTextEditor} from "@/components/field/rich-text-editor"
import notificationService from "@/service/notification.service"
import {toast} from "sonner"

const notificationSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must not exceed 100 characters"),
    body: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must not exceed 500 characters"),
    send_and_store: z.boolean().default(false),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface NotificationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmitAction?: () => void
    defaultValues?: Partial<NotificationFormData>
    title?: string
    description?: string
    submitLabel?: string
}

export function NotificationModal({
                                      open,
                                      onOpenChange,
                                      onSubmitAction,
                                      defaultValues,
                                      title = "Send Notification",
                                      description = "Create and send a notification to users",
                                      submitLabel = "Send Notification",
                                  }: NotificationModalProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors, isSubmitting, isDirty},
    } = useForm<NotificationFormData>({
        resolver: zodResolver(notificationSchema) as any,
        defaultValues: {
            title: defaultValues?.title ?? "",
            body: defaultValues?.body ?? "",
            send_and_store: defaultValues?.send_and_store ?? false,
        },
        mode: "onBlur",
    })

    const submitHandler = async (data: NotificationFormData) => {
        try {
            await notificationService.sendNotification(data)
            toast.success("Notification sent successfully")
            onSubmitAction?.()
            reset()
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to send notification. Please try again.")
            console.error("Notification error:", error)
        }
    }

    const handleDialogChange = (value: boolean) => {
        if (!value && !isSubmitting) {
            reset()
        }
        onOpenChange(value)
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[500px]" aria-describedby="notification-description">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                    <DialogDescription id="notification-description" className="text-sm text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
                    <TextInputField
                        {...register("title")}
                        label="Title"
                        placeholder="Enter notification title"
                        error={errors.title?.message}
                        disabled={isSubmitting}
                        required
                    />

                    <div>
                        <Label
                            htmlFor="body"
                            className={cn(
                                "mb-2 block text-sm font-medium leading-none",
                                errors.body?.message && "text-destructive"
                            )}
                        >
                            Description
                            <span className="ml-1 text-destructive">*</span>
                        </Label>
                        <Controller
                            name="body"
                            control={control}
                            render={({field}) => (
                                <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                    placeholder="Write your notification description..."
                                    className={cn(errors.body?.message && "border-destructive")}
                                />
                            )}
                        />
                        {errors.body?.message && (
                            <p className="mt-1.5 text-xs text-destructive" role="alert">
                                {errors.body.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Controller
                            name="send_and_store"
                            control={control}
                            render={({field}) => (
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSubmitting}
                                    aria-label="Send and store notification"
                                    id="send_and_store"
                                />
                            )}
                        />
                        <div className="space-y-1 leading-none">
                            <Label
                                htmlFor="send_and_store"
                                className="text-sm font-medium cursor-pointer"
                            >
                                Send and Store
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Store this notification in the database for future reference
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDialogChange(false)}
                            disabled={isSubmitting}
                            className="text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                            className="text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true"/>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                submitLabel
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}