"use client"

import {useCallback, useEffect, useMemo, useState} from "react"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {CheckIcon, ChevronDownIcon} from "lucide-react"

interface OptionType {
    value: string | number
    label: string
}

interface SearchSelectFieldProps {
    label?: string
    required?: boolean
    placeholder?: string
    options: OptionType[]
    value?: { value: string | number; label: string } | null
    error?: string
    name?: string
    disabled?: boolean
    onChangeAction?: (value: string | number) => void

    [key: string]: any

    className?: string
    inputClassName?: string
    helperText?: string
}

export default function SearchSelectField({
                                              label,
                                              required,
                                              placeholder = "Select option",
                                              options = [],
                                              value,
                                              error,
                                              disabled = false,
                                              onChangeAction = () => {
                                              },
                                              className,
                                              inputClassName,
                                              helperText,
                                              ...props
                                          }: SearchSelectFieldProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredOptions = useMemo(() =>
            options.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [options, searchTerm]
    )

    const selectedOption = useMemo(() =>
            value ? options.find(option => option.value === value.value) : null,
        [value, options]
    )

    const displayText = selectedOption?.label || value?.label || ""

    const handleSelect = useCallback((selectedValue: string | number) => {
        onChangeAction(selectedValue)
        setOpen(false)
        setSearchTerm("")
    }, [onChangeAction])

    useEffect(() => {
        if (!open) {
            setSearchTerm("")
        }
    }, [open])

    return (
        <div className={cn("w-full space-y-1 md:space-y-2", className)} {...props}>
            {label && (
                <Label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between text-left font-normal",
                            error && "border-red-500 focus-visible:ring-red-500",
                            !displayText && "text-muted-foreground",
                            inputClassName
                        )}
                    >
                        <span className={cn("truncate", !displayText && "text-muted-foreground")}>
                            {displayText || placeholder}
                        </span>
                        <ChevronDownIcon
                            size={16}
                            className={cn(
                                "shrink-0 text-muted-foreground/80 transition-transform duration-200",
                                open && "rotate-180"
                            )}
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
                    align="start"
                    sideOffset={4}
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={`Search ${label?.toLowerCase() || 'options'}...`}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            <CommandEmpty>No options found.</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option, index) => (
                                        <CommandItem
                                            key={`${option.value}-${index}`}
                                            value={option.value.toString()}
                                            onSelect={() => handleSelect(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <span className="flex-1">{option.label}</span>
                                            {value?.value === option.value && (
                                                <CheckIcon size={16} className="ml-2 shrink-0 text-primary"/>
                                            )}
                                        </CommandItem>
                                    ))
                                ) : (
                                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                        No options available
                                    </div>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {helperText && !error && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {helperText}
                </p>
            )}
            {error && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                    <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-red-500"></span>
                    {error}
                </p>
            )}
        </div>
    )
}