"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  QUERY_STALE_TIME,
} from "@/config/app-constant";
import { useQuery } from "@tanstack/react-query";
import { ParamsType } from "@/types/types";
import bannerService from "@/service/banner.service";
import { DataTable } from "@/components/table/ReusableTable";
import ActionModal from "@/components/modal/ConfirmModal";

import { ColumnDef } from "@tanstack/react-table";
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage";
import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BannerFormModal } from "@/components/modal/banner-modal-form";
import { GlobalStatusToggle, RowActions } from "@/lib/action-button";

type BannerType = {
  uuid: string;
  display_status: boolean;
  order: number;
  title: string | null;
  url: string | null;
  image: string;
};

export default function BannerTable() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["banners", currentPage, pageSize, search],
    queryFn: async () => {
      const params: ParamsType = {
        page: currentPage,
        per_page: pageSize,
        search: search,
      };
      const response = await bannerService.getAllBanners(params);
      return {
        items: response.data?.items || [],
        total_items: response.data.total_items || 0,
        total_page: response.data.total_page || 1,
        page: response.data.page || currentPage,
      };
    },
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedBanner(null);
  }, []);

  const confirmDeleteBanner = useCallback(async () => {
    if (!selectedBanner) return;
    setIsDeleting(true);
    try {
      const response = await bannerService.deleteBanner(selectedBanner.uuid);
      toast.success(response?.message || "Banner deleted successfully");
      await refetch();
    } catch (error) {
      console.error("Failed to delete banner:", error);
      toast.error("Failed to delete banner");
    } finally {
      setIsDeleting(false);
      handleDeleteModalClose();
    }
  }, [selectedBanner, refetch, handleDeleteModalClose]);

  const handleAddBanner = useCallback(() => {
    setSelectedBanner(null);
    setIsBannerModalOpen(true);
  }, []);

  const handleEdit = useCallback((banner: BannerType) => {
    setSelectedBanner(banner);
    setIsBannerModalOpen(true);
  }, []);

  const handleDelete = useCallback((banner: BannerType) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  }, []);

  const handleStatusToggle = useCallback(
    async (banner: BannerType, newStatus: boolean) => {
      try {
        await bannerService.toggleBannerStatus(banner.uuid);
        toast.success(
          `Banner ${newStatus ? "activated" : "deactivated"} successfully`,
        );
        await refetch();
      } catch (error) {
        toast.error("Failed to update banner status");
        throw error;
      }
    },
    [refetch],
  );

  const handleBannerSuccess = useCallback(async () => {
    setCurrentPage(1);
    await refetch();
  }, [refetch]);

  const columns: ColumnDef<BannerType>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all banners on this page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select ${row.original.title || "banner"}`}
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "image",
        header: "Image",
        size: 80,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-start justify-start">
            <GlobalTableHoverImage
              src={row.original.image}
              alt={row.original.title || "Banner image"}
            />
          </div>
        ),
      },
      {
        accessorKey: "order",
        header: "Order",
        size: 80,
        cell: ({ row }) => (
          <div className="flex items-center">
            <Badge variant="outline" className="font-mono">
              #{row.original.order}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-sm">
              {row.original.title || "Untitled Banner"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "display_status",
        header: "Status",
        size: 150,
        cell: ({ row }) => (
          <GlobalStatusToggle
            item={row.original}
            idKey="uuid"
            statusKey="display_status"
            onToggleAction={handleStatusToggle}
            activeLabel="Active"
            inactiveLabel="Inactive"
          />
        ),
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) =>
          row.original.url ? (
            <div className="flex items-center gap-2 max-w-md">
              <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={row.original.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate"
              >
                {row.original.url}
              </a>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No URL</span>
          ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            row={row}
            onDeleteAction={() => handleDelete(row.original)}
            onEditAction={() => handleEdit(row.original)}
          />
        ),
      },
    ],
    [handleDelete, handleEdit, handleStatusToggle],
  );

  return (
    <div className="space-y-6">
      <DataTable
        data={data?.items ?? []}
        columns={columns}
        loading={isLoading || isFetching}
        onSearchAction={handleSearch}
        onAddAction={handleAddBanner}
        actionLabel="Add New Banner"
        enableRowSelection
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search banners by title or URL..."
        totalCount={data?.total_items ?? 0}
        pagination={{
          page: currentPage,
          totalPages: data?.total_page ?? 1,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [...PAGE_SIZE_OPTIONS],
          dataCount: data?.total_items ?? 0,
        }}
        noDataText="No banners found. Create your first banner to get started."
      />

      <BannerFormModal
        open={isBannerModalOpen}
        onOpenChange={setIsBannerModalOpen}
        banner={selectedBanner}
        onSuccess={handleBannerSuccess}
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={handleDeleteModalClose}
        title="Delete Banner"
        description={
          selectedBanner
            ? `Are you sure you want to delete "${selectedBanner.title || "this banner"}"? This action cannot be undone and will remove all associated data.`
            : "Are you sure you want to delete this banner?"
        }
        confirmLabel={isDeleting ? "Deleting..." : "Delete Banner"}
        onConfirm={confirmDeleteBanner}
        loading={isDeleting}
        confirmVariant="destructive"
      />
    </div>
  );
}
