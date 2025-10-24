// "use client"
//
// import { createContext, ReactNode, useContext } from "react"
// import { useQuery } from "@tanstack/react-query"
// import authService from "@/service/auth.service"
//
// interface User {
//     id: number
//     name: string
//     role: "admin" | "vendor"
// }
//
// interface AuthContextType {
//     user?: User
//     isLoading: boolean
// }
//
// const AuthContext = createContext<AuthContextType>({ isLoading: true })
//
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     const { data, isLoading } = useQuery({
//         queryKey: ["authUser"],
//         queryFn: authService.getLoggedInUser,
//         retry: false,
//     })
//
//     return <AuthContext.Provider value={{ user: data, isLoading }}>{children}</AuthContext.Provider>
// }
//
// export const useAuth = () => useContext(AuthContext)
