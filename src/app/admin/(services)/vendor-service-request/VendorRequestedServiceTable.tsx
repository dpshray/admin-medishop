'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query";
import serviceProvider from "@/service/serivce-provider/service-provider.service";
import { ParamsType } from "@/types/types";
import { useMemo, useState, useCallback } from "react";
import { DEFAULT_PAGE_SIZE } from "@/config/app-constant";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/table/ReusableTable";
import { FormatCurrency, NoDataFound, StatusBadge } from "@/lib/helper";
import ActionModal from "@/components/modal/ConfirmModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { STATUS_TYPE } from "@/types/enum";

interface VendorRequestServiceItem {
    is_approved_by_admin: boolean | null
    vendor_service_status: boolean
    vendor_name: string
    vendor_uuid: string
    service_name: string
    service_slug: string
    vendor_service_price: number
}

type ActionType = 'approve' | 'reject';

export default function VendorRequestedServiceTable() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItem, setSelectedItem] = useState<VendorRequestServiceItem | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<ActionType>('approve');
    const [isProcessing, setIsProcessing] = useState(false);

    const { data, isPending, error } = useQuery({
        queryKey: ['vendor-service-request', currentPage],
        queryFn: async () => {
            const params: ParamsType = {
                page: currentPage,
                per_page: DEFAULT_PAGE_SIZE,
            };
            const response = await serviceProvider.getAllRequestedServiceByVendor(params);
            setCurrentPage(response.page);
            setTotalPages(response.total_pages);
            return response.data ?? [];
        },
        staleTime: 30000,
        refetchOnWindowFocus: false
    });

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleActionClick = useCallback((item: VendorRequestServiceItem, type: ActionType) => {
        setSelectedItem(item);
        setActionType(type);
        setIsActionModalOpen(true);
    }, []);

    const handleActionConfirm = useCallback(async () => {
        if (!selectedItem || isProcessing) return;

        setIsProcessing(true);
        try {
            const response = await serviceProvider.acceptOrRejectServiceRequest(
                selectedItem.service_slug,
                selectedItem.vendor_uuid,
            );

            toast.success(response.message || `Service request ${actionType}d successfully`);

            await queryClient.invalidateQueries({
                queryKey: ['vendor-service-request']
            });

            setIsActionModalOpen(false);
            setSelectedItem(null);
        } catch (err) {
            toast.error(`Failed to ${actionType} service request`);
        } finally {
            setIsProcessing(false);
        }
    }, [selectedItem, actionType, queryClient, isProcessing]);

    const handleModalClose = useCallback(() => {
        if (!isProcessing) {
            setIsActionModalOpen(false);
            setSelectedItem(null);
        }
    }, [isProcessing]);

    const columns: ColumnDef<VendorRequestServiceItem>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all rows"
                    className="mx-auto"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select ${row.original.service_name}`}
                    className="mx-auto"
                />
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false
        },
        {
            header: "Vendor",
            accessorKey: "vendor_name",
            cell: ({ row }) => (
                <div className="font-medium text-foreground">{row.original.vendor_name}</div>
            )
        },
        {
            header: "Service Details",
            accessorKey: "service_name",
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium text-foreground">{row.original.service_name}</div>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {row.original.service_slug}
                    </code>
                </div>
            )
        },
        {
            header: "Price",
            accessorKey: "vendor_service_price",
            cell: ({ row }) => (
                <div className="font-semibold text-foreground">
                    {FormatCurrency(row.original.vendor_service_price)}
                </div>
            )
        },
        {
            id: "actions",
            header: "Status",
            accessorKey: "is_approved_by_admin",
            cell: ({ row }) => {
                const isApproved = row.original.is_approved_by_admin;

                if (isApproved === null) {
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleActionClick(row.original, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                                disabled={isProcessing}
                                aria-label={`Approve ${row.original.service_name}`}
                            >
                                <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                                Approve
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleActionClick(row.original, 'reject')}
                                disabled={isProcessing}
                                aria-label={`Reject ${row.original.service_name}`}
                                className="transition-colors"
                            >
                                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                                Reject
                            </Button>
                        </div>
                    );
                }

                return (
                    <StatusBadge status={isApproved ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.REJECTED} />
                );
            },
            size: 180
        }
    ], [handleActionClick, isProcessing]);

    if (error) {
        return (
            <div className="w-full p-8 text-center" role="alert">
                <p className="text-destructive font-medium">Failed to load vendor service requests.</p>
                <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Vendor Requested Services
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review and manage service requests from vendors
                    </p>
                </div>
            </header>

            <div className="w-full overflow-x-auto">
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isPending}
                    enableRowSelection
                    enableSorting
                    totalCount={data?.total_items ?? 0}
                    className="w-full"
                    tableClassName="min-w-full"
                    pagination={{
                        page: currentPage,
                        totalPages: totalPages,
                        onPageChange: handlePageChange,
                        dataCount: data?.total_items ?? 0
                    }}
                    noDataText={
                        <NoDataFound
                            title="No service requests found"
                            description="Vendor service requests will appear here once submitted."
                        />
                    }
                />
            </div>

            <ActionModal
                open={isActionModalOpen}
                setOpen={handleModalClose}
                title={actionType === 'approve' ? 'Approve Service Request' : 'Reject Service Request'}
                description={
                    selectedItem
                        ? `Are you sure you want to ${actionType} the service request for "${selectedItem.service_name}" from ${selectedItem.vendor_name}? This action cannot be undone.`
                        : `Are you sure you want to ${actionType} this service request?`
                }
                confirmLabel={actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                onConfirm={handleActionConfirm}
                confirmVariant={actionType === 'approve' ? 'default' : 'destructive'}
                loading={isProcessing}
            />
        </div>
    );
}