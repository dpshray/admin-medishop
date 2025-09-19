"use client"

import * as React from "react"
import {useId} from "react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Label} from "@/components/ui/label"
import {Check, ChevronDown, X} from "lucide-react"
import {cn} from "@/lib/utils"

interface OptionType {
    value: string | number
    label: string
    disabled?: boolean
}

interface MultiSelectFieldProps {
    label?: string
    placeholder?: string
    options: OptionType[]
    value?: (string | number)[]
    defaultValue?: (string | number)[]
    onValueChange?: (value: (string | number)[]) => void
    error?: string
    required?: boolean
    disabled?: boolean
    maxSelected?: number
    className?: string
    searchable?: boolean
    clearable?: boolean
    emptyMessage?: string
    searchPlaceholder?: string
}

export default function MultiSelectField({
                                             label,
                                             placeholder = "Select items...",
                                             options = [],
                                             value,
                                             defaultValue = [],
                                             onValueChange,
                                             error,
                                             required = false,
                                             disabled = false,
                                             maxSelected,
                                             className,
                                             searchable = true,
                                             clearable = true,
                                             emptyMessage = "No items found.",
                                             searchPlaceholder = "Search..."
                                         }: MultiSelectFieldProps) {
    const id = useId()
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [internalValue, setInternalValue] = React.useState<(string | number)[]>(defaultValue)

    const selectedValues = value ?? internalValue

    const handleValueChange = React.useCallback(
        (newValue: (string | number)[]) => {
            if (value === undefined) {
                setInternalValue(newValue)
            }
            onValueChange?.(newValue)
        },
        [value, onValueChange]
    )

    const toggleSelection = React.useCallback(
        (optionValue: string | number) => {
            if (disabled) return

            const isSelected = selectedValues.includes(optionValue)
            let newValue: (string | number)[]

            if (isSelected) {
                newValue = selectedValues.filter((v) => v !== optionValue)
            } else {
                if (maxSelected && selectedValues.length >= maxSelected) return
                newValue = [...selectedValues, optionValue]
            }

            handleValueChange(newValue)
        },
        [selectedValues, disabled, maxSelected, handleValueChange]
    )

    const removeSelection = React.useCallback(
        (optionValue: string | number) => {
            if (disabled) return
            const newValue = selectedValues.filter((v) => v !== optionValue)
            handleValueChange(newValue)
        },
        [selectedValues, disabled, handleValueChange]
    )

    const clearAll = React.useCallback(() => {
        if (disabled) return
        handleValueChange([])
    }, [disabled, handleValueChange])

    const filteredOptions = React.useMemo(() => {
        if (!search || !searchable) return options
        return options.filter((option) =>
            option.label.toLowerCase().includes(search.toLowerCase())
        )
    }, [options, search, searchable])

    const selectedOptions = React.useMemo(() => {
        return selectedValues
            .map((val) => options.find((option) => option.value === val))
            .filter((option): option is OptionType => option !== undefined)
    }, [selectedValues, options])

    const hasSelection = selectedValues.length > 0
    const isMaxSelected = maxSelected ? selectedValues.length >= maxSelected : false

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

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? `${id}-error` : undefined}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between min-h-8 h-auto px-3 py-2",
                            error && "border-destructive focus-visible:ring-destructive",
                            !hasSelection && "text-muted-foreground",
                            className
                        )}
                    >
                        <div className="flex flex-wrap items-center gap-1 overflow-hidden flex-1 min-h-6">
                            {hasSelection ? (
                                selectedOptions.map((option) => (
                                    <Badge
                                        key={option.value}
                                        variant="secondary"
                                        className="rounded-sm px-2 py-0.5 text-xs font-normal h-6 flex items-center"
                                    >
                                        <span className="truncate max-w-[100px]">{option.label}</span>
                                        {clearable && !disabled && (
                                            <button
                                                type="button"
                                                className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:bg-muted-foreground/20 transition-colors"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    removeSelection(option.value)
                                                }}
                                                aria-label={`Remove ${option.label}`}
                                            >
                                                <X className="h-3 w-3"/>
                                            </button>
                                        )}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm">{placeholder}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 ml-2 shrink-0">
                            {clearable && hasSelection && !disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        clearAll()
                                    }}
                                    className="rounded-sm hover:bg-muted p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                                    aria-label="Clear all selections"
                                >
                                    <X className="h-4 w-4"/>
                                </button>
                            )}
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50"/>
                        </div>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                        {searchable && (
                            <CommandInput
                                placeholder={searchPlaceholder}
                                value={search}
                                onValueChange={setSearch}
                                className="h-9"
                            />
                        )}
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                                {filteredOptions.map((option) => {
                                    const isSelected = selectedValues.includes(option.value)
                                    const isDisabled = option.disabled || (isMaxSelected && !isSelected) || disabled

                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={String(option.value)}
                                            disabled={isDisabled}
                                            onSelect={() => toggleSelection(option.value)}
                                            className={cn(
                                                "cursor-pointer justify-between",
                                                isDisabled && "cursor-not-allowed opacity-50"
                                            )}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {isSelected && <Check className="h-4 w-4"/>}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}

            {maxSelected && (
                <p className="text-xs text-muted-foreground">
                    {selectedValues.length} of {maxSelected} selected
                </p>
            )}
        </div>
    )
}