'use client'

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {QUERY_STALE_TIME} from "@/config/app-constant"
import bookingService from "@/service/serivce-provider/booking-service-.service"
import SearchSelectField from "@/components/field/search-select"
import {FormatCurrency, StatusBadge} from "@/lib/helper"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge"
import {Skeleton} from "@/components/ui/skeleton"
import {useCallback, useMemo, useState} from "react"
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ClipboardList,
    DollarSign,
    FileText,
    Mail,
    MessageSquare,
    Package,
    User,
    Users
} from "lucide-react"
import {toast} from "sonner"

type BookedService = {
    status: string
    user: { name: string; email: string }
    booking_uuid: string
    service_slug: string
    assigned_vendor: string | null
    service_name: string
    service_price: number
    service_discount_percent: number
    service_description: string
    test_requirements: string
    message: string | null
    appointment_at: string
    service_created_at: string
}

const InfoRow = ({icon, label, value}: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5" aria-hidden="true">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm text-foreground break-words">{value}</p>
        </div>
    </div>
)

const LoadingSkeleton = () => (
    <div className="w-full space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="space-y-2">
            <Skeleton className="h-8 w-64"/>
            <Skeleton className="h-4 w-48"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full rounded-lg"/>
                <Skeleton className="h-64 w-full rounded-lg"/>
            </div>
            <div className="space-y-6">
                <Skeleton className="h-40 w-full rounded-lg"/>
                <Skeleton className="h-48 w-full rounded-lg"/>
                <Skeleton className="h-56 w-full rounded-lg"/>
            </div>
        </div>
    </div>
)

