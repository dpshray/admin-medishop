'use client'

import React, {memo, useCallback, useMemo} from 'react'
import Link from 'next/link'
import {useMutation} from '@tanstack/react-query'
import authService from '@/service/auth.service'
import {Button} from '@/components/ui/button'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {Loader2, LogOut, type LucideIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import { toast } from 'sonner'

export interface UserType {
    name: string
    email: string
    status: 'Active' | 'Inactive'
    user_type: 'ADMIN' | 'VENDOR' | 'USER'
    mobile_number: string
    image: string

    [key: string]: any
}

export type DropdownItem = {
    icon: LucideIcon
    label: string
    href: string
    onClick?: () => void
    disabled?: boolean
    variant?: 'default' | 'destructive'
}

export type DropdownGroup = {
    items: DropdownItem[]
}

interface UserDropdownProps {
    user: {
        name: string
        email: string
        avatar?: string
        fallback?: string
    }
    groups: DropdownGroup[]
    onLogoutAction?: () => void
    align?: 'start' | 'end' | 'center'
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
}

const DropdownItemContent = memo(({
                                      icon: Icon,
                                      label,
                                      href,
                                      onClick,
                                      disabled,
                                      variant = 'default'
                                  }: DropdownItem) => (
    <DropdownMenuItem
        asChild={!disabled}
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "cursor-pointer transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            variant === 'destructive' && "text-destructive focus:text-destructive focus:bg-destructive/10"
        )}
    >
        <Link
            href={disabled ? '#' : href}
            className="flex items-center gap-3 py-2.5 px-2"
            onClick={disabled ? (e) => e.preventDefault() : undefined}
            aria-disabled={disabled}
        >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true"/>
            <span className="text-sm font-medium">{label}</span>
        </Link>
    </DropdownMenuItem>
))
DropdownItemContent.displayName = 'DropdownItemContent'

const UserDropdown = memo(({
                               user,
                               groups,
                               onLogoutAction,
                               align = 'end',
                               side = 'bottom',
                               sideOffset = 8,
                           }: UserDropdownProps) => {
    const logoutMutation = useMutation({
        mutationFn: async () => await authService.logout(),
        onSuccess: () => {
            toast.success("Logged out successfully")
            if (onLogoutAction) {
                onLogoutAction()
            } else {
                localStorage.clear()
                window.location.href = '/login'
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || "Logout failed. Please try again.")
        },
    })

    const handleLogout = useCallback(() => {
        logoutMutation.mutate()
    }, [logoutMutation])

    const userInitials = useMemo(() => {
        if (user.fallback) return user.fallback
        const names = user.name.trim().split(' ')
        if (names.length >= 2) {
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
        }
        return user.name.charAt(0).toUpperCase()
    }, [user.name, user.fallback])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-auto p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full transition-all hover:opacity-80"
                    aria-label="User menu"
                >
                    <Avatar
                        className="h-10 w-10 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                        <AvatarImage
                            src={user.avatar || '/placeholder.svg'}
                            alt={user.name}
                            loading="lazy"
                        />
                        <AvatarFallback
                            className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="min-w-72 w-full shadow-lg border animate-in fade-in-0 zoom-in-95"
                align={align}
                side={side}
                sideOffset={sideOffset}
            >
                <DropdownMenuLabel className="flex items-center gap-3 min-w-0 py-3 px-2">
                    <Avatar className="h-10 w-10 ring-2 ring-border">
                        <AvatarImage
                            src={user.avatar || '/placeholder.svg'}
                            alt={user.name}
                            loading="lazy"
                        />
                        <AvatarFallback
                            className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-sm font-semibold text-foreground leading-tight mb-1">
                            {user.name}
                        </span>
                        <span className="truncate text-xs font-normal text-muted-foreground leading-tight">
                            {user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {groups.map((group, idx) => (
                    <React.Fragment key={idx}>
                        <DropdownMenuGroup className="py-1">
                            {group.items.map((item) => (
                                <DropdownItemContent key={item.href} {...item} />
                            ))}
                        </DropdownMenuGroup>
                        {idx < groups.length - 1 && <DropdownMenuSeparator/>}
                    </React.Fragment>
                ))}
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5 px-2 transition-colors duration-200"
                >
                    {logoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true"/>
                    ) : (
                        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true"/>
                    )}
                    <span className="text-sm font-medium">
                        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
UserDropdown.displayName = 'UserDropdown'

export default UserDropdown