import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createVendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  store_name: z.string().min(1, "Store name is required"),
  store_description: z.string().optional(),
  email: z.string().email("Invalid email address"),
  mobile_number: z.string().min(1, "Mobile number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),

  bank_account_holder_name: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  municipality: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  account_status: z.boolean().default(false),
  vendor_citizenship_card: z.instanceof(File).optional(),
  vendor_tax_certificate: z.instanceof(File).optional(),
  vendor_business_license: z.instanceof(File).optional(),
  commission_percentage: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || isNaN(Number(val))
        ? undefined
        : Number(val),
    z.number().min(0).max(100).optional(),
  ),
});

export const updateVendorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  store_name: z.string().min(1, "Store name is required").optional(),
  store_description: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  email: z.string().email("Invalid email address").optional(),
  mobile_number: z.string().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  bank_account_holder_name: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  bank_name: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  bank_account_number: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  district: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  state: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  municipality: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  location: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  country: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  postal_code: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  account_status: z.boolean().optional(),
  vendor_citizenship_card: z.instanceof(File).optional(),
  vendor_tax_certificate: z.instanceof(File).optional(),
  vendor_business_license: z.instanceof(File).optional(),
  commission_percentage: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || isNaN(Number(val))
        ? undefined
        : Number(val),
    z.number().min(0).max(100).optional(),
  ),
});

export const VendorProductSchema = z.object({
  product_uuid: z.string().min(1, "Please select a product"),
  variations: z
    .array(
      z.object({
        product_variation_id: z.number(),
        units_in_stock: z.number().min(0, "Size value must be non-negative"),
        price: z.number().min(0, "Price must be non-negative"),
        // variant_manufacturer: z.string().min(1, "Manufacturer is required"),
        variant_batch_no: z.string().min(1, "Batch number is required"),
        variant_expiry_date: z.string().min(1, "Expiry date is required"),
      }),
    )
    .min(1, "At least one variation is required"),
});

export type VendorProductForm = z.infer<typeof VendorProductSchema>;
export type VendorFormValues = z.infer<typeof createVendorSchema>;
export type UpdateVendorFormValues = z.infer<typeof updateVendorSchema>;
