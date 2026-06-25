"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddDisclaimer, useGetDisclaimer } from "@/hooks/useProduct";
import TextInputField from "../field/text-input";

interface DisclaimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DisclaimerFormValues {
  disclaimer: string;
}

export function DisclaimerDialog({
  open,
  onOpenChange,
}: DisclaimerDialogProps) {
  const { data: disclaimerData } = useGetDisclaimer();
  const { mutate: saveDisclaimer, isPending } = useAddDisclaimer();

  const existingDisclaimer = disclaimerData?.data?.disclaimer ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisclaimerFormValues>({
    defaultValues: { disclaimer: existingDisclaimer },
  });

  // Sync form when existing data loads or dialog opens
  useEffect(() => {
    if (open) {
      reset({ disclaimer: existingDisclaimer });
    }
  }, [open, existingDisclaimer, reset]);

  const onSubmit = (values: DisclaimerFormValues) => {
    saveDisclaimer(values, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingDisclaimer ? "Edit Disclaimer" : "Add Disclaimer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInputField
            textarea
            label="Disclaimer"
            required
            placeholder="Enter your product disclaimer..."
            rows={6}
            error={errors.disclaimer?.message}
            helperText="This disclaimer will appear on products where 'Show Disclaimer' is enabled."
            {...register("disclaimer", {
              required: "Disclaimer is required",
              minLength: {
                value: 10,
                message: "Disclaimer must be at least 10 characters",
              },
            })}
          />

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primaryColor border-primaryColor"
            >
              {isPending
                ? existingDisclaimer
                  ? "Updating..."
                  : "Adding..."
                : existingDisclaimer
                  ? "Update Disclaimer"
                  : "Add Disclaimer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
