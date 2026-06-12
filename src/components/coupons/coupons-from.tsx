"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TextInputField from "@/components/field/text-input";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Coupon,
  couponSchema,
  UpdateCoupon,
  updateCouponSchema,
} from "@/lib/schema/couponSchema";
import couponService from "@/service/product/coupon.service";
import {
  AlertCircle,
  Loader2,
  Percent,
  Tag,
  TicketPercent,
} from "lucide-react";
import DatePickerField from "@/components/field/date-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CouponFormSkeleton from "@/components/coupons/coupon-form-skeleton";
import { toast } from "sonner";

interface CouponFormProps {
  mode?: "create" | "edit";
  slug?: string;
  open: boolean;
  onCloseAction: () => void;
  onSuccessAction?: () => void;
}

export default function CouponForm({
  mode = "create",
  slug,
  open,
  onCloseAction,
  onSuccessAction,
}: CouponFormProps) {
  const isEditMode = mode === "edit";
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const schema = useMemo(
    () => (isEditMode ? updateCouponSchema : couponSchema),
    [isEditMode],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<Coupon | UpdateCoupon>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      description: "",
      is_active: false,
      discount_percent: 0,
      start_date: "",
      end_date: "",
    },
  });

  const fetchCoupon = useCallback(async () => {
    if (!slug || !isEditMode) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await couponService.getCouponBySlug(slug);
      // console.log("Coupon data ", res)
      reset({
        code: res?.data.code,
        description: res?.data.description,
        discount_percent: res?.data.discount_percent,
        is_active: res?.data.is_active,
        start_date: res?.data.start_date,
        end_date: res?.data.end_date,
      });
    } catch {
      setError("Failed to load coupon details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [slug, isEditMode, reset]);

  useEffect(() => {
    if (open && isEditMode) fetchCoupon();
    if (!open) {
      reset();
      setError(null);
    }
  }, [open, isEditMode, fetchCoupon, reset]);

  const onSubmit = useCallback(
    async (data: FieldValues) => {
      //   console.log("Form data ", data);
      if (mode === "create") {
        const res = await couponService.createCoupon(data);
        toast.success(res?.message || "Coupon created successfully");
      } else {
        const res = await couponService.updateCoupon(
          slug as string,
          data as UpdateCoupon,
        );
        toast.success(res?.message || "Coupon updated successfully");
      }
      reset();
      onCloseAction();
      onSuccessAction?.();
    },
    [mode, slug, reset, onCloseAction, onSuccessAction],
  );

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setError(null);
      onCloseAction();
    }
  };

  const isActive = watch("is_active");
  const startDate = watch("start_date");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[90vw] sm:max-w-xl lg:max-w-2xl mx-auto p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <TicketPercent className="w-5 h-5 sm:w-6 sm:h-6 text-primaryColor" />
            {isEditMode ? "Edit Promo Coupon" : "Create New Promo Coupon"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 mt-1">
            {isEditMode ? "Update coupon details" : "Add new coupon details"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {isLoading ? (
            <CouponFormSkeleton />
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="grid gap-5">
                <TextInputField
                  {...register("code")}
                  label="Coupon Code"
                  placeholder="e.g., SUMMER2025"
                  icon={Tag}
                  required
                  error={errors.code?.message}
                  className="uppercase"
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    e.currentTarget.value = e.currentTarget.value.toUpperCase();
                  }}
                />

                <TextInputField
                  {...register("description")}
                  label="Coupon Description"
                  placeholder="Enter description"
                  required
                  textarea
                  error={errors.description?.message}
                />

                <TextInputField
                  {...register("discount_percent", { valueAsNumber: true })}
                  label="Discount Percentage"
                  placeholder="e.g., 25"
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  icon={Percent}
                  error={errors.discount_percent?.message}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        label="Start Date"
                        placeholder="Select start date"
                        value={field.value ? new Date(field.value) : undefined}
                        onChangeAction={(date) =>
                          field.onChange(
                            date ? date.toISOString().split("T")[0] : "",
                          )
                        }
                        error={errors.start_date?.message}
                      />
                    )}
                  />

                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        label="End Date"
                        placeholder="Select end date"
                        value={field.value ? new Date(field.value) : undefined}
                        onChangeAction={(date) =>
                          field.onChange(
                            date ? date.toISOString().split("T")[0] : "",
                          )
                        }
                        error={errors.end_date?.message}
                        minDate={startDate ? new Date(startDate) : undefined}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="is_active"
                      className="text-sm font-medium text-gray-900"
                    >
                      Coupon Status
                    </Label>
                    <span className="text-xs text-gray-600">
                      {isActive
                        ? "Coupon is currently active"
                        : "Coupon is currently inactive"}
                    </span>
                  </div>

                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primaryColor rounded-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
