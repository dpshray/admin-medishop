"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {Checkbox} from "@/components/ui/checkbox"
import {Github, Lock, Mail, User} from "lucide-react"
import TextInputField from "@/components/field/text-input"
import PasswordInputField from "@/components/field/password-input"

const registerSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm your password"),
        agreeToTerms: z.boolean().refine(val => val, {
            message: "You must agree to the Terms and Privacy Policy",
        }),
        accountType: z.enum(["vendor", "user"]).default("user"),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        watch,
        formState: {errors, isSubmitting},
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {accountType: "user"},
    })

    const onSubmit = async (data: RegisterFormValues) => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log(data)
    }

    const accountType = watch("accountType")

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-6 py-12">
                <Card className="w-full shadow-xl border max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle
                            className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Create Account
                        </CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            Join our platform and start your journey
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <TextInputField
                                    {...register("firstName")}
                                    label="First Name"
                                    placeholder="First name"
                                    error={errors.firstName?.message}
                                    icon={User}
                                />
                                <TextInputField
                                    {...register("lastName")}
                                    label="Last Name"
                                    placeholder="Last name"
                                    error={errors.lastName?.message}
                                    icon={User}
                                />
                            </div>
                            <TextInputField
                                {...register("email")}
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                error={errors.email?.message}
                                icon={Mail}
                            />
                            <PasswordInputField
                                {...register("password")}
                                label="Password"
                                id="password"
                                placeholder="Create a password"
                                error={errors.password?.message}
                                icon={Lock}
                            />
                            <PasswordInputField
                                {...register("confirmPassword")}
                                label="Confirm Password"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                error={errors.confirmPassword?.message}
                                icon={Lock}
                            />
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    {...register("agreeToTerms")}
                                    aria-invalid={!!errors.agreeToTerms}
                                />
                                <label htmlFor="terms" className="text-sm leading-5">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full h-11 font-semibold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full"/>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or sign up with
                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => console.log("Google signup")}
                            >
                                <Mail className="mr-2 h-4 w-4"/> Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => console.log("GitHub signup")}
                            >
                                <Github className="mr-2 h-4 w-4"/> GitHub
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => console.log("Facebook signup")}
                            >
                                <User className="mr-2 h-4 w-4"/> Facebook
                            </Button>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Log in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:block w-full lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 to-primary/5 z-10"/>
                <Image
                    src="https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Modern office space with collaborative workspace"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
                    <div className="text-center space-y-6 max-w-md">
                        <h2 className="text-4xl font-bold leading-tight">
                            {accountType === "vendor"
                                ? "Build your business with us"
                                : "Start your professional journey"}
                        </h2>
                        <p className="text-xl opacity-90">
                            {accountType === "vendor"
                                ? "Join thousands of successful vendors and grow your business reach"
                                : "Connect with industry leaders and unlock opportunities for growth"}
                        </p>
                        <div className="flex items-center justify-center space-x-8 pt-6">
                            {accountType === "vendor" ? (
                                <>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">5K+</div>
                                        <div className="text-sm opacity-75">Active Vendors</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">2M+</div>
                                        <div className="text-sm opacity-75">Monthly Sales</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">4.9★</div>
                                        <div className="text-sm opacity-75">Vendor Rating</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">50K+</div>
                                        <div className="text-sm opacity-75">New Users</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">100+</div>
                                        <div className="text-sm opacity-75">Countries</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">5★</div>
                                        <div className="text-sm opacity-75">Rating</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
