"use client"

import {type ReactNode, useEffect, useId, useRef, useState, useCallback, memo} from "react"
import React from "react"
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
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Pagination, PaginationContent, PaginationEllipsis, PaginationItem} from "@/components/ui/pagination"

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ")

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

const generatePageRange = (currentPage: number, totalPages: number): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
        return Array.from({length: totalPages}, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, "ellipsis", totalPages]
    }

    if (currentPage >= totalPages - 2) {
        return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
}

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
    onSearchAction?: (value: string) => void
    totalCount?: number
    actionLabel?: string
    enableExpanding?: boolean
    getRowCanExpand?: (row: Row<TData>) => boolean
    renderSubComponent?: (row: Row<TData>) => ReactNode
}

const SkeletonRow = memo(({columnCount}: {columnCount: number}) => (
    <TableRow>
        {Array.from({length: columnCount}).map((_, j) => (
            <TableCell key={j} className="h-14 px-4">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"/>
            </TableCell>
        ))}
    </TableRow>
))

SkeletonRow.displayName = "SkeletonRow"

const EmptyRow = memo(({ columnCount, noDataText }: { columnCount: number; noDataText: ReactNode }) => (
    <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columnCount} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-6 w-6 text-gray-500" aria-hidden="true" />
                </div>
                <div className="text-sm text-gray-600">{noDataText}</div>
            </div>
        </TableCell>
    </TableRow>
))

