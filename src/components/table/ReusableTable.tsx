"use client"

import { type ReactNode, useEffect, useId, useRef, useState } from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedUniqueValues,
    getSortedRowModel,
    type Row,
    type RowSelectionState,
    type SortingState,
    useReactTable,
    type VisibilityState,
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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination"

import React from "react"
import {useDebounce} from "@/hooks/use-debounce";

interface DataTablePagination {
    page: number
    totalPages: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
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
    pagination: DataTablePagination
    searchPlaceholder?: string
    enableSearch?: boolean
    enableColumnVisibility?: boolean
    enableRowSelection?: boolean
    enableSorting?: boolean
    defaultPageSize?: number
    onSearchAction?: (value: string) => void
    totalCount?: number
    actionLabel?: string
    enableExpanding?: boolean
    getRowCanExpand?: (row: Row<TData>) => boolean
    renderSubComponent?: (row: Row<TData>) => ReactNode
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
                                             searchPlaceholder = "Search...",
                                             enableSearch = true,
                                             enableColumnVisibility = true,
                                             enableRowSelection = true,
                                             enableSorting = true,
                                             onSearchAction,
                                             totalCount,
                                             actionLabel = "Add",
                                             enableExpanding = false,
                                             getRowCanExpand,
                                             renderSubComponent,
                                         }: DataTableProps<TData, TValue>) {
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [expanded, setExpanded] = useState<ExpandedState>({})

    useEffect(() => {
        if (onSearchAction) {
            onSearchAction(debouncedSearch)
        }
    }, [debouncedSearch, onSearchAction])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
        onSortingChange: enableSorting ? setSorting : undefined,
        onExpandedChange: enableExpanding ? setExpanded : undefined,
        enableSortingRemoval: false,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        pageCount: pagination.totalPages,
        enableRowSelection,
        onRowSelectionChange: setRowSelection,
        getRowCanExpand: enableExpanding ? getRowCanExpand : undefined,
        state: {
            sorting: enableSorting ? sorting : [],
            expanded: enableExpanding ? expanded : {},
            pagination: {
                pageIndex: pagination.page - 1,
                pageSize: pagination.pageSize,
            },
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
    const currentPage = pagination.page
    const totalPages = pagination.totalPages
    const currentPageSize = pagination.pageSize
    const dataCount = totalCount ?? data.length
    const startIndex = (currentPage - 1) * currentPageSize + 1
    const endIndex = Math.min(currentPage * currentPageSize, dataCount)

    const handleDeleteRows = () => {
        if (selectedRows.length > 0) {
            onDeleteAction?.(selectedRows)
            table.resetRowSelection()
        }
    }

    const handlePageClick = (page: number) => {
        if (page > 0 && page <= totalPages) {
            pagination.onPageChange(page)
        }
    }

    const handlePageSizeChange = (newPageSize: string) => {
        const pageSize = Number.parseInt(newPageSize, 10)
        pagination.onPageSizeChange(pageSize)
        pagination.onPageChange(1)
    }

    const clearSearch = () => {
        setSearch("")
        inputRef.current?.focus()
    }

    const pageRange = generatePageRange(currentPage, totalPages)
    const showPagination = totalPages > 1 && dataCount > 0
    const hasSearch = Boolean(search)

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    {enableSearch && (
                        <div className="relative w-full sm:w-auto">
                            <Input
                                id={`${id}-search`}
                                ref={inputRef}
                                className={cn("w-full pl-9 sm:min-w-60", hasSearch && "pr-9")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                                    <Columns3 size={16} /> View
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
                                            onCheckedChange={(value) => column.toggleVisibility(value)}
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
                    {enableRowSelection && selectedRows.length > 0 && onDeleteAction && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Trash2 size={16} /> Delete ({selectedRows.length})
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
                                                Delete {selectedRows.length} item{selectedRows.length > 1 ? "s" : ""}?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. The selected item
                                                {selectedRows.length > 1 ? "s" : ""} will be permanently deleted.
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
                            <Plus size={16} /> {actionLabel}
                        </Button>
                    )}
                    {extraActions}
                </div>
            </div>

            <div className={cn("overflow-x-auto rounded-md border bg-background", tableClassName)}>
                <Table className="min-w-[600px] sm:min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} style={{ width: header.getSize() }} className="h-12">
                                        {!header.isPlaceholder && (
                                            <div
                                                className={cn(
                                                    "flex items-center",
                                                    enableSorting &&
                                                    header.column.getCanSort() &&
                                                    "cursor-pointer select-none hover:text-foreground"
                                                )}
                                                onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                                                tabIndex={enableSorting && header.column.getCanSort() ? 0 : undefined}
                                                role={enableSorting && header.column.getCanSort() ? "button" : undefined}
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
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {enableSorting && header.column.getCanSort() && (
                                                    <div className="ml-2">
                                                        {header.column.getIsSorted() === "asc" && <ChevronUp size={16} />}
                                                        {header.column.getIsSorted() === "desc" && <ChevronDown size={16} />}
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
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={row.getIsSelected() ? "selected" : undefined}
                                        className={cn("hover:bg-muted/50", row.getIsSelected() && "bg-muted")}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="h-12">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {enableExpanding && row.getIsExpanded() && renderSubComponent && (
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={columns.length} className="p-0">
                                                {renderSubComponent(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {noDataText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", paginationClassName)}>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor={`${id}-page-size`} className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <Select value={currentPageSize.toString()} onValueChange={handlePageSizeChange}>
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

                    <div className="flex items-center justify-end gap-4">
                        <span className="whitespace-nowrap text-sm text-muted-foreground">
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
                                                className={cn("h-9 w-9", page === currentPage && "bg-primaryColor text-primary-foreground")}
                                                aria-label={`Go to page ${page}`}
                                                aria-current={page === currentPage ? "page" : undefined}
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