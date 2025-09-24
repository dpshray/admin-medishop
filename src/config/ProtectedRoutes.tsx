"use client"

import {ReactNode, useEffect} from "react"
import {useRouter} from "next/navigation"
import type {UserRole} from "@/types/user"
import {useAuth} from "@/hooks/use-auth";

interface ProtectedRouteProps {
    children: ReactNode
    requiredRoles?: UserRole[]
    fallbackPath?: string
}

export function ProtectedRoute({
                                   children,
                                   requiredRoles = [],
                                   fallbackPath = "/login",
                               }: ProtectedRouteProps) {
    const {isLoading, isAuthenticated, hasRole} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.replace(fallbackPath)
            return
        }

        if (requiredRoles.length && !hasRole(requiredRoles)) {
            router.replace("/unauthorized")
        }
    }, [isLoading, isAuthenticated, requiredRoles, hasRole, router, fallbackPath])

    if (isLoading) {
        return (
            <main
                role="alert"
                aria-busy="true"
                className="flex items-center justify-center min-h-screen"
            >
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                    aria-label="Loading"
                ></div>
            </main>
        )
    }

    if (!isAuthenticated || (requiredRoles.length && !hasRole(requiredRoles))) {
        return null
    }

    return <>{children}</>
}
