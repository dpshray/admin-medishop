"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TextInputField from "@/components/field/text-input";
import {
  useCreateProductForm,
  useUpdateProductForm,
  useDeletePackageType,
  useDeleteUnitType,
} from "@/hooks/useProduct";
import type { ProductForm } from "@/components/table/ProductFormTable";

// ── Schema ────────────────────────────────────────────────────────────────────

const unitTypeSchema = z.object({
  id: z.number().optional(),
  uuid: z.string().optional(),
  name: z.string().min(1, "Unit name is required"),
});

const packageTypeSchema = z.object({
  id: z.number().optional(),
  uuid: z.string().optional(),
  name: z.string().min(1, "Package type name is required"),
  unit_types: z.array(unitTypeSchema).min(1, "At least one unit is required"),
});

const productFormSchema = z.object({
  name: z.string().min(1, "Form type name is required"),
  package_types: z
    .array(packageTypeSchema)
    .min(1, "At least one package type is required"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: ProductForm | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductFormModal({
  open,
  onOpenChange,
  editItem,
}: ProductFormModalProps) {
  const isEdit = !!editItem;

  const { mutateAsync: createProductForm, isPending: creating } =
    useCreateProductForm();
  const { mutateAsync: updateProductForm, isPending: updating } =
    useUpdateProductForm();
  const { mutate: deletePackageType } = useDeletePackageType();
  const { mutate: deleteUnitType } = useDeleteUnitType();

  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      package_types: [{ name: "", unit_types: [{ name: "" }] }],
    },
  });

  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({ control, name: "package_types" });

  // ── Populate on edit ──────────────────────────────────────────────────────

  useEffect(() => {
    if (open) {
      if (editItem) {
        reset({
          name: editItem.name,
          package_types:
            editItem.package_types.length > 0
              ? editItem.package_types.map((pt) => ({
                  id: pt.id,
                  uuid: pt.uuid,
                  name: pt.name,
                  unit_types:
                    pt.unit_types.length > 0
                      ? pt.unit_types.map((u) => ({
                          id: u.id,
                          uuid: u.uuid,
                          name: u.name,
                        }))
                      : [{ name: "" }],
                }))
              : [{ name: "", unit_types: [{ name: "" }] }],
        });
      } else {
        reset({
          name: "",
          package_types: [{ name: "", unit_types: [{ name: "" }] }],
        });
      }
    }
  }, [open, editItem, reset]);

  // ── Package type removal ──────────────────────────────────────────────────

  const handleRemovePackage = (pkgIndex: number, uuid?: string) => {
    if (uuid) {
      // Existing record — call API then remove from form
      deletePackageType(uuid, {
        onSuccess: () => removePackage(pkgIndex),
      });
    } else {
      // Newly added — just remove locally
      removePackage(pkgIndex);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (values: ProductFormValues) => {
    if (isEdit && editItem) {
      const payload = {
        name: values.name.trim(),
        package_types: values.package_types.map((pt) => ({
          ...(pt.uuid !== undefined && { uuid: pt.uuid }),
          name: pt.name.trim(),
          unit_types: pt.unit_types.map((u) => ({
            ...(u.uuid !== undefined && { uuid: u.uuid }),
            name: u.name.trim(),
          })),
        })),
      };
      await updateProductForm(
        { uuid: editItem.uuid, data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      const payload = {
        name: values.name.trim(),
        package_types: values.package_types.map((pt) => ({
          name: pt.name.trim(),
          unit_types: pt.unit_types.map((u) => ({ name: u.name.trim() })),
        })),
      };
      await createProductForm(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto py-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {isEdit ? (
              <>
                <Pencil className="h-5 w-5 text-blue-500" />
                Update Product Form
              </>
            ) : (
              <>
                <Layers className="h-5 w-5 text-primary" />
                Create Product Form
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5 py-2"
        >
          {/* Form Type Name */}
          <TextInputField
            label="Form Type Name"
            placeholder="e.g. Tablet, Syrup, Capsule"
            required
            error={errors.name?.message}
            {...register("name")}
          />

          {/* Package Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Package Types <span className="text-destructive">*</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  appendPackage({ name: "", unit_types: [{ name: "" }] })
                }
              >
                <Plus className="h-3 w-3" />
                Add Package Type
              </Button>
            </div>

            {errors.package_types?.root?.message && (
              <p className="text-xs text-destructive">
                {errors.package_types.root.message}
              </p>
            )}

            <div className="space-y-3">
              {packageFields.map((pkgField, pkgIndex) => (
                <PackageTypeRow
                  key={pkgField.id}
                  pkgIndex={pkgIndex}
                  pkgUuid={(pkgField as any).uuid}
                  control={control}
                  register={register}
                  errors={errors}
                  canRemove={packageFields.length > 1}
                  onRemove={() =>
                    handleRemovePackage(pkgIndex, (pkgField as any).uuid)
                  }
                  onDeleteUnitType={deleteUnitType}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── PackageTypeRow (nested field array) ───────────────────────────────────────

interface PackageTypeRowProps {
  pkgIndex: number;
  pkgUuid?: string;
  control: any;
  register: any;
  errors: any;
  canRemove: boolean;
  onRemove: () => void;
  onDeleteUnitType: (
    uuid: string,
    options?: { onSuccess?: () => void },
  ) => void;
}

function PackageTypeRow({
  pkgIndex,
  control,
  register,
  errors,
  canRemove,
  onRemove,
  onDeleteUnitType,
}: PackageTypeRowProps) {
  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: `package_types.${pkgIndex}.unit_types`,
  });

  const handleRemoveUnit = (unitIndex: number, uuid?: string) => {
    if (uuid) {
      // Existing record — call API then remove from form
      onDeleteUnitType(uuid, {
        onSuccess: () => removeUnit(unitIndex),
      });
    } else {
      // Newly added — just remove locally
      removeUnit(unitIndex);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      {/* Package type name row */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TextInputField
            label={pkgIndex === 0 ? "Package Type Name" : ""}
            placeholder="e.g. Strip, Bottle, Box"
            required
            error={errors.package_types?.[pkgIndex]?.name?.message}
            {...register(`package_types.${pkgIndex}.name`)}
          />
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ${pkgIndex === 0 ? "mt-6" : "mt-0.5"}`}
            onClick={onRemove}
            aria-label={`Remove package type ${pkgIndex + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Unit types */}
      <div className="space-y-2 pl-2 border-l-2 border-muted">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Unit Types <span className="text-destructive">*</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 text-muted-foreground"
            onClick={() => appendUnit({ name: "" })}
          >
            <Plus className="h-3 w-3" />
            Add Unit
          </Button>
        </div>

        {errors.package_types?.[pkgIndex]?.unit_types?.root?.message && (
          <p className="text-xs text-destructive">
            {errors.package_types[pkgIndex].unit_types.root.message}
          </p>
        )}

        {unitFields.map((unitField, unitIndex) => (
          <div key={unitField.id} className="flex items-center gap-2">
            <div className="flex-1">
              <TextInputField
                placeholder="e.g. tablets, ml, g"
                required
                error={
                  errors.package_types?.[pkgIndex]?.unit_types?.[unitIndex]
                    ?.name?.message
                }
                {...register(
                  `package_types.${pkgIndex}.unit_types.${unitIndex}.name`,
                )}
              />
            </div>
            {unitFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 mt-0.5"
                onClick={() =>
                  handleRemoveUnit(unitIndex, (unitField as any).uuid)
                }
                aria-label={`Remove unit ${unitIndex + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
