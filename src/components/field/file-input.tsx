"use client"

import React, {useEffect, useId, useRef, useState} from "react"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {File, Upload, X} from "lucide-react"
import {cn} from "@/lib/utils"

interface FileInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
    label?: string
    error?: string
    onFileChange?: (files: File[]) => void
    showPreviews?: boolean
    showFileList?: boolean
    maxFileSize?: number
    allowedTypes?: string[]
}

export default function FileInputField({
                                           label,
                                           required = false,
                                           multiple = false,
                                           accept,
                                           className,
                                           error,
                                           disabled,
                                           onFileChange,
                                           showPreviews = true,
                                           showFileList = true,
                                           maxFileSize,
                                           allowedTypes,
                                           ...props
                                       }: FileInputFieldProps) {
    const id = useId()
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previews])

    const validateFile = (file: File): string | null => {
        if (maxFileSize && file.size > maxFileSize) {
            return `File size exceeds ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`
        }
        if (allowedTypes && !allowedTypes.includes(file.type)) {
            return `File type ${file.type} is not allowed`
        }
        return null
    }

    const processFiles = (files: FileList | File[]) => {
        const fileArray = Array.from(files)
        const validFiles: File[] = []

        for (const file of fileArray) {
            const validationError = validateFile(file)
            if (!validationError) {
                validFiles.push(file)
            }
        }

        if (!multiple && validFiles.length > 0) {
            validFiles.splice(1)
        }

        setSelectedFiles(prev => multiple ? [...prev, ...validFiles] : validFiles)

        const newPreviews = validFiles
            .filter(file => file.type.startsWith("image/"))
            .map(file => URL.createObjectURL(file))

        setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews)

        onFileChange?.(multiple ? [...selectedFiles, ...validFiles] : validFiles)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files)
        }
    }

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index)
        const newPreviews = previews.filter((_, i) => i !== index)

        if (previews[index]) {
            URL.revokeObjectURL(previews[index])
        }

        setSelectedFiles(newFiles)
        setPreviews(newPreviews)
        onFileChange?.(newFiles)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files)
        }
    }

    const isImage = (file: File) => file.type.startsWith("image/")

    return (
        <div className="w-full space-y-2">
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium",
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <div
                className={cn(
                    "relative rounded-lg border-2 border-dashed transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    error && "border-destructive",
                    disabled && "opacity-50 cursor-not-allowed",
                    "w-full", className
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Input
                    ref={inputRef}
                    id={id}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    required={required}
                    disabled={disabled}
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...props}
                />

                <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2"/>
                    <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium text-primary cursor-pointer hover:underline">
                            Click to upload
                        </span>
                        {" "}or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {accept ? `Supported formats: ${accept}` : "All file types supported"}
                        {maxFileSize && ` (Max ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB)`}
                    </p>
                </div>
            </div>

            {showPreviews && previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previews.map((src, index) => (
                        <div key={src} className="relative group">
                            <img
                                src={src}
                                alt={selectedFiles[index]?.name || `Preview ${index + 1}`}
                                className="h-20 w-20 object-cover rounded-lg border"
                            />
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile(index)}
                                    aria-label={`Remove ${selectedFiles[index]?.name}`}
                                >
                                    <X className="h-3 w-3"/>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showFileList && selectedFiles.length > 0 && (
                <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                                {isImage(file) ? (
                                    <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={previews[index]}
                                            alt={file.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <File className="h-8 w-8 text-muted-foreground flex-shrink-0"/>
                                )}
                                <div className="min-w-0 flex-1 ">
                                    <p className="text-sm font-medium truncate  max-w-md">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="h-4 w-4"/>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    )
}