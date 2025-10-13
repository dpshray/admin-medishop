/*
"use client"

import {type ReactNode, useEffect, useRef, useCallback} from "react"
import {useRouter, usePathname} from "next/navigation"
import type {UserRole} from "@/types/user"
import useAuth from "@/hooks/use-auth"

interface ProtectedLayoutProps {
    children: ReactNode
    requiredRoles?: UserRole[]
    fallbackPath?: string
    publicPaths?: string[]
}

export function ProtectedRoute({
                                    children,
                                    requiredRoles = [],
                                    fallbackPath = "/login",
                                    publicPaths = ["/login", "/register", "/forgot-password"],
                                }: ProtectedLayoutProps) {
    const {isLoading, isAuthenticated, hasRole} = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const hasRedirectedRef = useRef(false)
    const isCheckingRef = useRef(false)

    const isPublicPath = publicPaths.includes(pathname)

    const checkAuthorization = useCallback(() => {
        if (isCheckingRef.current || hasRedirectedRef.current || isPublicPath) return

        isCheckingRef.current = true

        if (!isAuthenticated) {
            hasRedirectedRef.current = true
            router.replace(`${fallbackPath}?redirect=${encodeURIComponent(pathname)}`)
            return
        }

        if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
            hasRedirectedRef.current = true
            router.replace("/unauthorized")
            return
        }

        isCheckingRef.current = false
    }, [isAuthenticated, requiredRoles, hasRole, router, fallbackPath, pathname, isPublicPath])

    useEffect(() => {
        hasRedirectedRef.current = false
    }, [pathname])

    useEffect(() => {
        if (!isLoading) {
            checkAuthorization()
        }

        return () => {
            isCheckingRef.current = false
        }
    }, [isLoading, checkAuthorization])

    if (isLoading && !isPublicPath) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center min-h-screen"
            >
                <div
                    className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    aria-hidden="true"
                />
                <span className="sr-only">Verifying authentication</span>
            </div>
        )
    }

    if (!isPublicPath && (!isAuthenticated || (requiredRoles.length > 0 && !hasRole(requiredRoles)))) {
        return null
    }

    return <>{children}</>
}*/
