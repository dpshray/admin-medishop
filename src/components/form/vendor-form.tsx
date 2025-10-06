"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createVendorSchema, VendorFormValues } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import { Banknote, FileText, MapPin, Package, Store, User, XCircle } from "lucide-react"
import vendorService from "@/service/vendor.service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function VendorRegistrationForm() {
    const router = useRouter()
    const form = useForm<VendorFormValues>({
        resolver: zodResolver(createVendorSchema) as any,
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
            is_verified: false,
            vendor_citizenship_card: undefined,
            vendor_tax_certificate: undefined,
            vendor_business_license: undefined,
        },
    })

    const {
        handleSubmit,
        setValue,
        reset,
        register,
        formState: { errors, isSubmitting },
    } = form

    const onSubmit = async (data: VendorFormValues) => {
        try {
            console.log("Vendor form submitted:", data)
            const response = await vendorService.createVendor(data)
            if (response) {
                toast.success(response?.message || "Vendor created successfully")
                reset()
                router.push("/admin/vendors")
            }
        } catch (error) {
            console.error("Form submission error:", error)
        }
    }

    const handleFileChange = (
        field: keyof Pick<
            VendorFormValues,
            "vendor_citizenship_card" | "vendor_tax_certificate" | "vendor_business_license"
        >,
        file: File
    ) => {
        setValue(field, file, { shouldValidate: true })
    }


    const handleReset = () => {
        reset()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Vendor Registration
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Register a new vendor with complete details and documents
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl">Vendor Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-10">
                                {/* Personal Information */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-blue-600" />
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

                                {/* Store Information */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Store className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold">Store Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <TextInputField
                                            {...register("store_name")}
                                            label="Store Name"
                                            error={errors.store_name?.message}
                                            required
                                        />
                                        <TextInputField
                                            {...register("store_description")}
                                            label="Store Description"
                                            error={errors.store_description?.message}
                                            textarea
                                            required
                                        />
                                    </div>
                                </section>

                                {/* Banking Information */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Banknote className="w-5 h-5 text-blue-600" />
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

                                {/* Location Information */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-blue-600" />
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

                                {/* Documents */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold">Documents</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileInputField
                                            name="vendor_citizenship_card"
                                            label="Citizenship Card"
                                            onFileChange={(files: File[]) =>
                                                handleFileChange("vendor_citizenship_card", files[0] || null)
                                            }
                                            error={errors.vendor_citizenship_card?.message}
                                        />
                                        <FileInputField
                                            name="vendor_tax_certificate"
                                            label="Tax Certificate"
                                            onFileChange={(files: File[]) =>
                                                handleFileChange("vendor_tax_certificate", files[0] || null)
                                            }
                                            error={errors.vendor_tax_certificate?.message}
                                        />
                                        <FileInputField
                                            name="vendor_business_license"
                                            label="Business License"
                                            onFileChange={(files: File[]) =>
                                                handleFileChange("vendor_business_license", files[0] || null)
                                            }
                                            error={errors.vendor_business_license?.message}
                                        />
                                    </div>
                                </section>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full hover:bg-red-500 hover:text-white cursor-pointer"
                                        disabled={isSubmitting}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit"}
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
