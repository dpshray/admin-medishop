import { z } from "zod";

export const bannerCreateSchema = z.object({
    order: z
        .preprocess((v) => (typeof v === "string" ? parseInt(v, 10) : v), z.number().int().min(1, "Order must be a positive integer")),
    title: z.string().nullable().optional(),
    url: z.string().url("Invalid URL").nullable().optional(),
    image: z.any().refine((file) => file instanceof File || typeof file === "string", {
        message: "Image is required",
    }),
    display_status: z.boolean().optional(),
});

export const bannerUpdateSchema = z.object({
    order: z
        .preprocess((v) => (typeof v === "string" ? parseInt(v, 10) : v), z.number().int().min(1, "Order must be a positive integer")),
    title: z.string().nullable().optional(),
    url: z.string().url("Invalid URL").nullable().optional(),
    image: z.any().optional(),
    display_status: z.boolean().optional(),
});

export type BannerCreateInput = z.infer<typeof bannerCreateSchema>;
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>;
