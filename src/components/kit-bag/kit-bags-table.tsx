'use client'

import {useCallback, useMemo, useState, useTransition} from "react"
import {useMutation, useQuery} from "@tanstack/react-query"
import {DataTable} from "@/components/table/ReusableTable"
import kitBagService from "@/service/kit-bag.service"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {NoDataFound} from "@/lib/helper"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import {RowActions} from "@/lib/action-button"
import {DEFAULT_PAGE_SIZE} from "@/config/app-constant"
import {Package2} from "lucide-react"
import TableHeading from "@/components/table/table-headers"
import {PaginatedResponse, ParamsType} from "@/types/types"
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export interface Kitbag {
    kitbag_uuid: string
    username: string
    created_at: string
    no_of_kitbag_items: number
    email: string
}

export default function KitBagsTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [selectedKitbag, setSelectedKitbag] = useState<Kitbag | null>(null)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const {data, isLoading, isError, error, refetch} = useQuery<PaginatedResponse<Kitbag>, Error>({
        queryKey: ["kitbags", currentPage, searchQuery],
        queryFn: async () => {
            const params: ParamsType = {page: currentPage, per_page: DEFAULT_PAGE_SIZE, search: searchQuery}
            const res = await kitBagService.getAllKitBags(params)
            setTotalPages(res?.total_page || 1)
            setTotalItems(res?.total_items || 0)
            return res
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })


    const kitbags = useMemo(() => data?.items || [], [data])

    const deleteMutation = useMutation({
        mutationFn: (uuid: string) => kitBagService.deleteKitBag(uuid).then((res: any) => {
            toast.success(res?.message || "Kitbag deleted successfully")
            setDeleteModalOpen(false)
            setSelectedKitbag(null)
            refetch()
        }).catch((error: any) => {
            toast.error(error?.message || "Failed to delete kitbag")
        })
    })

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const handleDeleteKitbag = useCallback((kitbag: Kitbag) => {
        setSelectedKitbag(kitbag)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteKitbag = useCallback(() => {
        if (selectedKitbag) deleteMutation.mutate(selectedKitbag.kitbag_uuid)
    }, [selectedKitbag, deleteMutation])

    const columns: ColumnDef<Kitbag>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all kitbags"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select kitbag ${row.original.username}`}
                    className={cn('data-[state=checked]:bg-primaryColor data-[state=checked]:text-primary-foreground')}
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "username",
            header: "Username",
            size: 200,
            cell: ({row}) => <div className={'flex items-center gap-2'}>
                <Avatar
                    className="w-10 h-10">
                    <AvatarImage src={row.original.email}/>
                    <AvatarFallback>{row.original.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="">
                    <div className="font-medium text-gray-900 capitalize">{row.original.username}</div>
                    <div className="text-sm text-gray-500">{row.original.email}</div>
                </div>
            </div>
        },
        {
            accessorKey: "no_of_kitbag_items",
            header: "Items Count",
            size: 120,
            cell: ({row}) => <span>
                {row.original.no_of_kitbag_items}
            </span>,
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            size: 150,
            cell: ({row}) => <div>{row.original.created_at}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            size: 100,
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeleteKitbag(row.original)}
                    onViewAction={() => {
                        startTransition(() => {
                            router.push(`/admin/kit-bags/${row.original.kitbag_uuid}`);
                        })
                    }}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleDeleteKitbag, router])

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"/>
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Failed to load kitbags</h3>
                        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <TableHeading
                title="Kitbag Management"
                description="Manage your kitbags"
                icon={Package2}
            />

            <DataTable<Kitbag, any>
                data={kitbags}
                columns={columns}
                loading={isLoading}
                pagination={{
                    page: currentPage,
                    totalPages,
                    onPageChange: handlePageChange,
                    dataCount: totalItems,
                }}
                onSearchAction={handleSearch}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search kitbags by username..."
                totalCount={totalItems}
                noDataText={<NoDataFound/>}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Kitbag"
                description={selectedKitbag ? `Are you sure you want to delete "${selectedKitbag.username}"? This action cannot be undone.` : "Are you sure you want to delete this kitbag?"}
                confirmLabel="Delete Kitbag"
                onConfirm={confirmDeleteKitbag}
                loading={deleteMutation.isPending}
            />
        </div>
    )
}
