"use client";

import {z} from "zod";

export const variationSchema = z.object({
    size_value: z.number().min(1),
    size_unit: z.string().min(1),
    platform_price: z.number().min(1),
})

export const productSchema = z.object({
    brand_id: z.number(),
    name: z.string().min(2),
    description: z.string(),
    categories: z.array(z.number()).min(1),
    tags: z.array(z.number()).min(1),
    variations: z.array(variationSchema).min(1),
    featured_image: z.instanceof(File).nullable().optional(),
    gallery_images: z.array(z.instanceof(File)).min(1),
})

export type ProductFormValues = z.infer<typeof productSchema>;
