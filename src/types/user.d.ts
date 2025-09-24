export type UserRole = "admin" | "vendor"

export interface User {
    id: string
    email: string
    role: UserRole
    name: string
}

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    logout: () => Promise<void>
    hasRole: (roles: UserRole[]) => boolean

}