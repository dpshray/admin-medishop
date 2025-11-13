"use client";

import React, {ElementType, useId} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

interface CommonProps {
    label?: string;
    error?: string;
    icon?: ElementType;
    required?: boolean;
    className?: string;
    helperText?: string;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "required">, CommonProps {
    textarea?: false;
}

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className" | "required">, CommonProps {
    textarea: true;
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

type TextInputFieldProps = InputProps | TextareaProps

export default function TextInputField({
                                           label,
                                           error,
                                           icon: Icon,
                                           textarea = false,
                                           className,
                                           required,
                                           helperText,
                                           ...props
                                       }: TextInputFieldProps) {
    const id = useId();

    const baseClassName = cn(
        Icon && "pl-10",
        error && "border-destructive focus-visible:ring-destructive",
        className
    );

    return (
        <div className="w-full space-y-2">
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <div className="relative">
                {Icon && (
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground",
                            error && "text-destructive"
                        )}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true"/>
                    </div>
                )}

                {textarea ? (
                    <Textarea
                        id={id}
                        required={required}
                        className={baseClassName}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <Input
                        id={id}
                        required={required}
                        className={baseClassName}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
            {helperText && (
                <p className="text-sm text-muted-foreground">{helperText}</p>
            )}
        </div>
    );
}
