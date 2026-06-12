"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import TextInputField from "@/components/field/text-input";
import genericNameService from "@/service/generic-name.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const genericNameSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

type GenericNameFormValues = z.infer<typeof genericNameSchema>;

interface GenericModalFormProps {
  open: boolean;
  onCloseAction: (open: boolean) => void;
  onSubmitAction?: (data: GenericNameFormValues) => Promise<void>;
  initialData?: GenericNameFormValues;
  slug?: string;
  loading?: boolean;
  mode: "create" | "edit";
}

export default function GenericModalForm({
  open,
  onCloseAction,
  onSubmitAction,
  initialData,
  loading = false,
  slug,
  mode,
}: GenericModalFormProps) {
  const isEditMode = mode === "edit";

  const defaultValues = useMemo(() => ({ name: "" }), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GenericNameFormValues>({
    resolver: zodResolver(genericNameSchema),
    defaultValues,
  });

  const fetchGenericName = useCallback(async () => {
    if (!slug || !isEditMode) return;

    try {
      const response = await genericNameService.getGenericName(slug);
      // console.log("Fetched generic name:", response)
      if (response?.data) {
        reset(response.data);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch generic name";
      toast.error(message);
      console.error("Error fetching generic name:", error);
    }
  }, [slug, isEditMode, reset]);

  useEffect(() => {
    if (!open) return;

    if (isEditMode && slug) {
      fetchGenericName();
    } else if (initialData) {
      reset(initialData);
    } else {
      reset(defaultValues);
    }
  }, [
    open,
    isEditMode,
    slug,
    initialData,
    reset,
    fetchGenericName,
    defaultValues,
  ]);

  const handleFormSubmit = useCallback(
    async (data: GenericNameFormValues) => {
      try {
        if (isEditMode && slug) {
          const response = await genericNameService.updateGenericName(
            slug,
            data,
          );
          toast.success(
            response?.message || "Generic name updated successfully",
          );
        } else {
          const response = await genericNameService.createGenericName(data);
          toast.success(
            response?.message || "Generic name created successfully",
          );
        }

        if (onSubmitAction) {
          await onSubmitAction(data);
        }

        reset(defaultValues);
        onCloseAction(false);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? "update" : "create"} generic name`;
        toast.error(message);
        console.error("Error submitting form:", error);
      }
    },
    [isEditMode, slug, onSubmitAction, reset, onCloseAction, defaultValues],
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset(defaultValues);
      onCloseAction(false);
    }
  }, [reset, onCloseAction, isSubmitting, defaultValues]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && !isSubmitting) {
        handleClose();
      }
    },
    [handleClose, isSubmitting],
  );

  const isFormDisabled = loading || isSubmitting;

  const dialogTitle = isEditMode
    ? "Edit Generic Name"
    : "Create New Generic Name";
  const dialogDescription = isEditMode
    ? "Update the generic name details"
    : "Add a new generic name to the system";
  const submitLabel = isEditMode
    ? "Update generic name"
    : "Create generic name";
  const submitText = isEditMode ? "Update" : "Create";
  const loadingText = isEditMode ? "Updating..." : "Creating...";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full max-w-lg sm:max-w-xl mx-auto px-4 sm:px-6 py-6 max-h-[90vh] overflow-y-auto"
        aria-describedby="generic-modal-description"
        onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription id="generic-modal-description">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
          noValidate
        >
          <TextInputField
            {...register("name")}
            label="Generic Name"
            placeholder="Enter generic name"
            error={errors.name?.message}
            disabled={isFormDisabled}
            required
            aria-required="true"
            autoComplete="off"
          />

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isFormDisabled}
              className="w-full sm:w-auto"
              aria-label="Cancel and close dialog"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isFormDisabled}
              className="w-full sm:w-auto bg-primaryColor hover:bg-purple-700"
              aria-label={submitLabel}
            >
              {isFormDisabled ? (
                <>
                  <Loader2
                    className="w-4 h-4 mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  {loadingText}
                </>
              ) : (
                submitText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
