import {z} from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})


export const createVendorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    store_name: z.string().min(1, "Store name is required"),
    store_description: z.string().min(1, "Store description is required"),
    email: z.email("Invalid email address"),
    alternate_email: z.string().email("Invalid alternate email").optional(),
    mobile_number: z.string().min(1, "Mobile number is required"),
    bank_account_holder_name: z.string().min(1, "Bank account holder name is required"),
    bank_name: z.string().min(1, "Bank name is required"),
    bank_account_number: z.string().min(1, "Bank account number is required"),
    district: z.string().min(1, "District is required"),
    state: z.string().min(1, "State is required"),
    municipality: z.string().min(1, "Municipality is required"),
    location: z.string().min(1, "Location is required"),
    country: z.string().min(1, "Country is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    website: z.string().url("Invalid website URL").optional(),
    is_verified: z.enum(["0", "1"]).default("0"),
    vendor_citizenship_card: z
        .array(z.instanceof(File))
        .min(1, "At least one citizenship card is required"),
    vendor_tax_certificate: z
        .array(z.instanceof(File))
        .min(1, "At least one tax certificate is required"),
    vendor_business_license: z
        .array(z.instanceof(File))
        .min(1, "At least one business license is required"),
});


export type VendorFormValues = z.infer<typeof createVendorSchema>;