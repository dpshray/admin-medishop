"use client"

import type React from "react"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import AppSidebar, {type NavGroup} from "@/components/sidebar/app-sidebar"
import {Separator} from "@/components/ui/separator"
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb"
import NotificationComponent, {type NotificationItem} from "@/components/sidebar/notification"
import UserDropdown, {type DropdownGroup} from "@/components/sidebar/user-dropdown"

interface User {
    name: string
    email: string
    avatar?: string
    fallback: string
}

interface ReusableSidebarProps {
    children: React.ReactNode
    navGroups: NavGroup[]
    title?: string
    subtitle?: string
    currentHref?: string
    logo?: React.ReactNode
    user?: User
    dropdownGroups?: DropdownGroup[]
    notifications?: NotificationItem[]
    onLogout?: () => void
}

export default function ReusableSidebar({
                                            children,
                                            navGroups,
                                            title,
                                            subtitle,
                                            currentHref,
                                            logo,
                                            user = {
                                                name: "Keith Kennedy",
                                                email: "k.kennedy@originui.com",
                                                avatar: "/placeholder.svg?height=32&width=32",
                                                fallback: "KK",
                                            },
                                            dropdownGroups = [],
                                            notifications = [],
                                            onLogout,
                                        }: ReusableSidebarProps) {
    return (
        <SidebarProvider>
            <AppSidebar navGroups={navGroups} title={title} subtitle={subtitle} currentHref={currentHref} logo={logo}/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 ">
                    <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb className="hidden sm:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <NotificationComponent notifications={notifications}/>
                        <UserDropdown user={user} groups={dropdownGroups} onLogout={onLogout}/>
                    </div>
                </header>
                <main className="flex-1 space-y-4  sm:space-y-6  overflow-auto p-3">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}
