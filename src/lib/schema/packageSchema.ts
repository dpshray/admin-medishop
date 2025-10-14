"use client"

import { z } from "zod"

export const createPackageSchema = z.object({
    name: z.string().min(3, "Package name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    discount_percent: z.coerce.number().min(0).max(100, "Discount must be between 0 and 100"),
    status: z.boolean(),
    featured_image: z.instanceof(File, { message: "Featured image is required" }).optional(),
    gallery_images: z
        .array(z.instanceof(File, { message: "Invalid image file" }))
        .min(1, "At least one gallery image is required"),
})

export const updatePackageSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    price: z.coerce.number().positive("Price must be positive").optional(),
    discount_percent: z
        .coerce.number()
        .min(0, "Discount must be at least 0%")
        .max(100, "Discount cannot exceed 100%")
        .optional(),
    status: z.boolean().optional(),
    featured_image: z.instanceof(File).optional(),
    gallery_images: z.array(z.instanceof(File)).optional(),
    slug: z.string().optional(),
})

export type CreatePackageForm = z.infer<typeof createPackageSchema>
export type UpdatePackageForm = z.infer<typeof updatePackageSchema>
