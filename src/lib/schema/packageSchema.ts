import {z} from "zod";

export const createPackageSchema = z.object({
    name: z.string().min(3, "Package name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.string().refine((val) => !isNaN(parseFloat(val)), {
        message: "Price must be a valid number",
    }),
    discount_percent: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)), {message: "Discount must be a number"}),
    status: z.boolean(),
    featured_image: z.instanceof(File, {message: "Featured image is required"}).optional(),
    gallery_images: z.array(z.instanceof(File)).min(1, "At least one gallery image is required"),
});

export const updatePackageSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    discount_percent: z.number().min(0).max(100).optional(),
    status: z.boolean().optional(),
    featured_image: z.instanceof(File).optional(),
    gallery_images: z.array(z.instanceof(File)).optional(),
    slug: z.string().optional(),
});

export type CreatePackageForm = z.infer<typeof createPackageSchema>;
export type UpdatePackageForm = z.infer<typeof updatePackageSchema>;
