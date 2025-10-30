import {z} from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export const createVendorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    store_name: z.string().min(1, "Store name is required"),
    store_description: z.string().min(1, "Store description is required"),
    email: z.string().email("Invalid email address"),
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
    is_verified: z.boolean().default(false),
    vendor_citizenship_card: z.instanceof(File, {message: "Citizenship card is required"}),
    vendor_tax_certificate: z.instanceof(File, {message: "Tax certificate is required"}),
    vendor_business_license: z.instanceof(File, {message: "Business license is required"}),
});

export const updateVendorSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    store_name: z.string().min(1, "Store name is required").optional(),
    store_description: z.string().min(1, "Store description is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    mobile_number: z.string().optional(),
    bank_account_holder_name: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    municipality: z.string().optional(),
    location: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    is_verified: z.boolean().optional(),
    vendor_citizenship_card: z.instanceof(File).optional(),
    vendor_tax_certificate: z.instanceof(File).optional(),
    vendor_business_license: z.instanceof(File).optional(),
});


export const VendorProductSchema = z.object({
    product_uuid: z.string().min(1, "Please select a product"),
    variations: z.array(
        z.object({
            product_variation_id: z.number(),
            units_in_stock: z.number().min(0, "Size value must be non-negative"),
            price: z.number().min(0, "Price must be non-negative"),
        })
    ).min(1, "At least one variation is required"),
})

export type VendorProductForm = z.infer<typeof VendorProductSchema>
export type VendorFormValues = z.infer<typeof createVendorSchema>;
export type UpdateVendorFormValues = z.infer<typeof updateVendorSchema>;
