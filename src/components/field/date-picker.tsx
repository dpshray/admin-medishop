"use client"

import { useCallback, useId, useMemo, useEffect, useState, useRef } from "react"
import { format, parse, isValid } from "date-fns"
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
    allowManualInput?: boolean
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
    allowManualInput = false,
}: DatePickerFieldProps) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const isControlled = value !== undefined
    const [internalDate, setInternalDate] = useState<Date | undefined>(defaultValue)
    const [internalTime, setInternalTime] = useState("12:00:00")
    const [open, setOpen] = useState(false)
    const [textInput, setTextInput] = useState("")
    const [textError, setTextError] = useState(false)
    const selectedDate = isControlled ? value : internalDate

    // Sync text input when date changes externally
    useEffect(() => {
        if (selectedDate) {
            setTextInput(format(selectedDate, "dd/MM/yyyy"))
            setTextError(false)
        } else {
            setTextInput("")
        }
    }, [selectedDate])

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

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setTextInput(raw)
        setTextError(false)

        // Auto-insert slashes: "01" → "01/", "01/02" → "01/02/"
        if (/^\d{2}$/.test(raw) || /^\d{2}\/\d{2}$/.test(raw)) {
            setTextInput(raw + "/")
            return
        }
    }, [])

    const handleTextCommit = useCallback(() => {
        if (!textInput) {
            handleDateChange(undefined)
            return
        }

        // Support dd/MM/yyyy and yyyy-MM-dd
        let parsed: Date | undefined

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(textInput)) {
            parsed = parse(textInput, "dd/MM/yyyy", new Date())
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(textInput)) {
            parsed = parse(textInput, "yyyy-MM-dd", new Date())
        }

        if (parsed && isValid(parsed)) {
            setTextError(false)
            handleDateChange(parsed)
        } else {
            setTextError(true)
        }
    }, [textInput, handleDateChange])

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
            setTextInput("")
            setTextError(false)
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

    return (
        <div className={cn("w-full space-y-1", className)}>
            {label && (
                <Label htmlFor={id} className={cn("text-sm font-semibold", (error || textError) && "text-destructive")}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <Input type="hidden" name={name} value={selectedDate ? selectedDate.toISOString() : ""} />

            {allowManualInput ? (
                <div className="flex gap-1.5">
                    {/* Manual text input */}
                    <div className="relative flex-1">
                        <Input
                            id={id}
                            type="text"
                            value={textInput}
                            onChange={handleTextChange}
                            onBlur={handleTextCommit}
                            onKeyDown={(e) => e.key === "Enter" && handleTextCommit()}
                            placeholder="DD/MM/YYYY"
                            disabled={disabled}
                            maxLength={10}
                            aria-invalid={!!(error || textError)}
                            className={cn(
                                "pr-8",
                                (error || textError) && "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                        {clearable && selectedDate && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                tabIndex={-1}
                                className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-muted"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>

                    {/* Calendar popover trigger icon */}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={disabled}
                                className={cn(
                                    "h-10 w-10 p-0 shrink-0",
                                    (error || textError) && "border-destructive"
                                )}
                                aria-label="Open calendar"
                            >
                                <Calendar className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateChange}
                                className="rounded-b-md"
                            />
                            {showTime && (
                                <div className="border-t px-4 py-3 flex items-center space-x-3">
                                    <Label htmlFor={`${id}-time`} className="text-xs font-medium">Time</Label>
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
                </div>
            ) : (
                /* Original calendar-only trigger */
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
                                className={cn(
                                    "w-full justify-start text-left font-normal h-10 px-3 rounded-md border border-input bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                                    !selectedDate && "text-muted-foreground",
                                    error && "border-destructive focus:ring-destructive",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
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
                                <Label htmlFor={`${id}-time`} className="text-xs font-medium">Time</Label>
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
            )}

            {(error || textError) && (
                <p id={`${id}-error`} className="text-sm text-destructive mt-1" role="alert">
                    {error || "Invalid date — use DD/MM/YYYY format"}
                </p>
            )}
            {!error && !textError && helperText && (
                <p id={`${id}-helper`} className="text-sm text-muted-foreground mt-1">
                    {helperText}
                </p>
            )}
        </div>
    )
}

export default DatePickerField