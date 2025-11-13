import { z } from "zod"

export const couponSchema = z.object({
    id: z.number().int().optional(),
    coupon_code: z.string().min(1, "Coupon code is required"),
    description: z.string().min(1, "Description is required"),
    discount_percent: z
        .number()
        .min(0, "Discount must be at least 0%")
        .max(100, "Discount cannot exceed 100%"),
    is_active: z.boolean().default(true),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
})

export const updateCouponSchema = z.object({
    id: z.number().int().optional(),
    coupon_code: z.string().min(1, "Coupon code is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    discount_percent: z
        .number()
        .min(0, "Discount must be at least 0%")
        .max(100, "Discount cannot exceed 100%")
        .optional(),
    is_active: z.boolean().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
})

export type Coupon = z.infer<typeof couponSchema>
export type UpdateCoupon = z.infer<typeof updateCouponSchema>
