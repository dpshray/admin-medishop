'use client'

import {useQuery} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'
import authService from '@/service/auth.service'

export interface UserType {
    name: string
    email: string
    status: 'Active' | 'Inactive'
    user_type: 'ADMIN' | 'VENDOR' | 'USER'
    mobile_number: string
    image: string

    [key: string]: any
}

interface UseAuthReturn {
    user: UserType | null | undefined
    isAuthenticated: boolean
    hasRole: (role: string) => boolean
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => Promise<any>
    isFetching: boolean
}

export function useAuth(): UseAuthReturn {
    const {
        data: user,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery<UserType | null, Error>({
        queryKey: ['auth', 'user'],
        queryFn: async () => {
            try {
                const response = await authService.getLoggedInUser()
                return response?.data || null
            } catch (err) {
                console.error('Failed to fetch user:', err)
                return null
            }
        },
        retry: 1,
        retryDelay: 1000,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    })

    const isAuthenticated = useMemo(() => !!user && !!user.id, [user])

    const hasRole = useCallback(
        (role: string): boolean => {
            if (!user?.role) return false
            return user.role === role
        },
        [user?.role]
    )

    return {
        user: user ?? null,
        isAuthenticated,
        hasRole,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    }
}