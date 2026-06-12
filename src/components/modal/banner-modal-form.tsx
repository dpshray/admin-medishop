"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import TextInputField from "@/components/field/text-input";
import FileInputField from "@/components/field/file-input";
import {
  bannerCreateSchema,
  bannerUpdateSchema,
} from "@/lib/schema/bannerSchema";
import { z } from "zod";
import bannerService from "@/service/banner.service";
import { cn } from "@/lib/utils";

type BannerFormData = z.infer<typeof bannerCreateSchema>;

interface BannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: {
    uuid: string;
    title: string | null;
    url: string | null;
    order: number;
    image: string;
  } | null;
  onSuccess?: () => void;
}

export function BannerFormModal({
  open,
  onOpenChange,
  banner,
  onSuccess,
}: BannerModalProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialFormData, setInitialFormData] = useState<BannerFormData | null>(
    null,
  );

  const isEditMode = Boolean(banner);
  const schema = useMemo(
    () => (isEditMode ? bannerUpdateSchema : bannerCreateSchema),
    [isEditMode],
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: "",
      url: "",
      order: 1,
      image: undefined,
    },
    mode: "onChange",
  });

  const fetchBannerData = useCallback(
    async (uuid: string) => {
      setIsInitializing(true);
      try {
        const response = await bannerService.getBannerById(uuid);
        // console.log("Banner data:", response?.data)
        if (response?.data) {
          const formData: BannerFormData = {
            title: response.data.title || "",
            url: response.data.url || "",
            order: response.data.order || 1,
            image: undefined,
          };

          setInitialFormData(formData);
          reset(formData);
        }
      } catch (error) {
        console.error("Failed to fetch banner:", error);
        toast.error("Failed to load banner details");
        onOpenChange(false);
      } finally {
        setIsInitializing(false);
      }
    },
    [reset, onOpenChange],
  );

  useEffect(() => {
    if (open) {
      if (banner?.uuid) {
        fetchBannerData(banner.uuid);
      } else {
        const defaultData: BannerFormData = {
          title: "",
          url: "",
          order: 1,
          image: undefined,
        };
        setInitialFormData(defaultData);
        reset(defaultData);
      }
    } else {
      setInitialFormData(null);
    }
  }, [open, banner?.uuid, reset, fetchBannerData]);

  const handleFileChange = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;

      const maxSize = 5 * 1024 * 1024;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setValue("image", file, { shouldValidate: true, shouldDirty: true });
    },
    [setValue],
  );

  const onFormSubmit = useCallback(
    async (data: BannerFormData) => {
      try {
        if (isEditMode && banner?.uuid) {
          await bannerService.updateBanner(banner.uuid, data);
        } else {
          await bannerService.createBanner(data);
        }

        toast.success(
          `Banner ${isEditMode ? "updated" : "created"} successfully`,
        );
        onSuccess?.();
        onOpenChange(false);
        reset();
      } catch (error: unknown) {
        console.error("Banner submission error:", error);

        let errorMessage = `Failed to ${isEditMode ? "update" : "create"} banner`;

        if (error && typeof error === "object") {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          errorMessage = apiError?.response?.data?.message || errorMessage;
        }

        toast.error(errorMessage);
      }
    },
    [isEditMode, banner?.uuid, onSuccess, onOpenChange, reset],
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting && !isInitializing) {
      onOpenChange(false);
      reset();
    }
  }, [isSubmitting, isInitializing, onOpenChange, reset]);

  const isLoading = isSubmitting || isInitializing;
  const dialogTitle = isEditMode ? "Edit Banner" : "Create New Banner";
  const dialogDescription = isEditMode
    ? "Update the banner details below."
    : "Fill in the details to create a new banner.";
  const submitButtonText = isEditMode ? "Update Banner" : "Create Banner";
  const loadingText = isEditMode ? "Updating..." : "Creating...";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-semibold">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1 -mx-1">
          {isInitializing ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600">
                  Loading banner details...
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              className="space-y-4 sm:space-y-6"
              noValidate
            >
              <div className="space-y-4">
                <TextInputField
                  label="Title"
                  placeholder="Enter banner title"
                  {...register("title")}
                  error={errors.title?.message}
                  disabled={isLoading}
                  required
                  autoComplete="off"
                />

                <TextInputField
                  label="URL"
                  placeholder="https://example.com"
                  {...register("url")}
                  error={errors.url?.message}
                  disabled={isLoading}
                  required
                  autoComplete="url"
                />

                <TextInputField
                  label="Display Order"
                  type="number"
                  placeholder="1"
                  {...register("order", { valueAsNumber: true })}
                  error={errors.order?.message}
                  disabled={isLoading}
                  required
                />

                <FileInputField
                  label="Banner Image"
                  onFileChange={handleFileChange}
                  error={errors.image?.message as string}
                  accept="image/*"
                  required={!isEditMode}
                  disabled={isLoading}
                  showFileList={true}
                  showPreviews={true}
                  existingImageUrl={banner?.image}
                  existingImageAlt={banner?.title || "Banner image"}
                  helperText={
                    isEditMode
                      ? "Upload a new image to replace the current one"
                      : "Upload banner image (max 5MB)"
                  }
                />
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2 pt-4 border-t mt-6 flex-shrink-0">
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
                  className={cn(
                    "w-full sm:w-auto bg-primaryColor text-white hover:bg-primaryColor/90 transition-colors shadow-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{loadingText}</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>{submitButtonText}</span>
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
