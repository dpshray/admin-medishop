"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import TextInputField from "@/components/field/text-input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import batchService from "@/service/order/batch.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BatchAllocation {
  batchNumberId: number;
  batchNumber: string;
  quantity: number;
}

interface BatchAllocationEditorProps {
  batchAllocations: BatchAllocation[];
  itemQuantity: number;
  OIP_ID: number;
  orderUuid: string;
  onSuccess?: () => void;
}

interface BatchFormValues {
  batchNumbers: { batchNumberId: number; quantity: number }[];
}

const BatchAllocationEditor = memo<BatchAllocationEditorProps>(
  function BatchAllocationEditor({
    batchAllocations,
    itemQuantity,
    OIP_ID,
    orderUuid,
    onSuccess,
  }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getBatchStatus = useCallback(
      (batchQuantity: number) => {
        if (batchQuantity === 0) return "empty";
        if (batchQuantity > itemQuantity) return "invalid";
        return "valid";
      },
      [itemQuantity],
    );

    const { control, handleSubmit, reset, watch } = useForm<BatchFormValues>({
      defaultValues: {
        batchNumbers: batchAllocations.map((b) => ({
          batchNumberId: b.batchNumberId,
          quantity: b.quantity,
        })),
      },
    });

    const watchedValues = watch("batchNumbers");

    const currentAllocationStats = useMemo(() => {
      const totalAllocated = watchedValues.reduce(
        (sum, batch) => sum + (Number(batch.quantity) || 0),
        0,
      );
      const remaining = itemQuantity - totalAllocated;
      const hasOverAllocation = totalAllocated > itemQuantity;
      const isComplete = totalAllocated === itemQuantity;
      return { totalAllocated, remaining, hasOverAllocation, isComplete };
    }, [watchedValues, itemQuantity]);

    const onSubmit = async (data: BatchFormValues) => {
      setIsSubmitting(true);
      setError(null);
      // console.log("Data submitted:", data);
      const payload = [
        {
          OIP_ID: Number(OIP_ID),
          batch_numbers: data.batchNumbers
            .filter((b) => b.quantity > 0)
            .map((b) => ({
              batch_number_id: Number(b.batchNumberId),
              quantity: Number(b.quantity),
            })),
        },
      ];

      try {
        await batchService.assignBatchToOrderItems(orderUuid, payload);
        reset();
        onSuccess?.();
      } catch (err: any) {
        setError(err.message || "Failed to assign batches. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600 block">
                Total Required
              </span>
              <Badge
                variant="outline"
                className="font-bold text-base mt-1 bg-white"
              >
                {itemQuantity}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs font-medium text-gray-600 block text-right">
                Status
              </span>
              <Badge
                className={cn(
                  "font-bold text-sm mt-1 shadow-sm",
                  currentAllocationStats.isComplete
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : currentAllocationStats.hasOverAllocation
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-amber-500 text-white hover:bg-amber-600",
                )}
              >
                {currentAllocationStats.isComplete ? (
                  <CheckCircle2 className="h-4 w-4 mr-1 inline" />
                ) : currentAllocationStats.hasOverAllocation ? (
                  <AlertCircle className="h-4 w-4 mr-1 inline" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-1 inline" />
                )}
                {currentAllocationStats.totalAllocated} / {itemQuantity}
              </Badge>
            </div>
          </div>
        </div>

        {!currentAllocationStats.isComplete &&
          !currentAllocationStats.hasOverAllocation && (
            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
              <p className="text-sm font-medium text-amber-800">
                {currentAllocationStats.remaining} units remaining to allocate
              </p>
            </div>
          )}

        {error && (
          <Alert className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {batchAllocations.map((batch, index) => {
              const currentQuantity =
                Number(watchedValues[index]?.quantity) || 0;
              const status = getBatchStatus(currentQuantity);

              return (
                <Controller
                  key={`${batch.batchNumberId}-${index}`}
                  name={`batchNumbers.${index}.quantity`}
                  control={control}
                  render={({ field }) => (
                    <div
                      className={cn(
                        "group relative overflow-hidden rounded-xl  transition-all duration-300 hover:shadow-md",
                        status === "valid" &&
                          currentQuantity > 0 &&
                          "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50",
                        status === "invalid" &&
                          "border-red-300 bg-gradient-to-br from-red-50 to-rose-50",
                        status === "empty" &&
                          "border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                                status === "valid" && currentQuantity > 0
                                  ? "bg-green-500 text-white"
                                  : status === "invalid"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-200 text-gray-600",
                              )}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                                Batch Number
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-sm font-bold bg-white border-2 border-blue-200 text-blue-700 truncate max-w-full"
                              >
                                {batch.batchNumber || "—"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <TextInputField
                            type="number"
                            label=" Quantity to Allocate"
                            placeholder="Enter quantity"
                            min={0}
                            max={itemQuantity}
                            {...field}
                            disabled={isSubmitting}
                            className={cn(
                              "text-base font-bold w-full",
                              status === "valid" &&
                                currentQuantity > 0 &&
                                "border-green-400 focus:border-green-500 focus:ring-green-200",
                              status === "invalid" &&
                                "border-red-400 focus:border-red-500 focus:ring-red-200",
                            )}
                            aria-invalid={status === "invalid"}
                          />
                          {status === "invalid" && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-red-100 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-red-700">
                                Quantity exceeds required amount ({itemQuantity}
                                )
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {status === "valid" && currentQuantity > 0 && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  )}
                />
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              className="w-full "
              disabled={
                isSubmitting || currentAllocationStats.hasOverAllocation
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Assigning Batches...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Assign Batches
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  },
);

export default BatchAllocationEditor;
