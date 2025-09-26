"use client"

import {useState, useEffect} from "react"
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
}

export default function SearchSelectField({
                                              label,
                                              required,
                                              placeholder = "Select option",
                                              options = [],
                                              value,
                                              error,
                                              disabled = false,
                                              onChangeAction = () => {},
                                              ...props
                                          }: SearchSelectFieldProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelect = (selectedValue: string | number) => {
        onChangeAction(selectedValue)
        setOpen(false)
        setSearchTerm("")
    }

    const selectedOption = value ? options.find(option => option.value === value.value) : null
    const displayText = selectedOption?.label || (value?.label) || ""

    useEffect(() => {
        if (!open) {
            setSearchTerm("")
        }
    }, [open])

    return (
        <div className="md:space-y-2 w-full space-y-1" {...props}>
            {label && (
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
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
                            !displayText && "text-muted-foreground"
                        )}
                    >
                        <span className={cn("truncate", !displayText && "text-muted-foreground")}>
                            {displayText || placeholder}
                        </span>
                        <ChevronDownIcon
                            size={16}
                            className={cn(
                                "text-muted-foreground/80 shrink-0 transition-transform duration-200",
                                open && "rotate-180"
                            )}
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
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
                                    filteredOptions.map((option) => (
                                        <CommandItem
                                            key={`${option.value}-${option.label}`}
                                            value={option.value.toString()}
                                            onSelect={() => handleSelect(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <span className="flex-1">{option.label}</span>
                                            {value?.value === option.value && (
                                                <CheckIcon size={16} className="ml-2 text-primary shrink-0" />
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
            {error && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full shrink-0"></span>
                    {error}
                </p>
            )}
        </div>
    )
}