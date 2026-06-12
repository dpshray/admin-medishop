"use client"
import {memo, useCallback, useEffect} from "react"
import {Controller, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import TextInputField from "@/components/field/text-input"
import {Info} from "lucide-react"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import {useQuery} from "@tanstack/react-query"
import {FormatCurrency, FormatDate} from "@/lib/helper"
import {Badge} from "@/components/ui/badge"
import {toast} from "sonner"
import VendorServiceRequestModalSkeleton
    from "@/app/vendor/(services)/vendor-service/VendorServiceRequestModalSkeleton";

const vendorServiceApplySchema = z.object({
    is_available: z.boolean(),
    service_id: z.number(),
    price: z.number().min(0, "Price must be a positive number"),
})

type VendorServiceApplyFormValues = z.infer<typeof vendorServiceApplySchema>

interface VendorServiceRequestModalProps {
    open: boolean
    onCloseAction: (open: boolean) => void
    onSubmitAction?: () => Promise<void>
    initialData?: Partial<VendorServiceApplyFormValues>
    serviceName?: string
    loading?: boolean
    slug: string
}

interface Category {
    name: string
    slug: string
}

interface Tag {
    name: string
    slug: string
}

interface VendorService {
    service_id: number
    is_approved_by_admin: boolean
    vendor_service_status: boolean
    service_name: string
    service_slug: string
    admin_price: number
    added_by_admin_at: string
    vendor_price: number
    categories: Category[]
    tags: Tag[]
}

const VendorServiceRequestModal = memo(function VendorServiceRequestModal({
                                                                              open,
                                                                              onCloseAction,
                                                                              onSubmitAction,
                                                                              initialData,
                                                                              serviceName,
                                                                              loading = false,
                                                                              slug,
                                                                          }: VendorServiceRequestModalProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: {errors, isSubmitting},
        reset,
        watch,
    } = useForm<VendorServiceApplyFormValues>({
        resolver: zodResolver(vendorServiceApplySchema),
        defaultValues: {is_available: true, service_id: 0, price: 0},
    })

    const isEditMode = Boolean(initialData?.service_id)
    const isAvailable = watch("is_available")

    const {data: adminData, isLoading} = useQuery<VendorService>({
        queryKey: ["vendorServiceDetails", slug],
        queryFn: async () => {
            const res = await vendorServiceProviderService.getVendorServiceProviderBySlug(slug)
            // console.log('Response from getVendorServiceProviderBySlug',res)
            return res.data
        },
        enabled: open && !!slug,
    })


    const handleFormSubmit = useCallback(
        async (data: VendorServiceApplyFormValues) => {
            if (!adminData) return
            try {
                const res = await vendorServiceProviderService.requestForService({
                    service_id: adminData.service_id,
                    price: data.price,
                    is_available: data.is_available,
                })
                toast.success(res?.message || "Service request submitted successfully")
                if (onSubmitAction) await onSubmitAction()
                reset()
                onCloseAction(false)
            } catch (error:any) {
                toast.error(error?.message)
            }
        },
        [onSubmitAction, reset, onCloseAction, adminData],
    )

    const handleClose = useCallback(() => {
        if (!loading && !isSubmitting) {
            reset()
            onCloseAction(false)
        }
    }, [loading, isSubmitting, reset, onCloseAction])

    useEffect(() => {
        if (open && adminData) {
            reset({
                is_available: initialData?.is_available ?? true,
                service_id: adminData.service_id,
                price: initialData?.price ?? adminData.vendor_price ?? 0,
            })
        }
    }, [open, initialData, adminData, reset])

    if (isLoading)return <VendorServiceRequestModalSkeleton/>


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="w-[95vw] max-w-md mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => isLoading && e.preventDefault()}
                onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
            >
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-semibold">
                        {isEditMode ? "Update Service Application" : "Apply for Service"}
                    </DialogTitle>
                    {serviceName && (
                        <DialogDescription className="text-sm">
                            Configure pricing and availability for <span
                            className="font-medium text-foreground">{serviceName}</span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                {adminData && (
                    <div className="space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                        <div
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs font-mono">#{adminData.service_id}</Badge>
                                <h3 className="text-base sm:text-lg font-semibold">{adminData.service_name}</h3>
                            </div>
                            <Badge variant="outline" className="text-xs w-fit">{adminData.service_slug}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Admin Price</p>
                                <p className="text-sm font-semibold">{FormatCurrency(adminData.admin_price)}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Approval Status</p>
                                {adminData.is_approved_by_admin ? (
                                    <Badge variant="default"
                                           className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                                ) : (
                                    <Badge variant="secondary"
                                           className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-xs">Pending</Badge>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Service Status</p>
                                {adminData.vendor_service_status ? (
                                    <Badge variant="default"
                                           className="bg-green-600 hover:bg-green-700 text-xs">Active</Badge>
                                ) : (
                                    <Badge variant="destructive" className="text-xs">Inactive</Badge>
                                )}
                            </div>
                        </div>

                        {adminData.categories?.length > 0 && (
                            <div className="pt-3 border-t border-border space-y-2">
                                <p className="text-xs text-muted-foreground">Categories</p>
                                <div className="flex flex-wrap gap-2">
                                    {adminData.categories.map((cat) => (
                                        <Badge key={cat.slug} variant="outline" className="text-xs">
                                            {cat.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {adminData.tags?.length > 0 && (
                            <div className="pt-3 border-t border-border space-y-2">
                                <p className="text-xs text-muted-foreground">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {adminData.tags.map((tag) => (
                                        <Badge key={tag.slug} variant="secondary" className="text-xs">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {adminData.vendor_price > 0 && (
                            <div className="pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground">Your Current Price</p>
                                <p className="text-base font-bold text-primary">{FormatCurrency(adminData.vendor_price)}</p>
                            </div>
                        )}

                        {adminData.added_by_admin_at && (
                            <div className="pt-3 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">Added On</p>
                                    <p className="text-xs font-medium">{FormatDate(adminData.added_by_admin_at)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
                    <input type="hidden" {...register("service_id", {valueAsNumber: true})} />

                    <div className="space-y-4">
                        <div
                            className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border">
                            <div className="space-y-1 flex-1 pr-4">
                                <Label htmlFor="is_available" className="text-sm font-medium cursor-pointer">Service
                                    Availability</Label>
                                <p className="text-xs text-muted-foreground">Make this service available to
                                    customers</p>
                            </div>
                            <Controller
                                name="is_available"
                                control={control}
                                render={({field}) => (
                                    <Switch id="is_available" checked={field.value} onCheckedChange={field.onChange}
                                            disabled={isLoading}/>
                                )}
                            />
                        </div>

                        <TextInputField
                            {...register("price", {valueAsNumber: true})}
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

                        {!isAvailable && (
                            <div
                                className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5"/>
                                <p className="text-xs text-amber-800 dark:text-amber-200">This service will be hidden
                                    from customers when availability is disabled.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter
                        className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}
                                className="w-full sm:w-auto">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto" aria-busy={isSubmitting}>
                            {isSubmitting ? "Submitting..." : isEditMode ? "Update Application" : "Submit Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
})

VendorServiceRequestModal.displayName = "VendorServiceRequestModal"
export default VendorServiceRequestModal