EmptyRow.displayName = "EmptyRow"

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
        if (onSearchAction && debouncedSearch !== undefined) {
            onSearchAction(debouncedSearch)
        }
    }, [debouncedSearch, onSearchAction])

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value)
        pagination.onPageChange(1)
    }, [pagination])

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

    const handleDeleteRows = useCallback(() => {
        if (selectedRows.length > 0) {
            onDeleteAction?.(selectedRows)
            table.resetRowSelection()
        }
    }, [selectedRows, onDeleteAction, table])

    const handlePageClick = useCallback((page: number) => {
        if (page > 0 && page <= totalPages) {
            pagination.onPageChange(page)
        }
    }, [totalPages, pagination])

    const handlePageSizeChange = useCallback((newPageSize: string) => {
        const pageSize = Number.parseInt(newPageSize, 10)
        pagination.onPageSizeChange(pageSize)
        pagination.onPageChange(1)
    }, [pagination])

    const clearSearch = useCallback(() => {
        setSearch("")
        pagination.onPageChange(1)
        inputRef.current?.focus()
    }, [pagination])

    const handleSortingClick = useCallback((handler: any) => (e: React.MouseEvent) => {
        e.preventDefault()
        handler?.(e)
    }, [])

    const handleKeyDown = useCallback((handler: any) => (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handler?.(e)
        }
    }, [])

    const pageRange = generatePageRange(currentPage, totalPages)
    const showPagination = totalPages > 1 && dataCount > 0
    const hasSearch = Boolean(search)
    const hasSelectedRows = selectedRows.length > 0

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                    {enableSearch && (
                        <div className="relative w-full sm:w-auto sm:min-w-60 md:min-w-80">
                            <Input
                                id={`${id}-search`}
                                ref={inputRef}
                                className={cn("w-full pl-9 h-10", hasSearch && "pr-9")}
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                                type="search"
                                aria-label="Search table"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-gray-500">
                                <Search size={16} aria-hidden="true"/>
                            </div>
                            {hasSearch && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute inset-y-0 right-0 h-full w-9 rounded-l-none px-0 hover:bg-transparent"
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                >
                                    <CircleX size={16} className="text-gray-500 hover:text-gray-900"/>
                                </Button>
                            )}
                        </div>
                    )}
                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 gap-2">
                                    <Columns3 size={16} aria-hidden="true"/>
                                    <span className="hidden sm:inline">Columns</span>
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:justify-end">
                    {enableRowSelection && hasSelectedRows && onDeleteAction && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 gap-2">
                                    <Trash2 size={16} aria-hidden="true"/>
                                    <span>Delete ({selectedRows.length})</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50">
                                        <CircleAlert className="h-5 w-5 text-red-600" aria-hidden="true"/>
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
                                        className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {onAddAction && (
                        <Button variant="outline" size="sm" onClick={onAddAction} className="h-10 gap-2">
                            <Plus size={16} aria-hidden="true"/>
                            <span>{actionLabel}</span>
                        </Button>
                    )}
                    {extraActions}
                </div>
            </div>

            <div className={cn("overflow-hidden rounded-lg border bg-white shadow-sm", tableClassName)}>
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{width: header.getSize()}}
                                            className="h-12 px-4"
                                        >
                                            {!header.isPlaceholder && (
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-2",
                                                        enableSorting &&
                                                        header.column.getCanSort() &&
                                                        "cursor-pointer select-none hover:text-gray-900 transition-colors"
                                                    )}
                                                    onClick={
                                                        enableSorting && header.column.getCanSort()
                                                            ? handleSortingClick(header.column.getToggleSortingHandler())
                                                            : undefined
                                                    }
                                                    tabIndex={enableSorting && header.column.getCanSort() ? 0 : undefined}
                                                    role={enableSorting && header.column.getCanSort() ? "button" : undefined}
                                                    onKeyDown={
                                                        enableSorting && header.column.getCanSort()
                                                            ? handleKeyDown(header.column.getToggleSortingHandler())
                                                            : undefined
                                                    }
                                                    aria-label={
                                                        enableSorting && header.column.getCanSort()
                                                            ? `Sort by ${header.id}`
                                                            : undefined
                                                    }
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {enableSorting && header.column.getCanSort() && (
                                                        <div className="flex-shrink-0">
                                                            {header.column.getIsSorted() === "asc" && (
                                                                <ChevronUp size={16} aria-label="Sorted ascending"/>
                                                            )}
                                                            {header.column.getIsSorted() === "desc" && (
                                                                <ChevronDown size={16} aria-label="Sorted descending"/>
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
                                Array.from({length: currentPageSize}).map((_, i) => (
                                    <SkeletonRow key={i} columnCount={columns.length}/>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <TableRow
                                            data-state={row.getIsSelected() ? "selected" : undefined}
                                            className={cn(
                                                "hover:bg-gray-50 transition-colors",
                                                row.getIsSelected() && "bg-gray-100"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="h-14 px-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        {enableExpanding && row.getIsExpanded() && renderSubComponent && (
                                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                <TableCell colSpan={columns.length} className="p-4">
                                                    {renderSubComponent(row)}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <EmptyRow columnCount={columns.length} noDataText={noDataText}/>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {showPagination && (
                <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", paginationClassName)}>
                    <div className="flex items-center gap-2">
                        <Label htmlFor={`${id}-page-size`} className="text-sm font-medium whitespace-nowrap">
                            Rows per page
                        </Label>
                        <Select value={currentPageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger id={`${id}-page-size`} className="w-20 h-9">
                                <SelectValue/>
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

                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
                        <span className="whitespace-nowrap text-sm text-gray-600 tabular-nums">
                            {startIndex}-{endIndex} of {dataCount}
                        </span>
                        <Pagination>
                            <PaginationContent className="flex-wrap justify-center gap-1">
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(1)}
                                        disabled={currentPage === 1}
                                        aria-label="Go to first page"
                                        className="h-9 w-9"
                                    >
                                        <ChevronFirst size={16} aria-hidden="true"/>
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Go to previous page"
                                        className="h-9 w-9"
                                    >
                                        <ChevronLeft size={16} aria-hidden="true"/>
                                    </Button>
                                </PaginationItem>
                                {pageRange.map((page, index) => (
                                    <PaginationItem key={index} className="hidden sm:block">
                                        {page === "ellipsis" ? (
                                            <PaginationEllipsis/>
                                        ) : (
                                            <Button
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageClick(page as number)}
                                                className={cn(
                                                    "h-9 w-9 tabular-nums",
                                                    page === currentPage && "bg-primaryColor text-white"
                                                )}
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
                                        className="h-9 w-9"
                                    >
                                        <ChevronRight size={16} aria-hidden="true"/>
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(totalPages)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Go to last page"
                                        className="h-9 w-9"
                                    >
                                        <ChevronLast size={16} aria-hidden="true"/>
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