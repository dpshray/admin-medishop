"use client"

import { ReactNode, useId, useRef, useState } from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import {
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleAlert,
    CircleX,
    Columns3,
    Plus,
    Search,
    Trash2,
} from "lucide-react"
import { cn, generatePageRange } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from "@/components/ui/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DataTablePagination {
    page: number
    totalPages: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    pageSizeOptions?: number[]
    dataCount?: number
}

interface DataTableProps<TData, TValue> {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
    onAddAction?: () => void
    onDeleteAction?: (selected: TData[]) => void
    extraActions?: ReactNode
    className?: string
    tableClassName?: string
    paginationClassName?: string
    loading?: boolean
    noDataText?: ReactNode
    pagination?: DataTablePagination
    searchColumn?: string
    searchPlaceholder?: string
    enableSearch?: boolean
    onSearchAction?: (searchValue: string) => void
    enableColumnVisibility?: boolean
    enableRowSelection?: boolean
    enableSorting?: boolean
    defaultPageSize?: number
    totalCount?: number
    actionLabel?: string
}

export function DataTable<TData, TValue>({
                                             data,
                                             columns,
                                             onAddAction,
                                             onDeleteAction,
                                             extraActions,
                                             className,
                                             tableClassName,
                                             paginationClassName,
                                             loading = false,
                                             noDataText = "No data available.",
                                             pagination,
                                             searchColumn = "name",
                                             searchPlaceholder = "Search...",
                                             enableSearch = true,
                                             enableColumnVisibility = true,
                                             enableRowSelection = true,
                                             enableSorting = true,
                                             defaultPageSize = 10,
                                             totalCount,
                                             actionLabel = "Add",
                                         }: DataTableProps<TData, TValue>) {
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [localPagination, setLocalPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: pagination?.pageSize || defaultPageSize,
    })
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        onSortingChange: enableSorting ? setSorting : undefined,
        enableSortingRemoval: false,
        getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
        onPaginationChange: pagination ? undefined : setLocalPagination,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getFilteredRowModel: enableSearch ? getFilteredRowModel() : undefined,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: !!pagination,
        pageCount: pagination?.totalPages ?? -1,
        state: {
            sorting: enableSorting ? sorting : [],
            pagination: pagination
                ? {
                    pageIndex: pagination.page - 1,
                    pageSize: pagination.pageSize || defaultPageSize,
                }
                : localPagination,
            columnFilters,
            columnVisibility,
        },
    })

    const selectedRows = table.getSelectedRowModel().rows.map(
        (row) => row.original
    )
    const currentPage = pagination
        ? pagination.page
        : table.getState().pagination.pageIndex + 1
    const totalPages = pagination ? pagination.totalPages : table.getPageCount()
    const currentPageSize = pagination
        ? pagination.pageSize || defaultPageSize
        : table.getState().pagination.pageSize
    const dataCount = totalCount ?? data.length

    const startIndex = pagination
        ? (pagination.page - 1) * currentPageSize + 1
        : table.getState().pagination.pageIndex *
        table.getState().pagination.pageSize +
        1
    const endIndex = pagination
        ? Math.min(pagination.page * currentPageSize, dataCount)
        : Math.min(
            (table.getState().pagination.pageIndex + 1) *
            table.getState().pagination.pageSize,
            table.getRowCount()
        )

    const handleDeleteRows = () => {
        onDeleteAction?.(selectedRows)
        table.resetRowSelection()
    }

    const handlePageClick = (page: number) => {
        if (pagination) {
            pagination.onPageChange(page)
        } else {
            table.setPageIndex(page - 1)
        }
    }

    const handlePageSizeChange = (newPageSize: number) => {
        if (pagination?.onPageSizeChange) {
            pagination.onPageSizeChange(newPageSize)
        } else {
            table.setPageSize(newPageSize)
            table.setPageIndex(0)
        }
    }

    const clearSearch = () => {
        table.getColumn(searchColumn)?.setFilterValue("")
        inputRef.current?.focus()
    }

    const pageRange = generatePageRange(currentPage, totalPages)
    const showPagination = pagination || table.getPageCount() > 1
    const hasSearch = Boolean(table.getColumn(searchColumn)?.getFilterValue())

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    {enableSearch && (
                        <div className="relative w-full sm:w-auto">
                            <Input
                                id={`${id}-search`}
                                ref={inputRef}
                                className={cn(
                                    "w-full pl-9 sm:min-w-60",
                                    hasSearch && "pr-9"
                                )}
                                value={
                                    (table.getColumn(searchColumn)?.getFilterValue() ?? "") as string
                                }
                                onChange={(e) =>
                                    table.getColumn(searchColumn)?.setFilterValue(e.target.value)
                                }
                                placeholder={searchPlaceholder}
                                type="text"
                                aria-label="Search table"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground">
                                <Search size={16} aria-hidden="true" />
                            </div>
                            {hasSearch && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute inset-y-0 right-0 h-full w-9 rounded-l-none px-0"
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                >
                                    <CircleX size={16} />
                                </Button>
                            )}
                        </div>
                    )}

                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Columns3 size={16} />
                                    View
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(value)
                                            }
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {enableRowSelection &&
                        selectedRows.length > 0 &&
                        onDeleteAction && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Trash2 size={16} />
                                        Delete ({selectedRows.length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
                                            <CircleAlert className="h-5 w-5 text-destructive" />
                                        </div>
                                        <div className="flex-1">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Delete {selectedRows.length} item
                                                    {selectedRows.length > 1 ? "s" : ""}?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. The selected item
                                                    {selectedRows.length > 1 ? "s" : ""} will be
                                                    permanently deleted.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                        </div>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteRows}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                    {onAddAction && (
                        <Button variant="outline" size="sm" onClick={onAddAction}>
                            <Plus size={16} />
                            {actionLabel}
                        </Button>
                    )}

                    {extraActions}
                </div>
            </div>

            <div
                className={cn(
                    "rounded-md border bg-background overflow-x-auto",
                    tableClassName
                )}
            >
                <Table className="min-w-[600px] sm:min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className="h-12"
                                    >
                                        {!header.isPlaceholder && (
                                            <div
                                                className={cn(
                                                    "flex items-center",
                                                    enableSorting &&
                                                    header.column.getCanSort() &&
                                                    "cursor-pointer select-none hover:text-foreground"
                                                )}
                                                onClick={
                                                    enableSorting
                                                        ? header.column.getToggleSortingHandler()
                                                        : undefined
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        enableSorting &&
                                                        header.column.getCanSort() &&
                                                        (e.key === "Enter" || e.key === " ")
                                                    ) {
                                                        e.preventDefault()
                                                        header.column.getToggleSortingHandler()?.(e)
                                                    }
                                                }}
                                                tabIndex={
                                                    enableSorting && header.column.getCanSort()
                                                        ? 0
                                                        : undefined
                                                }
                                                role={
                                                    enableSorting && header.column.getCanSort()
                                                        ? "button"
                                                        : undefined
                                                }
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {enableSorting && header.column.getCanSort() && (
                                                    <div className="ml-2">
                                                        {header.column.getIsSorted() === "asc" && (
                                                            <ChevronUp size={16} />
                                                        )}
                                                        {header.column.getIsSorted() === "desc" && (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: currentPageSize }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {columns.map((_, j) => (
                                        <TableCell key={`skeleton-cell-${j}`} className="h-12">
                                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    className={cn(
                                        "hover:bg-muted/50",
                                        row.getIsSelected() && "bg-muted"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="h-12">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {noDataText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <div
                    className={cn(
                        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                        paginationClassName
                    )}
                >
                    {/* Left side - Rows per page */}
                    <div className="flex items-center space-x-2">
                        <Label htmlFor={`${id}-page-size`} className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <Select
                            value={currentPageSize.toString()}
                            onValueChange={(value) => {
                                const newSize = Number(value)
                                handlePageSizeChange(newSize)
                            }}
                        >
                            <SelectTrigger id={`${id}-page-size`} className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(pagination?.pageSizeOptions || [5, 10, 25, 50, 100]).map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Right side - Info + Pagination in one line */}
                    <div className="flex items-center justify-end gap-4">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {startIndex}-{endIndex} of {dataCount}
      </span>

                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(1)}
                                        disabled={currentPage === 1}
                                        aria-label="Go to first page"
                                    >
                                        <ChevronFirst size={16} />
                                    </Button>
                                </PaginationItem>

                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Go to previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                </PaginationItem>

                                {pageRange.map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === "ellipsis" ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <Button
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageClick(page as number)}
                                                aria-label={`Go to page ${page}`}
                                                className={cn(
                                                    "h-9 w-9 hover:bg-gray-100",
                                                    page === currentPage ? "bg-primaryColor/60" : ""
                                                )}
                                            >
                                                {page}
                                            </Button>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Go to next page"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </PaginationItem>

                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(totalPages)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Go to last page"
                                    >
                                        <ChevronLast size={16} />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}

        </div>
    )
}
