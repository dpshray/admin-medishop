"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVendorSchema,
  UpdateVendorFormValues,
  updateVendorSchema,
  VendorFormValues,
} from "@/lib/schema/schema";
import vendorService from "@/service/vendor.service";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import TextInputField from "@/components/field/text-input";
import FileInputField from "@/components/field/file-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Banknote,
  FileText,
  Loader2,
  MapPin,
  Package,
  Plus,
  Save,
  Shield,
  Store,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface VendorFormProps {
  mode: "create" | "edit";
  vendorId?: string;
  initialData?: Partial<VendorFormValues>;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

interface ExistingDocuments {
  citizenship_card?: string;
  tax_certificate?: string;
  business_license?: string;
}

interface ApiVendorData {
  name: string;
  email: string;
  mobile_number: string;
  vendor_details?: {
    store_name?: string;
    store_description?: string;
    location?: string;
    country?: string;
    state?: string;
    district?: string;
    municipality?: string;
    postal_code?: string;
    bank_name?: string;
    bank_account_holder_name?: string;
    bank_account_number?: string;
    account_status?: boolean;
    email_verified?: boolean;
    commission_percentage?: number;

    documents?: {
      citizenship_card?: string[];
      tax_certificate?: string[];
      business_license?: string[];
    };
  };
}

export default function VendorForm({
  mode,
  vendorId,
  initialData,
  onSuccess,
  onCancel,
}: VendorFormProps) {
  const isEditMode = mode === "edit";
  const schema = isEditMode ? updateVendorSchema : createVendorSchema;
  const router = useRouter();

  type FormValues = typeof schema extends typeof createVendorSchema
    ? VendorFormValues
    : UpdateVendorFormValues;

  const [existingDocuments, setExistingDocuments] = useState<ExistingDocuments>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    reset,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: "",
      store_name: "",
      store_description: "",
      email: "",
      mobile_number: "",
      bank_account_holder_name: "",
      bank_name: "",
      bank_account_number: "",
      district: "",
      state: "",
      municipality: "",
      location: "",
      country: "",
      postal_code: "",
      account_status: false,
      vendor_citizenship_card: undefined,
      vendor_tax_certificate: undefined,
      vendor_business_license: undefined,
    } as any,
  });

  const accountStatusValue = watch("account_status") as boolean;

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value != null) {
          setValue(key as keyof FormValues, value as any, {
            shouldValidate: false,
          });
        }
      });
    }
  }, [initialData, setValue]);

  useEffect(() => {
    if (!isEditMode || !vendorId || initialData) return;

    const fetchVendorData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await vendorService.getVendor(vendorId);
        const apiData: ApiVendorData = response?.data;

        if (!apiData) throw new Error("No vendor data found");

        const normalizedData: Partial<FormValues> = {
          name: apiData.name,
          email: apiData.email,
          mobile_number: apiData.mobile_number,
          store_name: apiData.vendor_details?.store_name,
          store_description: apiData.vendor_details?.store_description,
          location: apiData.vendor_details?.location,
          country: apiData.vendor_details?.country,
          state: apiData.vendor_details?.state,
          district: apiData.vendor_details?.district,
          municipality: apiData.vendor_details?.municipality,
          postal_code: apiData.vendor_details?.postal_code,
          bank_name: apiData.vendor_details?.bank_name,
          bank_account_holder_name:
            apiData.vendor_details?.bank_account_holder_name,
          bank_account_number: apiData.vendor_details?.bank_account_number,
          account_status: apiData.vendor_details?.account_status ?? false,
          vendor_citizenship_card: undefined,
          vendor_tax_certificate: undefined,
          vendor_business_license: undefined,
          commission_percentage: apiData.vendor_details?.commission_percentage,
        };

        setExistingDocuments({
          citizenship_card:
            apiData.vendor_details?.documents?.citizenship_card?.[0],
          tax_certificate:
            apiData.vendor_details?.documents?.tax_certificate?.[0],
          business_license:
            apiData.vendor_details?.documents?.business_license?.[0],
        });

        reset(normalizedData);
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to load vendor data";
        toast.error(errorMessage);
        setError(errorMessage);
        router.push("/admin/vendors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [isEditMode, vendorId, initialData, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      let response: any;
      if (isEditMode && vendorId) {
        response = await vendorService.updateVendor(vendorId, data);
        toast.success(response?.message || "Vendor updated successfully");
      } else {
        response = await vendorService.createVendor(data);
        toast.success(response?.message || "Vendor created successfully");
      }

      if (response) {
        onSuccess?.(response);
        router.push("/admin/vendors");
      }
    } catch (error: any) {
      toast.error(
        error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} vendor`,
      );
    }
  };

  const handleFileChange = useCallback(
    (
      field:
        | "vendor_citizenship_card"
        | "vendor_tax_certificate"
        | "vendor_business_license",
      file: File | null,
    ) => {
      setValue(field, file || undefined, { shouldValidate: true });
    },
    [setValue],
  );

  const handleReset = useCallback(() => {
    if (isEditMode && initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof FormValues, value as any, {
          shouldValidate: false,
        });
      });
    } else {
      reset();
    }
    toast.info("Form reset to default values");
  }, [isEditMode, initialData, reset, setValue]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/admin/vendors");
    }
  }, [onCancel, router]);

  const handleAccountStatusToggle = useCallback(
    (checked: boolean) => {
      setValue("account_status", checked, { shouldValidate: true });
    },
    [setValue],
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(onSubmit)(e);
    },
    [handleSubmit, onSubmit],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {isEditMode ? "Edit Vendor" : "Create New Vendor"}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                {isEditMode
                  ? "Update vendor information and documents"
                  : "Register a new vendor with complete details"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel and return"
            >
              <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Cancel
            </Button>
          </header>

          <Card className="shadow-lg border bg-white">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">
                    Vendor Information
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <section aria-labelledby="personal-info">
                  <div className="flex items-center gap-2 mb-4">
                    <User
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                    <h2
                      id="personal-info"
                      className="text-base sm:text-lg font-semibold"
                    >
                      Personal Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <TextInputField
                      {...register("name")}
                      label="Full Name"
                      error={errors.name?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("email")}
                      label="Email Address"
                      type="email"
                      error={errors.email?.message}
                      required
                      readOnly={isEditMode}
                      aria-required="true"
                      aria-readonly={isEditMode}
                    />
                    <TextInputField
                      {...register("mobile_number")}
                      label="Mobile Number"
                      type="tel"
                      error={errors.mobile_number?.message}
                      required
                      aria-required="true"
                    />
                  </div>
                </section>

                <section aria-labelledby="store-info">
                  <div className="flex items-center gap-2 mb-4">
                    <Store
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                    <h2
                      id="store-info"
                      className="text-base sm:text-lg font-semibold"
                    >
                      Store Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <TextInputField
                      {...register("store_name")}
                      label="Store Name"
                      error={errors.store_name?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("store_description")}
                      label="Store Description"
                      error={errors.store_description?.message}
                      textarea
                      required
                      aria-required="true"
                    />
                  </div>
                </section>

                <section aria-labelledby="banking-info">
                  <div className="flex items-center gap-2 mb-4">
                    <Banknote
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                    <h2
                      id="banking-info"
                      className="text-base sm:text-lg font-semibold"
                    >
                      Banking Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <TextInputField
                      {...register("bank_account_holder_name")}
                      label="Account Holder Name"
                      error={errors.bank_account_holder_name?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("bank_name")}
                      label="Bank Name"
                      error={errors.bank_name?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("bank_account_number")}
                      label="Account Number"
                      error={errors.bank_account_number?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("commission_percentage", {
                        valueAsNumber: true,
                      })}
                      label="Commission Percentage"
                      type="number"
                      error={errors.commission_percentage?.message}
                    />
                  </div>
                </section>

                <section aria-labelledby="location-info">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                    <h2
                      id="location-info"
                      className="text-base sm:text-lg font-semibold"
                    >
                      Location Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <TextInputField
                      {...register("country")}
                      label="Country"
                      error={errors.country?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("state")}
                      label="State/Province"
                      error={errors.state?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("district")}
                      label="District"
                      error={errors.district?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("municipality")}
                      label="Municipality"
                      error={errors.municipality?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("postal_code")}
                      label="Postal Code"
                      error={errors.postal_code?.message}
                      required
                      aria-required="true"
                    />
                    <TextInputField
                      {...register("location")}
                      label="Street Address"
                      error={errors.location?.message}
                      required
                      aria-required="true"
                    />
                  </div>
                </section>

                {isEditMode && (
                  <section aria-labelledby="verification-status">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield
                        className="w-5 h-5 text-blue-600"
                        aria-hidden="true"
                      />
                      <h2
                        id="verification-status"
                        className="text-base sm:text-lg font-semibold"
                      >
                        Verification Status
                      </h2>
                    </div>
                    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="account-status"
                          className="text-sm font-medium"
                        >
                          Account Status
                        </Label>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="account-status"
                            checked={accountStatusValue}
                            onCheckedChange={handleAccountStatusToggle}
                            aria-label="Toggle account status"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {accountStatusValue ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <section aria-labelledby="documents">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText
                        className="w-5 h-5 text-blue-600"
                        aria-hidden="true"
                      />
                      <h2
                        id="documents"
                        className="text-base sm:text-lg font-semibold"
                      >
                        Required Documents
                      </h2>
                    </div>
                    {isEditMode && (
                      <span className="text-xs sm:text-sm text-slate-500">
                        Upload new files to replace existing documents
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      {
                        name: "vendor_citizenship_card" as const,
                        label: "Citizenship Card",
                        existingFile: existingDocuments.citizenship_card,
                      },
                      {
                        name: "vendor_tax_certificate" as const,
                        label: "Tax Certificate",
                        existingFile: existingDocuments.tax_certificate,
                      },
                      {
                        name: "vendor_business_license" as const,
                        label: "Business License",
                        existingFile: existingDocuments.business_license,
                      },
                    ].map(({ name, label, existingFile }) => (
                      <div key={name} className="space-y-3">
                        <FileInputField
                          name={name}
                          label={label}
                          required={!isEditMode}
                          error={errors[name]?.message}
                          onFileChange={(files: File[]) =>
                            handleFileChange(name, files[0] ?? null)
                          }
                          helperText={
                            existingFile
                              ? "Replace existing document"
                              : "Allowed: PNG, JPG, JPEG"
                          }
                        />
                        {isEditMode && existingFile && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-600">
                              Current Document:
                            </p>
                            <div className="relative w-full h-32 border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                              <Image
                                src={existingFile}
                                alt={`Current ${label}`}
                                fill
                                className="object-contain p-2"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 sm:flex-none sm:w-32"
                    disabled={isSubmitting}
                    aria-label="Reset form to default values"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-auto"
                    disabled={isSubmitting}
                    aria-label={
                      isEditMode ? "Update vendor" : "Create new vendor"
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          className="w-4 h-4 mr-2 animate-spin"
                          aria-hidden="true"
                        />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditMode ? (
                      <>
                        <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                        Update Vendor
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Create Vendor
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
