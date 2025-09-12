'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FileInputFieldProps {
    name?: string
    label?: string
    placeholder?: string
    required?: boolean
    multiple?: boolean
    className?: string
    error?: string
    accept?: string
    onChangeAction?: (files: File[]) => void
    [key: string]: any
}

export default function FileInputField({
                                           name,
                                           label,
                                           placeholder,
                                           required = false,
                                           className,
                                           error,
                                           accept,
                                           multiple = false,
                                           onChangeAction,
                                           ...props
                                       }: FileInputFieldProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [previews])

    useEffect(() => {
        if (inputRef.current) {
            const dataTransfer = new DataTransfer()
            selectedFiles.forEach((file) => dataTransfer.items.add(file))
            inputRef.current.files = dataTransfer.files
        }
    }, [selectedFiles])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        setSelectedFiles(files)
        if (onChangeAction) onChangeAction(files)
        const urls = files.map((file) => URL.createObjectURL(file))
        setPreviews(urls)
    }

    const errorId = `${name}-error`
    const hasError = !!error

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={name} className={cn('text-sm font-medium', hasError && 'text-red-500')}>
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </Label>
            )}
            <Input
                id={name}
                name={name}
                type="file"
                multiple={multiple}
                accept={accept}
                className={cn(
                    'px-0 py-0 file:border-r file:mr-2 file:h-full file:pr-1.5 file:pl-1.5 file:rounded-none file:bg-gray-200 file:text-sm file:font-medium file:text-gray-700 file:border-gray-300 hover:file:bg-gray-100 focus-visible:file:outline-none focus-visible:file:ring-0 focus-visible:file:ring-offset-0',
                    hasError && 'border-red-500 focus-visible:ring-red-500',
                    className
                )}
                placeholder={placeholder}
                required={required}
                onChange={handleFileChange}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                aria-required={required ? 'true' : 'false'}
                aria-errormessage={hasError ? errorId : undefined}
                ref={inputRef}
                {...props}
            />
            {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {previews.map((src, idx) => (
                        <img key={idx} src={src} alt={selectedFiles[idx].name} className="h-20 w-20 object-cover rounded" />
                    ))}
                </div>
            )}
            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                    {selectedFiles.map((file) => (
                        <p key={file.name + file.lastModified} className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {file.name}
                        </p>
                    ))}
                </div>
            )}
            {hasError && (
                <p id={errorId} className="text-sm text-red-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    )
}
