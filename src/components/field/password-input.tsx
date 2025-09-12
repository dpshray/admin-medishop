"use client"

import * as React from "react"
import {Eye, EyeOff} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useId} from "react";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    showLabel?: boolean
    icon?: React.ReactNode
}

export default function PasswordInputField({
                                               className,
                                               label,
                                               error,
                                               showLabel = true,
                                               icon,
                                               ...props
                                           }: PasswordInputProps) {
    const generatedId = useId()
    const inputId = props.id || generatedId
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="w-full space-y-2">
            {showLabel && label && (
                <Label htmlFor={inputId} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}
                <Input
                    id={inputId}
                    type={showPassword ? "text" : "password"}
                    className={cn(
                        "pr-10",
                        icon && "pl-10",
                        error && "border-destructive focus-visible:ring-destructive",
                        className,
                    )}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground"/>
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground"/>
                    )}
                </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
