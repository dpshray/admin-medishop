"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {useMemo, useState} from "react"
import {DataTable} from "@/components/table/ReusableTable"
import {useQuery} from "@tanstack/react-query"
import vendorService from "@/service/vendor.service"
import {RowActions} from "@/lib/helper"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export interface Vendor {
    user_uuid: string
    vendor_uuid: string
    verified: boolean
    name: string
    email: string
    mobile_number: string
    store_name: string
}

const columns: ColumnDef<Vendor>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                className="mx-auto"
                aria-label="Select all rows"
            />
        ),
        cell: ({ row }) => (
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
        enableHiding: false,
        cell: ({ row }) => {
            const name = row.getValue("name") as string
            const email = row.original.email

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={'https://via.placeholder.com/150'} alt={name} />
                        <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-xs sm:text-sm">{name}</span>
                        <span className="text-muted-foreground text-xs truncate max-w-[140px]">
              {email}
            </span>
                    </div>
                </div>
            )
        },
    },
    {
        header: "Vendor UUID",
        accessorKey: "vendor_uuid",
        cell: ({ row }) => (
            <div className="text-xs sm:text-sm font-mono truncate max-w-[160px]">
                {row.getValue("vendor_uuid")}
            </div>
        ),
    },
    {
        header: "User UUID",
        accessorKey: "user_uuid",
        cell: ({ row }) => (
            <div className="text-xs sm:text-sm font-mono truncate max-w-[160px]">
                {row.getValue("user_uuid")}
            </div>
        ),
    },
    {
        header: "Verified",
        accessorKey: "verified",
        cell: ({ row }) => {
            const verified = row.getValue("verified") as boolean
            return (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                        verified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
          {verified ? "Yes" : "No"}
        </span>
            )
        },
    },
    {
        header: "Phone",
        accessorKey: "mobile_number",
        cell: ({ row }) => (
            <div className="text-xs sm:text-sm">{row.getValue("mobile_number")}</div>
        ),
    },
    {
        header: "Store",
        accessorKey: "store_name",
        cell: ({ row }) => (
            <div className="text-xs sm:text-sm truncate max-w-[160px]">
                {row.getValue("store_name")}
            </div>
        ),
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowActions row={row} />,
        size: 50,
        enableHiding: false,
    },
]

export default function VendorTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)

    const {data: vendors, isLoading} = useQuery({
        queryKey: ["admin-vendor", currentPage, pageSize],
        queryFn: () =>
            vendorService.getAllVendor({page: currentPage, per_page: pageSize})
                .then((res: any) => {
                    console.log(' Res from vendoer', res)
                    setTotalPages(res?.total_page)
                    setCurrentPage(res?.page)
                    return res
                }),

    })

    const vendorData = useMemo(() => vendors?.items ?? [], [vendors])
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const handleAddVendor = () => {
        alert("Add new vendor")
    }

    const handleDeleteVendors = (rows: Vendor[]) => {
        alert(`Deleted ${rows.length} vendors`)
    }

    return (
        <div className="p-4">
            <DataTable<Vendor, any>
                data={vendorData}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddVendor}
                onDeleteAction={handleDeleteVendors}
                pagination={{
                    page: currentPage,
                    totalPages: totalPages,
                    pageSize: pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [5, 10, 25, 50],
                }}
                totalCount={vendors?.total_items ?? 0}
                searchColumn="name"
                searchPlaceholder="Search vendors..."
                enableSearch={true}
                enableColumnVisibility={true}
                enableRowSelection={true}
                enableSorting={true}
            />
        </div>
    )
}