export default function BookingServiceDetailsClientPage({slug}: { slug: string }) {
    const queryClient = useQueryClient()
    const [selectedVendor, setSelectedVendor] = useState<string | number>("")

    const {data: bookingData, isLoading: isBookingLoading} = useQuery<BookedService>({
        queryKey: ['bookingService', slug],
        queryFn: async () => {
            const res = await bookingService.getBookingServiceByUuid(slug)
            return res?.data
        },
        staleTime: QUERY_STALE_TIME,
        placeholderData: (previousData) => previousData,
    })

    const {data: vendorData, isLoading: isVendorsLoading} = useQuery<any[]>({
        queryKey: ['vendors', bookingData?.service_slug],
        queryFn: async () => {
            if (!bookingData?.service_slug) return []
            const res = await bookingService.getAllVendorForBookingServices(bookingData.service_slug)
            return res?.items || []
        },
        enabled: !!bookingData?.service_slug,
        staleTime: QUERY_STALE_TIME,
    })

    const assignVendorMutation = useMutation({
        mutationFn: async (vendorId: string | number) => {
            return await bookingService.assignVendorForBookingService(bookingData!.booking_uuid, vendorId.toString())
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookingService', slug]})
            toast.success("Vendor assigned successfully")
        },
        onError: () => {
            toast.error("Failed to assign vendor")
        }
    })

    const handleAssignVendor = useCallback(() => {
        if (selectedVendor) {
            assignVendorMutation.mutate(selectedVendor)
        }
    }, [selectedVendor, assignVendorMutation])

    const finalPrice = useMemo(() => {
        if (!bookingData) return 0
        const discount = (bookingData.service_price * bookingData.service_discount_percent) / 100
        return bookingData.service_price - discount
    }, [bookingData])

    const vendorOptions = useMemo(() => vendorData?.map((v: any) => ({
        value: v.vendor_uuid,
        label: `${v.vendor_name} (${v.service_price})`
    })) || [], [vendorData])

    if (isBookingLoading) return <LoadingSkeleton/>

    if (!bookingData) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground"/>
                <h3 className="text-lg font-semibold">Booking not found</h3>
                <p className="text-sm text-muted-foreground">The booking you&#39;re looking for doesn&#39;t exist or has
                    been removed.</p>
            </div>
        </div>
    )

    return (
        <div className="w-full space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Booking Details</h1>
                    <p className="text-sm text-muted-foreground">View and manage booking information</p>
                </div>
                <StatusBadge status={bookingData.status}/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background"
                             aria-labelledby="user-info-heading">
                        <h2 id="user-info-heading" className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5" aria-hidden="true"/>Customer Information
                        </h2>
                        <Separator/>
                        <div className="space-y-3">
                            <InfoRow icon={<User className="h-4 w-4"/>} label="Name" value={bookingData.user.name}/>
                            <InfoRow icon={<Mail className="h-4 w-4"/>} label="Email" value={bookingData.user.email}/>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background"
                             aria-labelledby="service-info-heading">
                        <h2 id="service-info-heading" className="text-lg font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5" aria-hidden="true"/>Service Details
                        </h2>
                        <Separator/>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Service Name</label>
                                <p className="text-base font-semibold mt-1">{bookingData.service_name}</p>
                            </div>
                            {bookingData.service_description && (
                                <div>
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4" aria-hidden="true"/>Description
                                    </label>
                                    <p className="text-sm mt-1 text-foreground/90">{bookingData.service_description}</p>
                                </div>
                            )}
                            {bookingData.test_requirements && (
                                <div>
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4" aria-hidden="true"/>Test Requirements
                                    </label>
                                    <p className="text-sm mt-1 text-foreground/90">{bookingData.test_requirements}</p>
                                </div>
                            )}
                            {bookingData.message && (
                                <div>
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" aria-hidden="true"/>Customer Message
                                    </label>
                                    <p className="text-sm mt-1 text-foreground/90 italic">&#34;{bookingData.message}&#34;</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
                <div className="space-y-6">
                    <section className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background"
                             aria-labelledby="appointment-heading">
                        <h2 id="appointment-heading" className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5" aria-hidden="true"/>Appointment
                        </h2>
                        <Separator/>
                        <div className="space-y-3">
                            <InfoRow icon={<Calendar className="h-4 w-4"/>} label="Scheduled Date"
                                     value={new Date(bookingData.appointment_at).toLocaleString('en-US', {
                                         dateStyle: 'medium',
                                         timeStyle: 'short'
                                     })}/>
                            <InfoRow icon={<Calendar className="h-4 w-4"/>} label="Booked On"
                                     value={new Date(bookingData.service_created_at).toLocaleDateString('en-US', {dateStyle: 'medium'})}/>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background"
                             aria-labelledby="pricing-heading">
                        <h2 id="pricing-heading" className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5" aria-hidden="true"/>Pricing
                        </h2>
                        <Separator/>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Original Price</span>
                                <span className="font-medium">{FormatCurrency(bookingData.service_price)}</span>
                            </div>
                            {bookingData.service_discount_percent > 0 && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Discount</span>
                                        <Badge variant="secondary">{bookingData.service_discount_percent}% OFF</Badge>
                                    </div>
                                    <Separator/>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Final Price</span>
                                        <span
                                            className="text-lg font-bold text-primary">{FormatCurrency(finalPrice)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background"
                             aria-labelledby="vendor-heading">
                        <h2 id="vendor-heading" className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5" aria-hidden="true"/>Vendor Assignment
                        </h2>
                        <Separator/>
                        {bookingData.assigned_vendor ? (
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400"
                                                  aria-hidden="true"/>
                                    <div>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Assigned
                                            Vendor</p>
                                        <p className="text-sm text-green-700 dark:text-green-300">{bookingData.assigned_vendor}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <SearchSelectField label="Select Vendor" placeholder="Choose a vendor to assign"
                                                   options={vendorOptions} value={selectedVendor}
                                                   onChange={setSelectedVendor} disabled={isVendorsLoading}/>
                                <Button onClick={handleAssignVendor}
                                        disabled={!selectedVendor || assignVendorMutation.isPending} className="w-full">
                                    {assignVendorMutation.isPending ? "Assigning..." : "Assign Vendor"}
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}