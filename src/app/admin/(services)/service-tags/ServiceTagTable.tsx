'use client'

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/config/app-constant";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/table/ReusableTable";
import { NoDataFound } from "@/lib/helper";
import ActionModal from "@/components/modal/ConfirmModal";

import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/lib/action-button";
import servicesTagService from "@/service/(tags)/services-tag.service";
import ServiceTagFormModal from "@/app/admin/(services)/service-tags/service-tag-modal";

interface ServiceTag {
    name: string;
    slug: string;
}

interface ServiceTagsResponse {
    items: ServiceTag[];
    page: number;
    total_page: number;
    total_items: number;
}

export default function AdminServiceTagTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ServiceTag | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPending, startTransition] = useTransition();

    const queryClient = useQueryClient();

    const { data, isLoading: isTableLoading, error } = useQuery<ServiceTagsResponse>({
        queryKey: ['serviceTags', currentPage, searchTerm],
        queryFn: async () => {
            const response = await servicesTagService.getAllServicesTags({
                page: currentPage,
                search: searchTerm
            });
            return response;
        },
        staleTime: QUERY_STALE_TIME,
        placeholderData: (previousData) => previousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: { name: string }) => servicesTagService.createServicesTag(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceTags'] });
            setIsFormModalOpen(false);
            setSelectedTag(null);
        },
        onError: (error) => {
            console.error('Failed to create tag:', error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ slug, data }: { slug: string; data: { name: string } }) =>
            servicesTagService.updateServicesTag(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceTags'] });
            setIsFormModalOpen(false);
            setSelectedTag(null);
        },
        onError: (error) => {
            console.error('Failed to update tag:', error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => servicesTagService.deleteServicesTag(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceTags'] });
            handleDeleteModalClose();
        },
        onError: (error) => {
            console.error('Failed to delete tag:', error);
        },
    });

    const handlePageChange = useCallback((page: number) => {
        startTransition(() => {
            setCurrentPage(page);
        });
    }, []);

    const handleSearch = useCallback((query: string) => {
        startTransition(() => {
            setSearchTerm(query);
            setCurrentPage(1);
        });
    }, []);

    const handleDeleteModalClose = useCallback(() => {
        setIsDeleteModalOpen(false);
        setSelectedTag(null);
    }, []);

    const handleFormModalClose = useCallback(() => {
        setIsFormModalOpen(false);
        setSelectedTag(null);
    }, []);

    const handleAddClick = useCallback(() => {
        setSelectedTag(null);
        setIsFormModalOpen(true);
    }, []);

    const handleEditClick = useCallback((tag: ServiceTag) => {
        setSelectedTag(tag);
        setIsFormModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback((tag: ServiceTag) => {
        setSelectedTag(tag);
        setIsDeleteModalOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (values: { name: string }) => {
        if (selectedTag) {
            await updateMutation.mutateAsync({
                slug: selectedTag.slug,
                data: values
            });
        } else {
            await createMutation.mutateAsync(values);
        }
    }, [selectedTag, createMutation, updateMutation]);

    const confirmDeleteTag = useCallback(async () => {
        if (!selectedTag) return;
        await deleteMutation.mutateAsync(selectedTag.slug);
    }, [selectedTag, deleteMutation]);

    const columns: ColumnDef<ServiceTag>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all tags on this page"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select tag ${row.original.name}`}
                />
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            header: "Slug",
            accessorKey: "slug",
            cell: ({ row }) => (
                <code className="text-xs bg-muted px-2 py-1 rounded">
                    {row.original.slug}
                </code>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEditClick(row.original)}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                />
            ),
            size: 80,
        }
    ], [handleEditClick, handleDeleteClick]);

    if (error) {
        return (
            <div className="w-full p-8 text-center">
                <p className="text-destructive" role="alert">
                    Failed to load service tags. Please try again.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Service Tags
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and organize all service tags
                    </p>
                </div>
            </header>

            <div className="w-full overflow-x-auto">
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isTableLoading || isPending}
                    onSearchAction={handleSearch}
                    enableRowSelection
                    enableSorting
                    enableSearch
                    enableColumnVisibility
                    searchPlaceholder="Search by tag name or slug..."
                    totalCount={data?.total_items ?? 0}
                    className="w-full"
                    tableClassName="min-w-full"
                    onAddAction={handleAddClick}
                    actionLabel="Add Service Tag"
                    pagination={{
                        page: currentPage,
                        totalPages: data?.total_page ?? 1,
                        onPageChange: handlePageChange,
                        dataCount: data?.total_items ?? 0,
                    }}
                    noDataText={
                        <NoDataFound
                            title="No tags found"
                            description={
                                searchTerm
                                    ? "No tags match your search. Try different keywords."
                                    : "Service tags will appear here once added."
                            }
                        />
                    }
                />
            </div>

            <ServiceTagFormModal
                open={isFormModalOpen}
                onCloseAction={handleFormModalClose}
                onSubmitAction={handleFormSubmit}
                initialData={selectedTag ? { name: selectedTag.name } : undefined}
                loading={createMutation.isPending || updateMutation.isPending}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleDeleteModalClose}
                title="Delete Tag"
                description={
                    selectedTag
                        ? `Are you sure you want to delete the tag "${selectedTag.name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this tag? This action cannot be undone."
                }
                confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete Tag"}
                onConfirm={confirmDeleteTag}
                loading={deleteMutation.isPending}
                confirmVariant="destructive"
            />
        </div>
    );
}