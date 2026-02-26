"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/field/rich-text-editor";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import grievanceService from "@/service/grievance.service";
import SearchSelectField from "@/components/field/search-select";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

export const grievanceSchema = z.object({
  status: z.string(),
  remarks: z.string().optional(),
});

type GrievanceFormData = z.infer<typeof grievanceSchema>;

interface GrievanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitAction?: () => void;
  slug: string;
}

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Under Process", value: "UNDER_PROCESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export function GrievanceModal({
  open,
  onOpenChange,
  onSubmitAction,
  slug,
}: GrievanceModalProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema),
    mode: "onBlur",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["grievance", slug],
    queryFn: () => grievanceService.getSingleGrievance(slug),
    enabled: open && !!slug,
    staleTime: 30000,
  });

  const grievanceData = data?.data;

  useEffect(() => {
    if (grievanceData && open) {
      reset({
        status: grievanceData.status,
        remarks: grievanceData.remarks || "",
      });
    }
  }, [grievanceData, open, reset]);

  const submitHandler = async (formData: GrievanceFormData) => {
    try {
      await grievanceService.updateGrievance(slug, formData);
      toast.success("Grievance updated successfully");
      onSubmitAction?.();
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update grievance. Please try again.");
      console.error("Grievance update error:", error);
    }
  };

  const handleDialogChange = (value: boolean) => {
    if (!value && !isSubmitting) {
      reset();
    }
    onOpenChange(value);
  };

  const handleStatusChange = useCallback((value: string | number | null) => {
    return value ? String(value) : null;
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        aria-describedby="grievance-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold">
            Update Grievance
          </DialogTitle>
          <DialogDescription
            id="grievance-description"
            className="text-sm text-muted-foreground"
          >
            Review and update the grievance status and remarks
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : grievanceData ? (
          <>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User
                  className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {grievanceData.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground break-all">
                    {grievanceData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {grievanceData.phone}
                  </p>
                </div>
              </div>

              {grievanceData.store_name && (
                <div className="flex items-start gap-3">
                  <Store
                    className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {grievanceData.store_name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SearchSelectField
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={field.value}
                    onChange={(value) => {
                      const status = handleStatusChange(value);
                      if (status) field.onChange(status);
                    }}
                    error={errors.status?.message}
                    required
                    disabled={isSubmitting}
                  />
                )}
              />

              <div>
                <Label
                  htmlFor="remarks"
                  className={cn(
                    "mb-2 block text-sm font-medium leading-none",
                    errors.remarks?.message && "text-destructive",
                  )}
                >
                  Remarks
                </Label>
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Add remarks or notes about this grievance..."
                      className={cn(
                        errors.remarks?.message && "border-destructive",
                      )}
                    />
                  )}
                />
                {errors.remarks?.message && (
                  <p className="mt-1.5 text-xs text-destructive" role="alert">
                    {errors.remarks.message}
                  </p>
                )}
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  disabled={isSubmitting}
                  className="text-sm w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="text-sm w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Grievance"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Unable to load grievance details
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
