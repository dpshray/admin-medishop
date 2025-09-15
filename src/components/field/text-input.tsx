"use client"

import type React from "react"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"

interface TextInputProps {
    name?: string
    label?: string
    placeholder?: string
    type?: string
    required?: boolean
    className?: string
    icon?: React.ElementType
    error?: string
    textarea?: boolean
    [key: string]: any
}

export default function TextInputField({
                                           name,
                                           label,
                                           placeholder,
                                           type = "text",
                                           required = false,
                                           className,
                                           icon: Icon,
                                           error,
                                           textarea = false,
                                           ...props
                                       }: TextInputProps) {
    return (
        <div className="w-full space-y-1 sm:space-y-2">
            {label && (
                <Label htmlFor={name} className={cn("text-xs sm:text-sm font-medium break-words", error && "text-red-500")}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}

            <div className="relative">
                {Icon && (
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground",
                            error && "text-red-500",
                        )}
                    >
                        <Icon size={14} className="sm:w-4 sm:h-4" aria-hidden="true"/>
                    </div>
                )}

                {textarea ? (
                    <textarea
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        required={required}
                        className={cn(
                            "w-full min-h-[80px] sm:min-h-[100px] transition-colors resize-none rounded-md border border-input text-xs sm:text-sm shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 px-2 py-2 sm:px-3",
                            Icon ? "pl-8 sm:pl-10" : "pl-2 sm:pl-3",
                            error && "border-red-500 focus:ring-red-500",
                            className,
                        )}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? `${name}-error` : undefined}
                        aria-describedby={error ? `${name}-error` : undefined}
                        aria-required={required ? "true" : "false"}
                        {...props}
                    />
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        className={cn(
                            "w-full transition-colors rounded-md border border-input text-xs sm:text-sm shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 px-2 py-2 sm:px-3",
                            Icon ? "pl-8 sm:pl-10" : "pl-2 sm:pl-3",
                            error && "border-red-500 focus:ring-red-500",
                            className,
                        )}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? `${name}-error` : undefined}
                        aria-describedby={error ? `${name}-error` : undefined}
                        aria-required={required ? "true" : "false"}
                        {...props}
                    />
                )}
            </div>

            {error && (
                <p id={`${name}-error`} className="text-xs sm:text-sm text-red-500 mt-1 break-words">
                    {error}
                </p>
            )}
        </div>
    )
}