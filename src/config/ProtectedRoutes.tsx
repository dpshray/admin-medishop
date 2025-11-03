'use client'

import { memo, type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type UserRole = 'admin' | 'vendor' | 'user'

interface ProtectedLayoutProps {
    children: ReactNode
    requiredRoles?: UserRole[]
    fallbackPath?: string
    publicPaths?: string[]
}

const LoadingSpinner = memo(() => (
    <div role="status" aria-live="polite" aria-busy="true" className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
        <span className="sr-only">Verifying authentication</span>
    </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

const UnauthorizedAlert = memo(() => (
    <div role="alert" aria-live="assertive" className="sr-only">
        Access denied. Redirecting to login.
    </div>
))
UnauthorizedAlert.displayName = 'UnauthorizedAlert'

export const ProtectedRoute = memo(function ProtectedRoute({
                                                               children,
                                                               requiredRoles = [],
                                                               fallbackPath = '/login',
                                                               publicPaths = ['/login', '/register', '/forgot-password'],
                                                           }: ProtectedLayoutProps) {
    const { isLoading, isAuthenticated, hasRole, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const hasRedirectedRef = useRef(false)
    const redirectTimeoutRef = useRef<number | null>(null)
    const mountedRef = useRef(true)

    const pathChecks = useMemo(
        () => ({
            isPublic: publicPaths.includes(pathname),
            isVendor: pathname.startsWith('/vendor'),
            isAdmin: pathname.startsWith('/admin'),
            isUnauthorized: pathname === '/unauthorized',
        }),
        [pathname, publicPaths]
    )

    const userRole = useMemo(() => user?.role as UserRole | undefined, [user?.role])

    const hasRequiredRole = useMemo(() => {
        if (requiredRoles.length === 0) return true
        return requiredRoles.some(role => hasRole(role))
    }, [requiredRoles, hasRole])

    const sanitizeRedirectUrl = useCallback(
        (url: string): string => {
            try {
                const parsed = new URL(url, window.location.origin)
                if (parsed.origin !== window.location.origin) return fallbackPath
                const safePath = parsed.pathname.replace(/[^\w\-\/]/g, '')
                return safePath + parsed.search
            } catch {
                return fallbackPath
            }
        },
        [fallbackPath]
    )

    const performRedirect = useCallback(
        (destination: string) => {
            if (hasRedirectedRef.current || !mountedRef.current) return
            hasRedirectedRef.current = true

            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current)
            }

            const safeDestination = sanitizeRedirectUrl(destination)

            redirectTimeoutRef.current = window.setTimeout(() => {
                if (mountedRef.current) {
                    router.replace(safeDestination)
                }
            }, 0)
        },
        [router, sanitizeRedirectUrl]
    )

    useEffect(() => {
        mountedRef.current = true
        hasRedirectedRef.current = false

        return () => {
            mountedRef.current = false
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current)
                redirectTimeoutRef.current = null
            }
        }
    }, [pathname])

    useEffect(() => {
        if (isLoading || hasRedirectedRef.current || pathChecks.isPublic || !mountedRef.current) return

        if (!isAuthenticated) {
            const redirectUrl = `${fallbackPath}?redirect=${encodeURIComponent(pathname)}`
            performRedirect(redirectUrl)
            return
        }

        if (requiredRoles.length > 0 && !hasRequiredRole && !pathChecks.isUnauthorized) {
            performRedirect('/unauthorized')
            return
        }

        if ((userRole === 'admin' && pathChecks.isVendor) || (userRole === 'vendor' && pathChecks.isAdmin)) {
            performRedirect('/unauthorized')
            return
        }
    }, [isLoading, isAuthenticated, hasRequiredRole, requiredRoles.length, userRole, pathname, fallbackPath, pathChecks, performRedirect])

    if (isLoading && !pathChecks.isPublic) {
        return <LoadingSpinner />
    }

    if (pathChecks.isPublic) {
        return <>{children}</>
    }

    if (!isAuthenticated || !hasRequiredRole) {
        return <UnauthorizedAlert />
    }

    if ((userRole === 'admin' && pathChecks.isVendor) || (userRole === 'vendor' && pathChecks.isAdmin)) {
        return <UnauthorizedAlert />
    }

    return <>{children}</>
})

ProtectedRoute.displayName = 'ProtectedRoute'
export default ProtectedRoute
