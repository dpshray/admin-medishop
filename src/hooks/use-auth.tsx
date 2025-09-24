"use client"

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import authService from "@/service/auth.service"
import type {AuthContextType, User, UserRole} from "@/types/user"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function initAuth() {
            try {
                const currentUser = await authService.getLoggedInUser()
                setUser(currentUser as any)
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()
    }, [])

    const logout = async () => {
        await authService.logout()
        localStorage.removeItem("_at")
        localStorage.removeItem("_role")
        setUser(null)
        router.push("/login")
    }

    const isAuthenticated = Boolean(user)

    const hasRole = (roles: UserRole[]) => user ? roles.includes(user.role) : false

    const value = {user, isLoading, isAuthenticated, logout, hasRole}

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) throw new Error("useAuth must be used within AuthProvider")
    return context
}
