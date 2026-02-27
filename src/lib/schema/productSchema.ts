"use client";

import { z } from "zod";

const VariationSchema = z.object({
    variant_id: z.number().optional(),
    variant_name: z.string(),
    variant_price: z.number(),
    variant_stock: z.number(),
    variant_unit: z.string(),
    variant_expiry_date: z.string(),
    variant_batch_no: z.string(),
    variant_manufacturer: z.string(),
});

export const createProductSchema = z.object({
    brand_id: z.number(),
    name: z.string(),
    description: z.string(),
    categories: z.array(z.number()),
    tags: z.array(z.number()),
    variations: z.array(VariationSchema).min(1),
    prescription_required: z.boolean().optional().default(false),
    generic_product_name_id: z.number(),
    featured_image: z.instanceof(File),
    gallery_images: z.array(z.instanceof(File)).min(1),
    health_condition: z.array(z.number()),
    discount_percent: z.coerce.number().min(0).max(100),

});

export const updateProductSchema = z.object({
    brand_id: z.number().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    categories: z.array(z.number()).optional(),
    tags: z.array(z.number()).optional(),
    variations: z.array(VariationSchema).optional(),
    prescription_required: z.boolean().optional(),
    featured_image: z.instanceof(File).nullable().optional(),
    gallery_images: z.array(z.instanceof(File)).optional(),
    health_condition: z.array(z.number()).optional(),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    generic_product_name_id: z.number().optional(),
});

export type ProductCreate = z.infer<typeof createProductSchema>;
export type ProductUpdate = z.infer<typeof updateProductSchema>;
export type Variation = z.infer<typeof VariationSchema>;
