'use client'

import {useQuery} from "@tanstack/react-query"
import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import userService from "@/service/user.service"
import {DataTable} from "@/components/table/ReusableTable"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {RowActions} from "@/lib/action-button"
import {PaginatedResponse, ParamsType} from "@/types/types"
import {AlertTriangle} from "lucide-react"
import {Checkbox} from "@/components/ui/checkbox"
import {useRouter} from "next/navigation"
import {StatusBadge} from "@/lib/helper";
import {STATUS_TYPE} from "@/types/enum";
import {CURRENCY_SYMBOL} from "@/config/app-constant";


interface UserTable {
    id: number
    uuid: string
    name: string
    email: string
    mobile_number: string
    status: boolean
    total_orders: number
    total_items_purchased: number
    total_purchase_amount: number
    image?: string
}

export default function UserTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState("")
    const router = useRouter()

    const {data, isLoading, isError, error, refetch, isFetching} = useQuery<PaginatedResponse<UserTable>, Error>({
        queryKey: ["users", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ParamsType = {page: currentPage, per_page: pageSize, search}
            return await userService.getAllUser(params)
        },
    })


    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }, [])


    const handleViewUser = useCallback(
        (uuid: string) => {
            router.push(`/admin/users/${uuid}`)
        },
        [router]
    )

    const handleRefresh = useCallback(async () => {
        await refetch()
    }, [refetch])

    const columns: ColumnDef<UserTable>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({table}) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all users"
                    />
                ),
                cell: ({row}) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={`Select user ${row.original.name}`}
                        className="mx-auto"
                    />
                ),
                size: 50,
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "name",
                header: "Name",
                cell: ({row}) => (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={row.original.image} alt={row.original.name}/>
                            <AvatarFallback>{row.original.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{row.original.name}</p>
                            <p className="text-sm text-gray-500 truncate">{row.original.email}</p>
                        </div>
                    </div>
                ),
                size: 250,
            },
            {
                accessorKey: "mobile_number",
                header: "Mobile Number",
                cell: ({row}) => <span className="text-gray-700">{row.original.mobile_number}</span>,
                size: 150,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({row}) => (

                    <StatusBadge status={row.original.status ? STATUS_TYPE.VERIFIED : STATUS_TYPE.UNVERIFIED}/>
                ),
                size: 100,
            },
            {
                accessorKey: "total_orders",
                header: "Orders",
                cell: ({row}) => <span className="font-medium">{row.original.total_orders}</span>,
                size: 100,
            },
            {
                accessorKey: "total_items_purchased",
                header: "Items Purchased",
                cell: ({row}) => <span className="text-gray-700">{row.original.total_items_purchased}</span>,
                size: 150,
            },
            {
                accessorKey: "total_purchase_amount",
                header: `Total Purchase (${CURRENCY_SYMBOL})`,
                cell: ({row}) => <span
                    className="font-medium text-green-600">{row.original.total_purchase_amount}</span>,
                size: 150,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({row}) => (
                    <RowActions
                        row={row}
                        className={'text-right'}
                        onViewAction={() => handleViewUser(row.original.uuid)}
                    />
                ),
                size: 100,
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [handleViewUser]
    )

    const noDataContent = useMemo(
        () => (
            <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first user.</p>

            </div>
        ),
        []
    )

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"/>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load users</h3>
                            <p className="text-red-700 mb-4">{error instanceof Error ? error.message : "An unexpected error occurred."}</p>
                            <div className="flex space-x-3">
                                <Button onClick={handleRefresh} variant="outline"
                                        className="border-red-300 text-red-800 hover:bg-red-100">
                                    Try Again
                                </Button>
                                <Button onClick={() => window.location.reload()} variant="ghost"
                                        className="text-red-800 hover:bg-red-100">
                                    Reload Page
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600">Manage your user accounts and activity</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <DataTable<UserTable, unknown>
                data={data?.items || []}
                columns={columns}
                loading={isLoading || isFetching}
                onSearchAction={handleSearch}

                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search users by name..."
                totalCount={data?.total_items}
                pagination={{
                    page: currentPage,
                    totalPages: data?.total_page || 1,
                    pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [5, 10, 25, 50, 100],
                    dataCount: data?.total_items || 0,
                }}
                noDataText={noDataContent}
            />


        </div>
    )
}
