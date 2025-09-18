"use client"

import React, {useId} from "react"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {cn} from "@/lib/utils"

interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ElementType
    textarea?: boolean
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

export default function TextInputField({
                                           label,
                                           error,
                                           icon: Icon,
                                           textarea = false,
                                           textareaProps,
                                           className,
                                           required,
                                           ...props
                                       }: TextInputFieldProps) {
    const id = useId()

    return (
        <div className="w-full space-y-2">
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                        error && 'text-destructive'
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <div className="relative">
                {Icon && (
                    <div className={cn(
                        "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground",
                        error && "text-destructive"
                    )}>
                        <Icon className="h-4 w-4" aria-hidden="true"/>
                    </div>
                )}

                {textarea ? (
                    <Textarea
                        id={id}
                        required={required}
                        className={cn(
                            Icon && "pl-10",
                            error && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? `${id}-error` : undefined}
                        {...textareaProps}
                    />
                ) : (
                    <Input
                        id={id}
                        required={required}
                        className={cn(
                            Icon && "pl-10",
                            error && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? `${id}-error` : undefined}
                        {...props}
                    />
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    )
}