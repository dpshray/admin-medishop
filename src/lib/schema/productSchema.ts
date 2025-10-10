"use client"

import {z} from "zod"

export const VariationSchema = z.object({
    variation_id: z.number().optional(),
    name: z.string(),
    size_value: z.number(),
    size_unit: z.string(),
    platform_price: z.number(),
})

export const createProductSchema = z.object({
    brand_id: z.number(),
    name: z.string(),
    description: z.string(),
    categories: z.array(z.number()),
    tags: z.array(z.number()),
    variations: z.array(VariationSchema),
    prescription_required: z.boolean().optional().default(false),
    featured_image: z.instanceof(File),
    gallery_images: z.array(z.instanceof(File)).min(1, "At least one gallery image is required"),

})

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
})

export type ProductCreate = z.infer<typeof createProductSchema>
export type ProductUpdate = z.infer<typeof updateProductSchema>
export type Variation = z.infer<typeof VariationSchema>
