"use client";

import SearchSelectField from "@/components/field/search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

export type Preset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export interface SalesFilters {
  preset: Preset;
  date_from?: string;
  date_to?: string;
  vendor_id?: string;
  category_id?: string;
  district?: string;
  payment_method?: string;
  status?: string;
}

interface SalesFiltersBarProps {
  filters: SalesFilters;
  onChange: (filters: Partial<SalesFilters>) => void;
  onExport?: (format: "xlsx" | "csv") => void;
  isExporting?: boolean;
}

const PRESET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

const PAYMENT_OPTIONS = [
  { value: "all", label: "All payments" },
  { value: "COD", label: "COD" },
  { value: "eSewa", label: "eSewa" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

export function SalesFiltersBar({
  filters,
  onChange,
  onExport,
  isExporting,
}: SalesFiltersBarProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handlePresetChange = (value: string | number) => {
    const preset = value as Preset;
    if (preset === "custom") {
      onChange({ preset });
    } else {
      onChange({ preset, date_from: undefined, date_to: undefined });
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onChange({
        preset: "custom",
        date_from: format(range.from, "yyyy-MM-dd"),
        date_to: format(range.to, "yyyy-MM-dd"),
      });
      setCalendarOpen(false);
    }
  };

  const showCustomDate =
    filters.preset === "custom" && filters.date_from && filters.date_to;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal size={15} className="text-gray-400 flex-shrink-0" />

      {/* Date Preset */}
      {filters.preset !== "custom" ? (
        <SearchSelectField
          placeholder="Date range"
          options={PRESET_OPTIONS}
          value={filters.preset}
          onChange={handlePresetChange}
          className="w-auto"
          inputClassName="h-9 min-w-[140px] text-sm"
          searchPlaceholder="Search preset..."
        />
      ) : (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 gap-2 border-gray-200 text-sm font-normal",
                showCustomDate ? "text-gray-900" : "text-gray-400",
              )}
            >
              <CalendarIcon size={14} />
              {showCustomDate
                ? `${filters.date_from} → ${filters.date_to}`
                : "Pick a range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              initialFocus
            />
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => handlePresetChange("last_30_days")}
              >
                ← Back to presets
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Payment Method */}
      <SearchSelectField
        placeholder="Payment"
        options={PAYMENT_OPTIONS}
        value={filters.payment_method ?? "all"}
        onChange={(v) =>
          onChange({ payment_method: v === "all" ? undefined : String(v) })
        }
        className="w-auto"
        inputClassName="h-9 min-w-[130px] text-sm"
        searchPlaceholder="Search payment..."
      />

      {/* Status */}
      <SearchSelectField
        placeholder="Status"
        options={STATUS_OPTIONS}
        value={filters.status ?? "all"}
        onChange={(v) =>
          onChange({ status: v === "all" ? undefined : String(v) })
        }
        className="w-auto"
        inputClassName="h-9 min-w-[120px] text-sm"
        searchPlaceholder="Search status..."
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export */}
      {onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-[#4a358e] text-[#4a358e] hover:bg-[#4a358e] hover:text-white transition-colors"
              disabled={isExporting}
            >
              <Download size={14} />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("xlsx")}>
              Export as Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("csv")}>
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
