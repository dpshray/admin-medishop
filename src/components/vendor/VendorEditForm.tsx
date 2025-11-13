"use client"

import {useEffect, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {createVendorSchema, UpdateVendorFormValues, updateVendorSchema, VendorFormValues} from "@/lib/schema/schema"
import vendorService from "@/service/vendor.service"
import {toast} from "sonner"
import Image from "next/image"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import {Banknote, FileText, MapPin, Package, Plus, Save, Shield, Store, User, XCircle} from "lucide-react"
import {useRouter} from "next/navigation";

interface VendorFormProps {
    mode: "create" | "edit"
    vendorId?: string
    initialData?: Partial<VendorFormValues>
    onSuccess?: (data: any) => void
    onCancel?: () => void
}

interface ExistingDocuments {
    citizenship_card?: string
    tax_certificate?: string
    business_license?: string
}

interface ApiVendorData {
    name: string
    email: string
    mobile_number: string
    vendor_details?: {
        store_name?: string
        store_description?: string
        location?: string
        country?: string
        state?: string
        district?: string
        municipality?: string
        postal_code?: string
        bank_name?: string
        bank_account_holder_name?: string
        bank_account_number?: string
        is_verified?: boolean
        documents?: {
            citizenship_card?: string[]
            tax_certificate?: string[]
            business_license?: string[]
        }
    }
}

export default function VendorManageForm({
                                             mode,
                                             vendorId,
                                             initialData,
                                             onSuccess,
                                             onCancel,
                                         }: VendorFormProps) {
    const isEditMode = mode === "edit"
    const schema = isEditMode ? updateVendorSchema : createVendorSchema
    const route=useRouter()

    type FormValues = typeof schema extends typeof createVendorSchema
        ? VendorFormValues
        : UpdateVendorFormValues

    const [existingDocuments, setExistingDocuments] = useState<ExistingDocuments>({})

    const form = useForm<FormValues>({
        resolver: zodResolver(schema as any),
        defaultValues: isEditMode ? {
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
            is_verified: false,
            vendor_citizenship_card: undefined,
            vendor_tax_certificate: undefined,
            vendor_business_license: undefined,
        } as any : {
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
            is_verified: false,
        } as any,
    })

    const {
        handleSubmit,
        setValue,
        reset,
        register,
        watch,
        formState: {errors, isSubmitting},
    } = form

    const isVerifiedValue = watch("is_verified") as boolean

    useEffect(() => {
        if (initialData) {
            Object.entries(initialData).forEach(([key, value]) => {
                if (value != null) {
                    setValue(key as keyof FormValues, value as any, {shouldValidate: true})
                }
            })
        }
    }, [initialData, setValue])

    useEffect(() => {
        if (!isEditMode || !vendorId || initialData) return

        const fetchVendorData = async () => {
            try {
                const response = await vendorService.getVendor(vendorId)
                const apiData: ApiVendorData = response?.data
                console.log('fetched vendor data: ', apiData,)
                if (!apiData) throw new Error("No vendor data found")

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
                    bank_account_holder_name: apiData.vendor_details?.bank_account_holder_name,
                    bank_account_number: apiData.vendor_details?.bank_account_number,
                    is_verified: apiData.vendor_details?.is_verified ?? false,
                    vendor_citizenship_card: undefined,
                    vendor_tax_certificate: undefined,
                    vendor_business_license: undefined,
                }

                setExistingDocuments({
                    citizenship_card: apiData.vendor_details?.documents?.citizenship_card?.[0],
                    tax_certificate: apiData.vendor_details?.documents?.tax_certificate?.[0],
                    business_license: apiData.vendor_details?.documents?.business_license?.[0],
                })

                reset(normalizedData)
            } catch {
                toast.error("Failed to load vendor data")
            }
        }

        fetchVendorData()
    }, [isEditMode, vendorId, initialData, reset])

    const onSubmit = async (data: FormValues) => {
        try {
            let response: any
            if (isEditMode && vendorId) {
                response = await vendorService.updateVendor(vendorId, data)
                toast.success(response?.message || "Vendor updated successfully")
                if (response) route.push('/admin/vendors')
            } else {
                response = await vendorService.createVendor(data)
                toast.success(response?.message || "Vendor created successfully")
                if (response) route.push('/admin/vendors')
                reset()
            }
            onSuccess?.(response)
        } catch {
            toast.error(`Failed to ${isEditMode ? "update" : "create"} vendor`)
        }
    }

    const handleFileChange = (
        field: "vendor_citizenship_card" | "vendor_tax_certificate" | "vendor_business_license",
        file: File | null
    ) => {
        setValue(field, file || undefined, {shouldValidate: true})
    }

    const handleReset = () => {
        if (isEditMode && initialData) {
            Object.entries(initialData).forEach(([key, value]) => {
                setValue(key as keyof FormValues, value as any, {shouldValidate: true})
            })
        } else {
            reset()
        }
    }

    const handleCancel = () => {
        if (onCancel) onCancel()
        else handleReset()
    }

    const handleVerificationToggle = (checked: boolean) => {
        setValue("is_verified", checked, {shouldValidate: true})
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {isEditMode ? "Edit Vendor" : "Vendor Registration"}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {isEditMode
                                    ? "Update vendor details and documents"
                                    : "Register a new vendor with complete details and documents"}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                                <XCircle className="w-4 h-4 mr-2"/>
                                Cancel
                            </Button>
                        </div>
                    </header>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600"/>
                                    </div>
                                    <CardTitle className="text-xl">Vendor Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-10">
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Personal Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField
                                            {...register("name")}
                                            label="Full Name"
                                            error={errors.name?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("email")}
                                            label="Email"
                                            type="email"
                                            error={errors.email?.message}
                                            required
                                            readOnly={isEditMode}
                                        />
                                        <TextInputField
                                            {...register("mobile_number")}
                                            label="Mobile Number"
                                            type="tel"
                                            error={errors.mobile_number?.message}
                                            required
                                        />
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Store className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Store Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField
                                            {...register("store_name")}
                                            label="Store Name"
                                            error={errors.store_name?.message}
                                            required
                                        />
                                        <div className="md:col-span-2">
                                            <TextInputField
                                                {...register("store_description")}
                                                label="Store Description"
                                                error={errors.store_description?.message}
                                                textarea
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Banknote className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Banking Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField
                                            {...register("bank_account_holder_name")}
                                            label="Account Holder Name"
                                            error={errors.bank_account_holder_name?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("bank_name")}
                                            label="Bank Name"
                                            error={errors.bank_name?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("bank_account_number")}
                                            label="Account Number"
                                            error={errors.bank_account_number?.message}
                                            required
                                        />
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Location Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField
                                            {...register("district")}
                                            label="District"
                                            error={errors.district?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("state")}
                                            label="State"
                                            error={errors.state?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("municipality")}
                                            label="Municipality"
                                            error={errors.municipality?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("location")}
                                            label="Location"
                                            error={errors.location?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("country")}
                                            label="Country"
                                            error={errors.country?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("postal_code")}
                                            label="Postal Code"
                                            error={errors.postal_code?.message}
                                            required
                                        />
                                    </div>
                                </section>

                                {isEditMode && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Shield className="w-5 h-5 text-blue-600"/>
                                            <h2 className="text-lg font-semibold">Verification Status</h2>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="verification-status"
                                                checked={isVerifiedValue}
                                                onCheckedChange={handleVerificationToggle}
                                            />
                                            <Label htmlFor="verification-status">
                                                {isVerifiedValue ? "Verified" : "Not Verified"}
                                            </Label>
                                        </div>
                                    </section>
                                )}

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Documents</h2>
                                        {isEditMode && (
                                            <span className="text-sm text-gray-500 ml-2">
                        (Upload new files to replace existing ones)
                      </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        ].map(({name, label, existingFile}) => (
                                            <div key={name} className="space-y-4">
                                                <FileInputField
                                                    name={name}
                                                    label={label}
                                                    required={!isEditMode}
                                                    error={errors[name]?.message}
                                                    onFileChange={(files: File[]) =>
                                                        handleFileChange(name, files[0] ?? null)
                                                    }
                                                />
                                                {isEditMode && existingFile && (
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-gray-500">Current file:</p>
                                                        <div
                                                            className="relative w-32 h-20 border rounded overflow-hidden">
                                                            <Image
                                                                src={existingFile}
                                                                alt={`Current ${label}`}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 128px) 100vw, 128px"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant={'outline'}
                                        onClick={handleReset}
                                        className=" "
                                        disabled={isSubmitting}
                                    >
                                        Reset
                                    </Button>
                                    <Button type="submit" className="primary-btn" disabled={isSubmitting}>
                                        {isEditMode ? (
                                            <>
                                                <Save className="w-4 h-4 mr-2"/>
                                                {isSubmitting ? "Updating..." : "Update Vendor"}
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2"/>
                                                {isSubmitting ? "Creating..." : "Create Vendor"}
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
    )
}