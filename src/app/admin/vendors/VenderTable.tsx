'use client'

import {useEffect, useId, useMemo, useRef, useState} from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState
} from "@tanstack/react-table"
import {useQuery} from "@tanstack/react-query"
import {ChevronDownIcon, ChevronUpIcon, CircleAlertIcon, ListFilterIcon, PlusIcon, TrashIcon} from "lucide-react"
import vendorService from "@/service/vendor.service"
import CustomPagination from "@/components/custom-pagination"
import {RowActions} from "@/lib/helper"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {Badge} from "@/components/ui/badge"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {cn} from "@/lib/utils"

type Vendor = {
    user_uuid: string
    vendor_uuid: string
    name: string
    email?: string
    mobile_number: string
    store_name: string
    status: "Active" | "Inactive" | "Pending" | "Suspended" | string
    country: string
    flag?: string
    performance?: string
    balance?: number
}

type VendorResponse = {
    items: Vendor[]
    page: number
    total_page: number
}

const statusFilterFn: FilterFn<Vendor> = (row, columnId, filterValue: string[]) => {
    if (!filterValue?.length) return true
    return filterValue.includes(row.getValue(columnId) as string)
}

const columns: ColumnDef<Vendor>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                className="mx-auto"
                aria-label="Select all rows"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="mx-auto"
                aria-label="Select row"
            />
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
    },
    {
        header: "Name",
        accessorKey: "name",
        cell: ({row}) => <div
            className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{row.getValue("name")}</div>,
        enableHiding: false
    },
    {
        header: "Email",
        accessorKey: "email",
        cell: ({row}) => <div
            className="text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">{row.getValue("email")}</div>
    },
    {
        header: "Phone",
        accessorKey: "mobile_number",
        cell: ({row}) => <div className="text-xs sm:text-sm truncate flex items-center gap-1"><span
            className="text-base leading-none">{row.original.flag}</span><span>{row.getValue("mobile_number")}</span>
        </div>
    },
    {
        header: "Store",
        accessorKey: "store_name",
        cell: ({row}) => <div
            className="text-xs sm:text-sm truncate max-w-[90px] sm:max-w-none">{row.getValue("store_name")}</div>
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({row}) => <Badge
            className={cn("text-xs px-2 py-1", row.getValue("status") === "Inactive" && "bg-muted-foreground/60 text-primary-foreground")}>{row.getValue("status")}</Badge>,
        filterFn: statusFilterFn
    },
    {
        header: "Performance",
        accessorKey: "performance",
        cell: ({row}) => <div className="text-xs sm:text-sm truncate">{row.getValue("performance")}</div>
    },
    {
        header: "Balance",
        accessorKey: "balance",
        cell: ({row}) => <div className="text-xs sm:text-sm font-medium">{new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number.parseFloat(row.getValue("balance")))}</div>
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({row}) => <RowActions row={row}/>,
        size: 50,
        enableHiding: false
    },
]

