"use client"

import type React from "react"
import {memo} from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import type {LucideIcon} from "lucide-react"
import {cn} from "@/lib/utils"
import {usePathname} from "next/navigation"
import Image from "next/image"

export type NavItem = {
    label: string
    href: string
    icon: LucideIcon
}

export type NavGroup = {
    label: string
    items: NavItem[]
}

interface SidebarProps {
    navGroups: NavGroup[]
    title?: string
    subtitle?: string
    currentHref?: string
    logo?: string
}

interface SidebarNavGroupProps {
    group: NavGroup
}

const SidebarNavGroup = memo(function SidebarNavGroup({group}: SidebarNavGroupProps) {
    const pathname = usePathname()

    return (
        <SidebarGroup className="p-2 border-b">
            <SidebarGroupLabel className="text-xs">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {group.items.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    className={cn(
                                        isActive &&
                                        "bg-gradient-to-r from-purple-400 to-blue-400 text-primary-foreground hover:text-white"
                                    )}
                                >
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-2 truncate"
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true"/>
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
})

const AppSidebar = memo(function AppSidebar({
                                                navGroups,
                                                title = "App Title",
                                                subtitle = "Admin Dashboard",
                                                logo = "/file.svg",
                                            }: SidebarProps) {
    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4 h-16">
                <div className="flex items-center gap-3">

                    <Image
                        src={logo}
                        alt={`${title} logo`}
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0"
                        priority
                    />

                    <div className="min-w-0">
                        <h2 className="font-semibold text-lg truncate">{title}</h2>
                        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <nav aria-label="Main navigation">
                    {navGroups.map((group) => (
                        <SidebarNavGroup key={group.label} group={group}/>
                    ))}
                </nav>
            </SidebarContent>
        </Sidebar>
    )
})

export default AppSidebar