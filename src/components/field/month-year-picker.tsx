"use client";

import { Label } from "@/components/ui/label";
import SearchSelectField from "@/components/field/search-select";
import { useState, useEffect } from "react";

interface MonthYearPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  minDate?: Date;
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const generateYears = (minDate?: Date, yearsAhead = 20) => {
  const startYear = minDate ? minDate.getFullYear() : new Date().getFullYear();
  const endYear = startYear + yearsAhead;
  return Array.from({ length: endYear - startYear + 1 }, (_, i) =>
    String(startYear + i),
  );
};

export const MonthYearPicker = ({
  label,
  value,
  onChange,
  error,
  required,
  minDate,
}: MonthYearPickerProps) => {
  const parts = value?.split("-") ?? [];
  const [month, setMonth] = useState(parts[1] ?? "");
  const [year, setYear] = useState(parts[0] ?? "");

  // Sync if parent resets the value
  useEffect(() => {
    const p = value?.split("-") ?? [];
    setMonth(p[1] ?? "");
    setYear(p[0] ?? "");
  }, [value]);

  const years = generateYears(minDate, 30);

  const handleMonthChange = (val: string | number) => {
    const newMonth = String(val);
    setMonth(newMonth);
    if (newMonth && year) {
      const lastDay = new Date(Number(year), Number(newMonth), 0).getDate();
      onChange(`${year}-${newMonth}-${lastDay}`);
    }
  };

  const handleYearChange = (val: string | number) => {
    const newYear = String(val);
    setYear(newYear);
    if (month && newYear) {
      const lastDay = new Date(Number(newYear), Number(month), 0).getDate();
      onChange(`${newYear}-${month}-${lastDay}`);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <SearchSelectField
          placeholder="Month"
          options={MONTHS}
          value={month || null}
          onChange={handleMonthChange}
          error={error && !month ? error : undefined}
          searchPlaceholder="Search month..."
        />
        <SearchSelectField
          placeholder="Year"
          options={years.map((y) => ({ value: y, label: y }))}
          value={year || null}
          onChange={handleYearChange}
          searchPlaceholder="Search year..."
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
