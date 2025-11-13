"use client"

import { useCallback, useId, useMemo, useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerFieldProps {
    label?: string
    placeholder?: string
    value?: Date
    defaultValue?: Date
    onChangeAction?: (date: Date | undefined) => void
    error?: string
    required?: boolean
    disabled?: boolean
    className?: string
    clearable?: boolean
    minDate?: Date
    maxDate?: Date
    dateFormat?: string
    helperText?: string
    showTime?: boolean
    timeFormat?: "12h" | "24h"
    name?: string
    id?: string
}

const DatePickerField = ({
                             label,
                             placeholder = "Pick a date",
                             value,
                             defaultValue,
                             onChangeAction,
                             error,
                             required = false,
                             disabled = false,
                             className,
                             clearable = false,
                             dateFormat = "PPP",
                             helperText,
                             showTime = false,
                             name,
                             id: providedId,
                         }: DatePickerFieldProps) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const isControlled = value !== undefined
    const [internalDate, setInternalDate] = useState<Date | undefined>(defaultValue)
    const [internalTime, setInternalTime] = useState("12:00:00")
    const [open, setOpen] = useState(false)
    const selectedDate = isControlled ? value : internalDate

    useEffect(() => {
        if (selectedDate && showTime) {
            const h = selectedDate.getHours().toString().padStart(2, "0")
            const m = selectedDate.getMinutes().toString().padStart(2, "0")
            const s = selectedDate.getSeconds().toString().padStart(2, "0")
            setInternalTime(`${h}:${m}:${s}`)
        }
    }, [selectedDate, showTime])

    const handleDateChange = useCallback(
        (date: Date | undefined) => {
            if (!date) {
                if (!isControlled) setInternalDate(undefined)
                onChangeAction?.(undefined)
                return
            }
            const finalDate = new Date(date)
            if (showTime && internalTime) {
                const [h, m, s] = internalTime.split(":").map(Number)
                finalDate.setHours(h, m, s || 0)
            }
            if (!isControlled) setInternalDate(finalDate)
            onChangeAction?.(finalDate)
            if (!showTime) setOpen(false)
        },
        [isControlled, onChangeAction, showTime, internalTime]
    )

    const handleTimeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value
            setInternalTime(val)
            if (selectedDate) {
                const [h, m, s] = val.split(":").map(Number)
                const updated = new Date(selectedDate)
                updated.setHours(h, m, s || 0)
                if (!isControlled) setInternalDate(updated)
                onChangeAction?.(updated)
            }
        },
        [selectedDate, isControlled, onChangeAction]
    )

    const handleClear = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            e.stopPropagation()
            handleDateChange(undefined)
            setOpen(false)
        },
        [handleDateChange]
    )

    const formattedDate = useMemo(() => {
        if (!selectedDate) return null
        try {
            return format(selectedDate, dateFormat)
        } catch {
            return null
        }
    }, [selectedDate, dateFormat])

    const buttonClasses = useMemo(
        () =>
            cn(
                "w-full justify-start text-left font-normal h-10 px-3 rounded-md border border-input bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                !selectedDate && "text-muted-foreground",
                error && "border-destructive focus:ring-destructive",
                disabled && "opacity-50 cursor-not-allowed"
            ),
        [selectedDate, error, disabled]
    )

    return (
        <div className={cn("w-full space-y-1", className)}>
            {label && (
                <Label htmlFor={id} className={cn("text-sm font-semibold", error && "text-destructive")}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <Input type="hidden" name={name} value={selectedDate ? selectedDate.toISOString() : ""} />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            disabled={disabled}
                            aria-invalid={!!error}
                            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                            aria-label={label || placeholder}
                            className={buttonClasses}
                        >
                            <Calendar className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">{formattedDate || placeholder}</span>
                        </Button>
                        {clearable && selectedDate && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                tabIndex={-1}
                                className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={selectedDate} onSelect={handleDateChange} className="rounded-b-md" />
                    {showTime && (
                        <div className="border-t px-4 py-3 flex items-center space-x-3">
                            <Label htmlFor={`${id}-time`} className="text-xs font-medium">
                                Time
                            </Label>
                            <div className="relative flex-grow">
                                <Input
                                    id={`${id}-time`}
                                    type="time"
                                    step="1"
                                    value={internalTime}
                                    onChange={handleTimeChange}
                                    disabled={!selectedDate || disabled}
                                    className="pl-9 peer"
                                />
                                <Clock size={16} className="pointer-events-none absolute inset-y-0 left-2 text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive mt-1" role="alert">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p id={`${id}-helper`} className="text-sm text-muted-foreground mt-1">
                    {helperText}
                </p>
            )}
        </div>
    )
}

export default DatePickerField
