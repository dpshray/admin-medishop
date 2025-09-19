

import {z} from "zod";

export const variationSchema = z.object({
    size_value: z.number().min(1, "Size value must be at least 1"),
    size_unit: z.string().min(1, "Size unit is required"),
    platform_price: z.number().min(1, "Price must be at least 1"),
});

export const productSchema = z.object({
    brand_id: z.number(),
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z.string().optional(),
    categories: z.array(z.number()).min(1, "Select at least one category"),
    tags: z.array(z.number()).min(1, "Select at least one tag"),
    variations: z.array(variationSchema).min(1, "At least one variation is required"),
    featured_image: z.instanceof(File).nullable().optional(),
    gallery_images: z.array(z.instanceof(File)).min(1, "At least one gallery image is required"),
});

export const updateProductSchema = productSchema.partial();

export type ProductFormValues = z.infer<typeof productSchema>;
