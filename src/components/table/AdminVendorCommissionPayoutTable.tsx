"use client";

import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/table/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { NoDataFound } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_SYMBOL } from "@/config/app-constant";
import {
  useGetCommissionPayoutByVendorId,
  useUpdatePayoutStatus,
} from "@/hooks/use-report";
import { RowActions } from "@/lib/action-button";
import ActionModal from "../modal/ConfirmModal";
import SearchSelectField from "../field/search-select";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

interface VendorCommissionPayout {
  id: number;
  uuid: string;
  vendor_id: number;
  period_from: string;
  period_to: string;
  gross_sales: string;
  commission_amount: string;
  refund_adjustments: string;
  net_payable: string;
  commission_rate: string;
  status: string;
  requested_at: string;
  settlement_date: string | null;
  remarks: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  vendorId: number;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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

const PER_PAGE_OPTIONS = [
  { value: 10, label: "10 / page" },
  { value: 25, label: "25 / page" },
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
];

export default function AdminVendorCommissionPayoutTable({ vendorId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<VendorCommissionPayout | null>(
    null,
  );
  const [modalType, setModalType] = useState<"PAID" | "UNPAID" | null>(null);
  const [preset, setPreset] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [perPage, setPerPage] = useState<number>(25);
  const [remarks, setRemarks] = useState<string>("");

  const { data, isLoading, isError, error } = useGetCommissionPayoutByVendorId(
    vendorId,
    {
      page: currentPage,
      per_page: perPage,
      preset: preset || undefined,

      date_from:
        preset === "custom" && dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
      date_to:
        preset === "custom" && dateRange?.to
          ? format(dateRange.to, "yyyy-MM-dd")
          : undefined,
    },
  );

  const { mutate: updateStatus, isPending } = useUpdatePayoutStatus();

  const payouts = useMemo(() => data?.data?.data || [], [data]);
  const totalPages = data?.data?.last_page || 1;
  const totalItems = data?.data?.total || 0;

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const openModal = useCallback(
    (row: VendorCommissionPayout, type: "PAID" | "UNPAID") => {
      setSelectedRow(row);
      setModalType(type);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setSelectedRow(null);
    setModalType(null);
    setRemarks("");
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedRow || !modalType) return;
    updateStatus(
      { id: String(selectedRow.id), status: modalType, remarks },
      { onSuccess: closeModal },
    );
  }, [selectedRow, modalType, updateStatus, closeModal, remarks]);

  const handlePresetChange = useCallback((value: string | number) => {
    setPreset(String(value));
    setDateRange(undefined);
    setCurrentPage(1);
  }, []);

  const handlePerPageChange = useCallback((value: string | number) => {
    setPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!preset || !!dateRange?.from;

  const columns: ColumnDef<VendorCommissionPayout>[] = useMemo(
    () => [
      {
        accessorKey: "period_from",
        header: "Period",
        size: 220,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-900">
              {formatDate(row.original.period_from)}
            </span>
            <span className="text-xs text-muted-foreground">
              to {formatDate(row.original.period_to)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "commission_rate",
        header: "Commission Rate",
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-semibold">
            {row.original.commission_rate}%
          </Badge>
        ),
      },
      {
        accessorKey: "gross_sales",
        header: "Gross Sales",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {CURRENCY_SYMBOL}{" "}
            {Number(row.original.gross_sales).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "commission_amount",
        header: "Commission",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-orange-600 font-medium">
            {CURRENCY_SYMBOL}{" "}
            {Number(row.original.commission_amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "refund_adjustments",
        header: "Refund Adj.",
        size: 130,
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-red-500">
            -{CURRENCY_SYMBOL}{" "}
            {Number(row.original.refund_adjustments).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "net_payable",
        header: "Net Payable",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums font-semibold text-green-700">
            {CURRENCY_SYMBOL}{" "}
            {Number(row.original.net_payable).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();
          return (
            <Badge
              variant="outline"
              className={
                status === "paid"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : status === "pending"
                    ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                    : status === "processing"
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : status === "rejected"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-300 bg-slate-50 text-slate-700"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "requested_at",
        header: "Requested At",
        size: 150,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.requested_at)}
          </span>
        ),
      },
      {
        accessorKey: "settlement_date",
        header: "Settlement Date",
        size: 150,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.settlement_date)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => {
          const isPaid = row.original.status?.toLowerCase() === "paid";
          return (
            <RowActions
              row={row}
              onEditAction={() =>
                openModal(row.original, isPaid ? "UNPAID" : "PAID")
              }
              editLabel={isPaid ? "Mark as Unpaid" : "Mark as Paid"}
            />
          );
        },
      },
    ],
    [openModal],
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Failed to load payout records
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchSelectField
            placeholder="Select Period"
            options={PRESET_OPTIONS}
            value={preset}
            onChange={handlePresetChange}
            className="w-[180px]"
          />

          {preset === "custom" && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 gap-2 text-sm font-normal",
                    dateRange?.from && dateRange?.to
                      ? "text-gray-900"
                      : "text-muted-foreground",
                  )}
                >
                  <CalendarIcon size={14} />
                  {dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, "MMM d, yyyy")} → ${format(dateRange.to, "MMM d, yyyy")}`
                    : "Pick a range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) {
                      setCurrentPage(1);
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
                      setPreset("");
                      setDateRange(undefined);
                      setCalendarOpen(false);
                    }}
                  >
                    ← Back to presets
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <SearchSelectField
            placeholder="25 / page"
            options={PER_PAGE_OPTIONS}
            value={perPage}
            onChange={handlePerPageChange}
            className="w-[130px]"
          />

          {hasActiveFilters && (
            <button
              onClick={() => {
                setPreset("");
                setDateRange(undefined);
                setCurrentPage(1);
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
        <DataTable<VendorCommissionPayout, any>
          data={payouts}
          columns={columns}
          loading={isLoading}
          pagination={{
            page: currentPage,
            totalPages,
            onPageChange: handlePageChange,
            dataCount: totalItems,
          }}
          enableRowSelection
          enableSorting
          enableColumnVisibility
          totalCount={totalItems}
          noDataText={<NoDataFound />}
        />
      </div>

      <ActionModal
        open={!!selectedRow && !!modalType}
        setOpen={(open) => !open && closeModal()}
        title={modalType === "PAID" ? "Mark as Paid" : "Mark as Unpaid"}
        description={
          modalType === "PAID"
            ? "Are you sure you want to mark this payout as paid? This action will update the payout status."
            : "Are you sure you want to mark this payout as unpaid? This will revert the payout status."
        }
        confirmLabel={modalType === "PAID" ? "Mark as Paid" : "Mark as Unpaid"}
        confirmVariant={modalType === "PAID" ? "default" : "destructive"}
        buttonClassName={
          modalType === "PAID" ? "bg-emerald-600 hover:bg-emerald-700" : ""
        }
        loading={isPending}
        onConfirm={handleConfirm}
        showRemarks
        remarks={remarks}
        onRemarksChange={setRemarks}
        remarksLabel="Remarks (optional)"
      />
    </>
  );
}
