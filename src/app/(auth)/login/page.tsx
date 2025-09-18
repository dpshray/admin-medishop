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
import {Github, Mail} from "lucide-react"
import TextInputField from "@/components/field/text-input"
import PasswordInputField from "@/components/field/password-input"
import {loginSchema} from "@/lib/schema";
import authService from "@/service/auth.service";
import {useRouter} from "next/navigation";


type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await authService.login(data)
            console.log('Response from', response)
            if (response) {
                localStorage.setItem("_at", response?.data?.token)
                localStorage.setItem("_role", response?.data?.user?.user_type?.toLowerCase() || "")
                router.push( '/admin')
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-6 py-12">
                <Card className="w-full shadow-xl border max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle
                            className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            Sign in to your account to continue
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <TextInputField
                                {...register("email")}
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                error={errors.email?.message}
                            />
                            <PasswordInputField
                                {...register("password")}
                                label="Password"
                                id="password"
                                placeholder="Enter your password"
                                error={errors.password?.message}
                            />
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Button
                                type="submit"
                                className="w-full font-semibold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full"/>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or continue with
                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                className=" font-medium"
                                onClick={() => console.log("Login with Google")}
                            >
                                <Mail className="w-5 h-5"/>
                            </Button>
                            <Button
                                variant="outline"
                                className="font-medium"
                                onClick={() => console.log("Login with GitHub")}
                            >
                                <Github className="w-5 h-5"/>
                            </Button>
                            <Button
                                variant="outline"
                                className="font-medium"
                                onClick={() => console.log("Login with Facebook")}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                    />
                                </svg>
                            </Button>
                        </div>
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Don&#39;t have an account? </span>
                            <Link
                                href="/register"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Create account
                            </Link>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                                By signing in, you agree to our{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:block w-full lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10"/>
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
            </div>
        </div>
    )
}
