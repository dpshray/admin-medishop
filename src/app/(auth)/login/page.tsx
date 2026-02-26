"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TextInputField from "@/components/field/text-input"
import PasswordInputField from "@/components/field/password-input"
import { loginSchema } from "@/lib/schema/schema"
import authService from "@/service/auth.service"
import { toast } from "sonner"

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
    })

    const handleLogin = React.useCallback(async (data: LoginFormValues) => {
        try {
            const response = await authService.login(data)
            const token = response?.data?.token
            const role = response?.data?.user?.user_type?.toLowerCase()

            if (token && role) {
                localStorage.setItem("_at", token)
                localStorage.setItem("_role", role)
                toast.success("Logged in successfully")
                router.push(`/${role}`)
            } else {
                toast.error("Invalid response from server. Please try again.")
            }
        } catch (error: any) {
            toast.error(error?.message || "Login failed. Please check your credentials.")
        }
    }, [router])

    React.useEffect(() => {
        const token = localStorage.getItem("_at")
        const role = localStorage.getItem("_role")
        if (token && role) router.replace(`/${role}`)
    }, [router])

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            <section
                aria-label="Login form"
                className="flex w-full lg:w-1/2 items-center justify-center bg-background px-6 py-12"
            >
                <Card className="w-full shadow-xl border max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            Sign in to your account to continue
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={handleSubmit(handleLogin)}
                            className="space-y-4"
                            noValidate
                        >
                            <TextInputField
                                {...register("email")}
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                error={errors.email?.message}
                                autoComplete="email"
                            />
                            <PasswordInputField
                                {...register("password")}
                                id="password"
                                label="Password"
                                placeholder="Enter your password"
                                error={errors.password?.message}
                                autoComplete="current-password"
                            />
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Button
                                type="submit"
                                className="w-full font-semibold primary-btn"
                                disabled={isSubmitting}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <section
                aria-label="Promotional content"
                className="hidden lg:block w-full lg:w-1/2 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10" />
                <Image
                    src="https://images.pexels.com/photos/7102037/pexels-photo-7102037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Professional workspace with modern design"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
                    <div className="text-center space-y-6 max-w-md">
                        <h2 className="text-4xl font-bold leading-tight">
                            Join thousands of professionals
                        </h2>
                        <p className="text-xl opacity-90">
                            Access powerful tools and insights to accelerate your business growth
                        </p>
                        <div className="flex items-center justify-center space-x-8 pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold">10K+</div>
                                <div className="text-sm opacity-75">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">99.9%</div>
                                <div className="text-sm opacity-75">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">24/7</div>
                                <div className="text-sm opacity-75">Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
