import z from "zod"

export const createPackageSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    discount_percent: z.number().min(0).max(100).optional(),
    status: z.boolean(),
    start_timestamps: z.string(),
    end_timestamps: z.string(),
    products: z.array(
        z.object({
            product_variation_id: z.number().int(),
            quantity: z.number().int().positive(),
        })
    ),
    featured_image: z.instanceof(File),
    gallery_images: z.array(z.instanceof(File)).optional(),
    slug: z.string().optional(),
})

export const updatePackageSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    discount_percent: z.number().min(0).max(100).optional(),
    status: z.boolean().optional(),
    start_timestamps: z.string().optional(),
    end_timestamps: z.string().optional(),
    products: z.array(
        z.object({
            product_variation_id: z.number().int().optional(),
            quantity: z.number().int().positive().optional(),
        })
    ).optional(),
    featured_image: z.instanceof(File).optional(),
    gallery_images: z.array(z.instanceof(File)).optional(),
    slug: z.string().optional(),
})

export type CreatePackageForm = z.infer<typeof createPackageSchema>
export type UpdatePackageForm = z.infer<typeof updatePackageSchema>
