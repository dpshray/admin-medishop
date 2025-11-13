import {z} from "zod";

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    status: z.enum(["Active", "Inactive"]),
    user_type: z.enum(["ADMIN", "USER", "MODERATOR"]),
    mobile_number: z
        .string()
        .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    image:z.instanceof(File),
    loyality_points: z.number().nonnegative("Loyalty points cannot be negative"),
});

export const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    user_type: z.enum(["ADMIN", "USER", "MODERATOR"]).optional(),
    mobile_number: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits").optional(),
    image:z.instanceof(File).optional(),
    loyality_points: z.number().nonnegative("Loyalty points cannot be negative").optional(),
})


export type UpdateUserForm = z.infer<typeof updateUserSchema>;
export type User = z.infer<typeof userSchema>;