export default function VendorTable() {
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([{id: "name", desc: false}])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)

    const {data: vendors, isLoading, isError, error} = useQuery<VendorResponse, Error>({
        queryKey: ["admin-vendor", currentPage],
        queryFn: () => vendorService.getAllVendor({page: currentPage, per_page: 10}),
        placeholderData: (prev) => prev,
    })

    useEffect(() => {
        if (vendors) {
            setCurrentPage(vendors.page ?? 1)
            setTotalPages(vendors.total_page ?? 1)
        }
    }, [vendors])

    const data = useMemo(() => vendors?.items ?? [], [vendors])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        state: {sorting, columnFilters, columnVisibility},
        enableSortingRemoval: false,
        manualPagination: true,
        pageCount: totalPages,
    })

    const handlePageChange = (page: number) => setCurrentPage(page)
    const handleDeleteRows = () => {
        table.getSelectedRowModel().rows;
        table.resetRowSelection()
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <div className="relative w-full max-w-xs sm:max-w-sm">
                    <Input
                        id={`${id}-filter`}
                        ref={inputRef}
                        value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
                        onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                        placeholder="Filter by name..."
                        aria-label="Filter by name"
                        className="w-full text-xs sm:text-sm h-9 sm:h-10 ps-9"
                    />
                    <div
                        className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80 pointer-events-none">
                        <ListFilterIcon size={16} className="w-4 h-4"/>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"
                                        className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10 px-4 w-full sm:w-auto">
                                    <TrashIcon className="w-4 h-4 opacity-60"/> Delete
                                    <span
                                        className="bg-background text-muted-foreground/70 inline-flex h-5 items-center rounded border px-1 text-xs font-medium ml-1">{table.getSelectedRowModel().rows.length}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently
                                        delete {table.getSelectedRowModel().rows.length} vendor{table.getSelectedRowModel().rows.length > 1 ? "s" : ""}.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <AlertDialogCancel className="h-9 text-sm">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteRows}
                                                       className="h-9 text-sm">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button variant="outline"
                            className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10 px-4 w-full sm:w-auto">
                        <PlusIcon className="w-4 h-4 opacity-60"/> Add Vendor
                    </Button>
                </div>
            </div>

            <div className="bg-background border rounded-md overflow-x-auto w-full">
                <Table className="w-full min-w-[700px] sm:min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} style={{minWidth: `${header.getSize()}px`}}
                                               className="h-9 sm:h-11 px-2 sm:px-4 text-xs sm:text-sm">
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <div
                                                className="flex items-center justify-between gap-2 cursor-pointer select-none"
                                                onClick={header.column.getToggleSortingHandler()}>
                                                <span
                                                    className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                {{
                                                    asc: <ChevronUpIcon size={16} className="w-4 h-4 opacity-60"/>,
                                                    desc: <ChevronDownIcon size={16} className="w-4 h-4 opacity-60"/>
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        ) : <span
                                            className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({length: 10}).map((_, i) => <TableRow key={i}>{columns.map((_, j) =>
                                <TableCell key={j} className="px-2 sm:px-4 py-2 sm:py-3">
                                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded"/>
                                </TableCell>)}</TableRow>) :
                            isError ? <TableRow><TableCell colSpan={columns.length}
                                                           className="h-24 text-center text-destructive px-4">
                                    <div className="flex flex-col items-center gap-2"><CircleAlertIcon size={20}
                                                                                                       className="opacity-80"/><span
                                        className="text-sm">Error loading vendors</span><span
                                        className="text-sm text-muted-foreground">{error?.message ?? "Try again later"}</span>
                                    </div>
                                </TableCell></TableRow> :
                                table.getRowModel().rows.length ? table.getRowModel().rows.map(row => <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() ? "selected" : undefined}>{row.getVisibleCells().map(cell =>
                                        <TableCell key={cell.id}
                                                   className="px-2 sm:px-4 py-2 sm:py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) :
                                    <TableRow><TableCell colSpan={columns.length}
                                                         className="h-24 text-center text-muted-foreground px-4">
                                        <div className="flex flex-col items-center gap-2"><span className="text-sm">No vendors found</span><span
                                            className="text-sm">Try adjusting your filters</span></div>
                                    </TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Label htmlFor={id} className="sr-only">Rows per page</Label>
                    <Select value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => table.setPageSize(Number(value))}>
                        <SelectTrigger id={id}
                                       className="h-9 sm:h-10 w-16 sm:w-20 text-xs sm:text-sm"><SelectValue/></SelectTrigger>
                        <SelectContent>{[5, 10, 25, 50].map(size => <SelectItem key={size} value={size.toString()}
                                                                                className="text-xs sm:text-sm">{size}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">rows per page</span>
                </div>
                <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                    <CustomPagination currentPage={currentPage} totalPages={totalPages}
                                      onPageChangeAction={handlePageChange}/>
                </div>
            </div>
        </div>
    )
}
