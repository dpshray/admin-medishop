"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/config/app-constant";
import bookingService from "@/service/serivce-provider/booking-service-.service";
import SearchSelectField from "@/components/field/search-select";
import { FormatCurrency, StatusBadge } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  Package,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import BookingServiceLoadingSkeleton from "@/app/admin/(services)/booked-services/[slug]/loading";

type BookedService = {
  status: string;
  user: { name: string; email: string };
  booking_uuid: string;
  service_slug: string;
  assigned_vendor?: { name: string; email: string };
  service_name: string;
  service_price: number;
  service_discount_percent: number;
  service_description: string;
  test_requirements: string;
  message: string | null;
  appointment_at: string;
  service_created_at: string;
  is_appointment_expired: boolean;
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-0.5" aria-hidden="true">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground break-words">{value}</p>
    </div>
  </div>
);

export default function BookingServiceDetailsClientPage({
  slug,
}: {
  slug: string;
}) {
  const queryClient = useQueryClient();
  const [selectedVendor, setSelectedVendor] = useState<string | number>("");

  const { data: bookingData, isLoading: isBookingLoading } =
    useQuery<BookedService>({
      queryKey: ["bookingService", slug],
      queryFn: async () => {
        const res = await bookingService.getBookingServiceByUuid(slug);
        return res?.data;
      },
      staleTime: QUERY_STALE_TIME,
      placeholderData: (previousData) => previousData,
    });

  const { data: vendorData, isLoading: isVendorsLoading } = useQuery<any[]>({
    queryKey: ["vendors", bookingData?.service_slug],
    queryFn: async () => {
      if (!bookingData?.service_slug) return [];
      const res = await bookingService.getAllVendorForBookingServices(
        bookingData.service_slug,
      );
      return res?.items || [];
    },
    enabled: !!bookingData?.service_slug,
    staleTime: QUERY_STALE_TIME,
  });

  const assignVendorMutation = useMutation({
    mutationFn: async (vendorId: string | number) => {
      return await bookingService
        .assignVendorForBookingService(
          bookingData!.booking_uuid,
          vendorId.toString(),
        )
        .then((res) => {
          toast.success(res.message || "Vendor assigned successfully");
        })
        .catch((err) => {
          toast.error(err.message || "Something went wrong");
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey: ["bookingService", slug] });
        });
    },
  });

  const handleAssignVendor = useCallback(() => {
    if (selectedVendor) {
      assignVendorMutation.mutate(selectedVendor);
    }
  }, [selectedVendor, assignVendorMutation]);

  const finalPrice = useMemo(() => {
    if (!bookingData) return 0;
    const discount =
      (bookingData.service_price * bookingData.service_discount_percent) / 100;
    return bookingData.service_price - discount;
  }, [bookingData]);

  const vendorOptions = useMemo(
    () =>
      vendorData?.map((v: any) => ({
        value: v.vendor_uuid,
        label: `${v.vendor_name} (${v.service_price})`,
      })) || [],
    [vendorData],
  );

  if (isBookingLoading) return <BookingServiceLoadingSkeleton />;

  if (!bookingData)
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="border rounded-lg p-8 bg-background">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Booking not found</h3>
              <p className="text-sm text-muted-foreground">
                The booking you're looking for doesn't exist or has been
                removed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div
        className={cn(
          "border rounded-lg p-6 sm:p-8 bg-background space-y-8 transition-colors",
          bookingData.is_appointment_expired && "bg-red-50 dark:bg-red-950",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Booking Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and review booking information
            </p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={bookingData.status} />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h2>
              <div className="pl-7 space-y-4">
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Name"
                  value={bookingData.user.name}
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={bookingData.user.email}
                />
              </div>
            </section>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Details
              </h2>
              <div className="pl-7 space-y-5">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Service Name
                  </label>
                  <p className="text-base font-semibold mt-1.5">
                    {bookingData.service_name}
                  </p>
                </div>
                {bookingData.service_description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </label>
                    <p className="text-sm mt-1.5 text-foreground/90">
                      {bookingData.service_description}
                    </p>
                  </div>
                )}
                {bookingData.test_requirements && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Test Requirements
                    </label>
                    <p className="text-sm mt-1.5 text-foreground/90">
                      {bookingData.test_requirements}
                    </p>
                  </div>
                )}
                {bookingData.message && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Customer Message
                    </label>
                    <p className="text-sm mt-1.5 text-foreground/90 italic">
                      &quot;{bookingData.message}&quot;
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment
              </h2>
              <div className="pl-7 space-y-4">
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Scheduled Date"
                  value={new Date(bookingData.appointment_at).toLocaleString(
                    "en-US",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  )}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Booked On"
                  value={new Date(
                    bookingData.service_created_at,
                  ).toLocaleDateString("en-US", { dateStyle: "medium" })}
                />
              </div>
            </section>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Pricing
              </h2>
              <div className="pl-7 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Original Price
                  </span>
                  <span className="font-medium">
                    {FormatCurrency(bookingData.service_price)}
                  </span>
                </div>
                {bookingData.service_discount_percent > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Discount
                      </span>
                      <Badge variant="secondary">
                        {bookingData.service_discount_percent}% OFF
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold">Final Price</span>
                      <span className="text-lg font-bold text-primary">
                        {FormatCurrency(finalPrice)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vendor Assignment
              </h2>
              {bookingData.assigned_vendor ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Assigned Vendor
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {bookingData.assigned_vendor.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {bookingData.assigned_vendor.email}
                    </p>
                  </div>
                </div>
              ) : bookingData.is_appointment_expired ? (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Appointment Expired
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      The appointment has expired and cannot be assigned to a
                      vendor.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <SearchSelectField
                    label="Select Vendor"
                    placeholder="Choose a vendor to assign"
                    options={vendorOptions}
                    value={selectedVendor}
                    onChange={setSelectedVendor}
                    disabled={isVendorsLoading}
                  />
                  <Button
                    onClick={handleAssignVendor}
                    disabled={!selectedVendor || assignVendorMutation.isPending}
                    className="w-full"
                  >
                    {assignVendorMutation.isPending
                      ? "Assigning..."
                      : "Assign Vendor"}
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
