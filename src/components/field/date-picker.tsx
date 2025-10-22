"use client"

import * as React from "react"
import {useCallback, useId, useMemo} from "react"
import {format} from "date-fns"
import {Calendar, Clock, X} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Calendar as CalendarComponent} from "@/components/ui/calendar"
import {Label} from "@/components/ui/label"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Input} from "@/components/ui/input"

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

export function DatePickerField({
                                    label,
                                    placeholder = "Pick a date",
                                    value,
                                    defaultValue,
                                    onChangeAction,
                                    error,
                                    required = false,
                                    disabled = false,
                                    className,
                                    clearable = true,
                                    minDate,
                                    maxDate,
                                    dateFormat = "PPP",
                                    helperText,
                                    showTime = false,
                                    name,
                                    id: providedId,
                                }: DatePickerFieldProps) {
    const generatedId = useId()
    const id = providedId || generatedId
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultValue)
    const [internalTime, setInternalTime] = React.useState<string>("12:00:00")
    const [open, setOpen] = React.useState(false)

    const isControlled = value !== undefined
    const selectedDate = isControlled ? value : internalDate

    const handleDateChange = useCallback(
        (date: Date | undefined) => {
            if (date && showTime && internalTime) {
                const [hours, minutes, seconds] = internalTime.split(":").map(Number)
                const dateWithTime = new Date(date)
                dateWithTime.setHours(hours, minutes, seconds || 0)

                if (!isControlled) {
                    setInternalDate(dateWithTime)
                }
                onChangeAction?.(dateWithTime)
            } else {
                if (!isControlled) {
                    setInternalDate(date)
                }
                onChangeAction?.(date)
            }

            if (date && !showTime) {
                setOpen(false)
            }
        },
        [isControlled, onChangeAction, showTime, internalTime]
    )

    const handleTimeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const timeValue = e.target.value
            setInternalTime(timeValue)

            if (selectedDate) {
                const [hours, minutes, seconds] = timeValue.split(":").map(Number)
                const dateWithTime = new Date(selectedDate)
                dateWithTime.setHours(hours, minutes, seconds || 0)

                if (!isControlled) {
                    setInternalDate(dateWithTime)
                }
                onChangeAction?.(dateWithTime)
            }
        },
        [selectedDate, isControlled, onChangeAction]
    )

    const handleClear = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            e.stopPropagation()
            handleDateChange(undefined)
        },
        [handleDateChange]
    )

    const isDateDisabled = useCallback(
        (date: Date) => {
            if (disabled) return true
            if (minDate && date < minDate) return true
            return !!(maxDate && date > maxDate);

        },
        [disabled, minDate, maxDate]
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
                "w-full justify-start text-left font-normal h-10 px-3",
                !selectedDate && "text-muted-foreground",
                error && "border-destructive focus-visible:ring-destructive"
            ),
        [selectedDate, error]
    )

    React.useEffect(() => {
        if (selectedDate && showTime) {
            const hours = selectedDate.getHours().toString().padStart(2, "0")
            const minutes = selectedDate.getMinutes().toString().padStart(2, "0")
            const seconds = selectedDate.getSeconds().toString().padStart(2, "0")
            setInternalTime(`${hours}:${minutes}:${seconds}`)
        }
    }, [selectedDate, showTime])

    return (
        <div className={cn("w-full space-y-2", className)}>
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-none block",
                        error && "text-destructive"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <input type="hidden" name={name} value={selectedDate?.toISOString() || ""}/>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            disabled={disabled}
                            aria-invalid={!!error}
                            aria-describedby={
                                error
                                    ? `${id}-error`
                                    : helperText
                                        ? `${id}-helper`
                                        : undefined
                            }
                            aria-label={label || placeholder}
                            className={buttonClasses}
                        >
                            <Calendar className="mr-2 h-4 w-4 shrink-0" aria-hidden="true"/>
                            <span className="truncate">
                {formattedDate || placeholder}
              </span>
                        </Button>

                        {clearable && selectedDate && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                tabIndex={-1}
                                className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                                aria-label="Clear date"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true"/>
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        disabled={isDateDisabled}
                    />
                    {showTime && (
                        <div className="border-t p-3">
                            <div className="flex items-center gap-3">
                                <Label htmlFor={`${id}-time`} className="text-xs whitespace-nowrap">
                                    Time
                                </Label>
                                <div className="relative grow">
                                    <Input
                                        id={`${id}-time`}
                                        type="time"
                                        step="1"
                                        value={internalTime}
                                        onChange={handleTimeChange}
                                        disabled={!selectedDate || disabled}
                                        aria-label="Select time"
                                        className="peer ps-9 [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <div
                                        className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                        <Clock size={16} aria-hidden="true"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {error && (
                <p
                    id={`${id}-error`}
                    className="text-sm text-destructive leading-tight"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p
                    id={`${id}-helper`}
                    className="text-sm text-muted-foreground leading-tight"
                >
                    {helperText}
                </p>
            )}
        </div>
    )
}

export default DatePickerField