'use client'
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

interface ProtectedRoutesProps {
    children: React.ReactNode
    allowedRoles: string | string[]
}

export default function ProtectedRoutes({ children, allowedRoles }: ProtectedRoutesProps) {
    const {isLoading, isAuthenticated, user, hasRole} = useAuth()
    const router = useRouter()
    const [storedRole, setStoredRole] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            setStoredRole(localStorage.getItem("_role"))
            setToken(localStorage.getItem("_at"))
        }

    }, [])

    const isRoleAllowed = useCallback((): boolean => {
        const effectiveRole = user?.roles || storedRole
        if (!effectiveRole) return false
        const roleToCheck = effectiveRole.toLowerCase()
        if (Array.isArray(allowedRoles)) {
            return allowedRoles.map(role => role.toLowerCase()).includes(roleToCheck)
        }
        return roleToCheck === allowedRoles.toLowerCase()
    }, [user, storedRole, allowedRoles])

    useEffect(() => {
        if (!isLoading) {
            if (!token) {
                router.push("/login")
                return
            }
            if (!isRoleAllowed()) {
                router.push("/login")
            }
        }
    }, [    isLoading, token, isRoleAllowed, router])

    if (isLoading) {
        return <div className="w-full min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
    }

    if (!token || !isRoleAllowed()) {
        return null
    }

    return <>{children}</>
}
