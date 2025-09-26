"use client"

import {useState} from "react"
import {Label} from "@/components/ui/label"
import {cn} from "@/lib/utils"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {CheckIcon, ChevronDownIcon} from "lucide-react"
import {OptionType} from "@/types/types"

interface SearchSelectFieldProps {
    label?: string
    required?: boolean
    placeholder?: string
    options: OptionType[]
    error?: string
    name?: string
    onChangeAction?: (value: string | number) => void
    [key: string]: any
}

export default function SearchSelectField({
                                              label,
                                              required,
                                              placeholder = "Select option",
                                              options = [],
                                              error,
                                              onChangeAction = () => {},
                                              ...props
                                          }: SearchSelectFieldProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string | number>("")

    const handleSelect = (currentValue: string | number) => {
        setValue(currentValue)
        onChangeAction(currentValue)
        setOpen(false)
    }

    const getOptionKey = (option: OptionType) => {
        return option.value !== undefined && option.value !== null
            ? option.value.toString()
            : `option-${Math.random()}`
    }

    const getOptionValue = (option: OptionType) => {
        return option.value !== undefined && option.value !== null
            ? option.value.toString()
            : ""
    }

    return (
        <div className="md:space-y-2 w-full space-y-1" {...props}>
            {label && (
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between text-left",
                            error && "border-red-500",
                            !value && "text-muted-foreground",
                            "data-[placeholder]:text-muted-foreground"
                        )}
                    >
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value ? options.find((option) => option.value === value)?.label : placeholder}
                        </span>
                        <ChevronDownIcon size={16} className="text-muted-foreground/80 shrink-0" aria-hidden="true"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={placeholder}/>
                        <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                                {options.length > 0 ? (
                                    options.map((option) => (
                                        <CommandItem
                                            key={getOptionKey(option)}
                                            value={getOptionValue(option)}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            {option.label}
                                            {value === option.value && <CheckIcon size={16} className="ml-auto"/>}
                                        </CommandItem>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No options available</p>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    )
}