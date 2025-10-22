"use client"

import type React from "react"
import {memo, useMemo} from "react"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import AppSidebar, {type NavGroup} from "@/components/sidebar/app-sidebar"
import {Separator} from "@/components/ui/separator"
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb"
import NotificationComponent, {type NotificationItem} from "@/components/sidebar/notification"
import UserDropdown, {type DropdownGroup} from "@/components/sidebar/user-dropdown"
import {useAuth} from "@/hooks/use-auth"

interface User {
    name: string
    email: string
    image?: string
    fallback: string
}

interface ReusableSidebarProps {
    children: React.ReactNode
    navGroups: NavGroup[]
    title?: string
    subtitle?: string
    currentHref?: string
    logo?: string
    user?: User
    dropdownGroups?: DropdownGroup[]
    notifications?: NotificationItem[]
    onLogout?: () => void
}

const DEFAULT_USER: User = {
    name: "Medishop",
    email: "medishop@example.com",
    image: "/placeholder.svg?height=32&width=32",
    fallback: "MS",
}

const ReusableSidebar = memo(function ReusableSidebar({
                                                          children,
                                                          navGroups,
                                                          title,
                                                          subtitle,
                                                          currentHref,
                                                          logo = "/logo.png",
                                                          user = DEFAULT_USER,
                                                          dropdownGroups = [],
                                                          notifications = [],
                                                          onLogout,
                                                      }: ReusableSidebarProps) {
    const {user: authUser} = useAuth()

    const displayUser = useMemo(() => {
        if (authUser) {
            return {
                name: authUser.name || user.name,
                email: authUser.email || user.email,
                avatar: user.image,
                fallback: authUser.name?.[0]?.toUpperCase() || user.fallback,
            }
        }
        return user
    }, [authUser, user])

    return (
        <SidebarProvider>
            <AppSidebar
                navGroups={navGroups}
                title={title}
                subtitle={subtitle}
                currentHref={currentHref}
                logo={logo}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" aria-label="Toggle sidebar"/>
                    <Separator orientation="vertical" className="mr-2 h-4" aria-hidden="true"/>
                    <Breadcrumb className="hidden sm:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <NotificationComponent notifications={notifications}/>
                        <UserDropdown user={displayUser} groups={dropdownGroups} onLogoutAction={onLogout}/>
                    </div>
                </header>
                <main className="flex-1 space-y-4 sm:space-y-4" role="main">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
})

export default ReusableSidebar