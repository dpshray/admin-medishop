"use client";

import { useCallback, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import SearchSelectField from "@/components/field/search-select";

export interface VendorSalesFilters {
  preset?: string;
  start_date?: string;
  end_date?: string;
  group_by?: "day" | "week" | "month";
  order_status?: string;
}

interface Props {
  filters: VendorSalesFilters;
  onChange: (partial: Partial<VendorSalesFilters>) => void;
}

const PRESET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const GROUP_BY_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export default function VendorSalesReportFilters({ filters, onChange }: Props) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isCustom = filters.preset === "custom";

  const hasActiveFilters =
    !!filters.preset || !!filters.group_by || !!filters.order_status;

  const handlePresetChange = useCallback(
    (value: string | number) => {
      const v = value === "" ? undefined : String(value);
      if (v === "custom") {
        onChange({
          preset: "custom",
          start_date: undefined,
          end_date: undefined,
        });
        setCalendarOpen(true);
      } else {
        setDateRange(undefined);
        onChange({
          preset: v,
          start_date: undefined,
          end_date: undefined,
        });
      }
    },
    [onChange],
  );

  const clearAll = useCallback(() => {
    setDateRange(undefined);
    onChange({
      preset: undefined,
      start_date: undefined,
      end_date: undefined,
      group_by: undefined,
      order_status: undefined,
    });
  }, [onChange]);

  const calendarTriggerLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "MMM d")} → ${format(dateRange.to, "MMM d, yyyy")}`
      : "Pick a range";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        {/* Preset or custom calendar */}
        {!isCustom ? (
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Date Range
            </label>
            <SearchSelectField
              placeholder="Date range"
              options={PRESET_OPTIONS}
              value={filters.preset ?? null}
              onChange={handlePresetChange}
              searchPlaceholder="Search presets..."
              className="w-[160px]"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Date Range
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 gap-2 text-sm font-normal",
                    dateRange?.from && dateRange?.to
                      ? "border-indigo-400 text-indigo-600"
                      : "text-muted-foreground",
                  )}
                >
                  <CalendarIcon size={14} />
                  {calendarTriggerLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) {
                      onChange({
                        preset: "custom",
                        start_date: format(range.from, "yyyy-MM-dd"),
                        end_date: format(range.to, "yyyy-MM-dd"),
                      });
                      setCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => {
                      setDateRange(undefined);
                      onChange({
                        preset: undefined,
                        start_date: undefined,
                        end_date: undefined,
                      });
                      setCalendarOpen(false);
                    }}
                  >
                    ← Back to presets
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Group by */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Group By
          </label>
          <SearchSelectField
            placeholder="Group By"
            options={GROUP_BY_OPTIONS}
            value={filters.group_by ?? null}
            onChange={(v) =>
              onChange({
                group_by: (v === ""
                  ? undefined
                  : String(v)) as VendorSalesFilters["group_by"],
              })
            }
            searchPlaceholder="Search..."
            className="w-36"
          />
        </div>

        {/* Order status */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Order Status
          </label>
          <SearchSelectField
            placeholder="All Statuses"
            options={ORDER_STATUSES}
            value={filters.order_status ?? null}
            onChange={(v) =>
              onChange({ order_status: v === "" ? undefined : String(v) })
            }
            searchPlaceholder="Search status..."
            className="w-52"
          />
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
