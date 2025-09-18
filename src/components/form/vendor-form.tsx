"use client"

import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"


import {createVendorSchema, VendorFormValues} from "@/lib/schema"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"

import {Banknote, FileText, MapPin, Package, Store, User, XCircle} from "lucide-react"

export default function VendorRegistrationForm() {
    const form = useForm<VendorFormValues>({
        resolver: zodResolver(createVendorSchema) as any,
        defaultValues: {
            name: "",
            store_name: "",
            store_description: "",
            email: "",
            alternate_email: "",
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
            website: "",
            is_verified: "0",
            vendor_citizenship_card: [],
            vendor_tax_certificate: [],
            vendor_business_license: [],
        },
    })

    const {
        handleSubmit,
        setValue,
        reset,
        formState: {errors},
    } = form

    const onSubmit = (data: VendorFormValues) => {
        console.log("Vendor form submitted:", data)
    }

    const handleFileChange = (field: keyof VendorFormValues, files: File[]) => {
        setValue(field, files, {shouldValidate: true})
    }

    const handleReset = () => {
        reset()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
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
                            <Button type="button" variant="outline" size="sm">
                                <XCircle className="w-4 h-4 mr-2"/>
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600"/>
                                    </div>
                                    <CardTitle className="text-xl">Vendor Information</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Personal Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField name="name" label="Full Name" error={errors.name?.message}/>
                                        <TextInputField name="email" label="Email" error={errors.email?.message}/>
                                        <TextInputField name="alternate_email" label="Alternate Email"
                                                        error={errors.alternate_email?.message}/>
                                        <TextInputField name="mobile_number" label="Mobile Number"
                                                        error={errors.mobile_number?.message}/>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Store className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Store Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField name="store_name" label="Store Name"
                                                        error={errors.store_name?.message}/>
                                        <TextInputField name="store_description" label="Store Description" textarea
                                                        error={errors.store_description?.message}/>
                                        <TextInputField name="website" label="Website" error={errors.website?.message}/>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Banknote className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Banking Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField name="bank_account_holder_name" label="Account Holder Name"
                                                        error={errors.bank_account_holder_name?.message}/>
                                        <TextInputField name="bank_name" label="Bank Name"
                                                        error={errors.bank_name?.message}/>
                                        <TextInputField name="bank_account_number" label="Account Number"
                                                        error={errors.bank_account_number?.message}/>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Location Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TextInputField name="district" label="District"
                                                        error={errors.district?.message}/>
                                        <TextInputField name="state" label="State" error={errors.state?.message}/>
                                        <TextInputField name="municipality" label="Municipality"
                                                        error={errors.municipality?.message}/>
                                        <TextInputField name="location" label="Location"
                                                        error={errors.location?.message}/>
                                        <TextInputField name="country" label="Country" error={errors.country?.message}/>
                                        <TextInputField name="postal_code" label="Postal Code"
                                                        error={errors.postal_code?.message}/>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-semibold">Documents</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileInputField
                                            name="vendor_citizenship_card"
                                            label="Citizenship Card"
                                            multiple
                                            onFileChange={(files: File[]) => handleFileChange("vendor_citizenship_card", files)}
                                            error={errors.vendor_citizenship_card?.message as string}
                                        />
                                        <FileInputField
                                            name="vendor_tax_certificate"
                                            label="Tax Certificate"
                                            multiple
                                            onFileChange={(files: File[]) => handleFileChange("vendor_tax_certificate", files)}
                                            error={errors.vendor_tax_certificate?.message as string}
                                        />
                                        <FileInputField
                                            name="vendor_business_license"
                                            label="Business License"
                                            multiple
                                            onFileChange={(files: File[]) => handleFileChange("vendor_business_license", files)}
                                            error={errors.vendor_business_license?.message as string}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" className="w-full">Submit</Button>
                                    <Button type="button" variant="outline" onClick={handleReset}
                                            className="w-full">Reset</Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}
