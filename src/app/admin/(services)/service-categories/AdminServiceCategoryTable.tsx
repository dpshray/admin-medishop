"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import serviceCategories from "@/service/(category)/service-categories.service";
import { QUERY_STALE_TIME } from "@/config/app-constant";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/table/ReusableTable";
import { NoDataFound } from "@/lib/helper";
import ActionModal from "@/components/modal/ConfirmModal";

import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/lib/action-button";
import ServiceCategoryFormModal from "@/app/admin/(services)/service-categories/service-category-modal";

interface AdminServiceCategory {
  name: string;
  slug: string;
}

interface ServiceCategoriesResponse {
  items: AdminServiceCategory[];
  page: number;
  total_page: number;
  total_items: number;
}

export default function AdminServiceCategoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  const {
    data,
    isLoading: isTableLoading,
    error,
  } = useQuery<ServiceCategoriesResponse>({
    queryKey: ["serviceCategories", currentPage, searchTerm],
    queryFn: async () => {
      const response = await serviceCategories.getAllCategories({
        page: currentPage,
        search: searchTerm,
      });
      return response;
    },
    staleTime: QUERY_STALE_TIME,
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) =>
      serviceCategories.createServiceCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceCategories"] });
      setIsFormModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: { name: string } }) =>
      serviceCategories.updateServiceCategory(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceCategories"] });
      setIsFormModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => serviceCategories.deleteServiceCategory(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceCategories"] });
      handleDeleteModalClose();
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
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
    setSelectedCategory(null);
  }, []);

  const handleFormModalClose = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedCategory(null);
  }, []);

  const handleAddClick = useCallback(() => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditClick = useCallback((category: AdminServiceCategory) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((category: AdminServiceCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: { name: string }) => {
      if (selectedCategory) {
        await updateMutation.mutateAsync({
          slug: selectedCategory.slug,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
    },
    [selectedCategory, createMutation, updateMutation],
  );

  const confirmDeleteCategory = useCallback(async () => {
    if (!selectedCategory) return;
    await deleteMutation.mutateAsync(selectedCategory.slug);
  }, [selectedCategory, deleteMutation]);

  const columns: ColumnDef<AdminServiceCategory>[] = useMemo(
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
            aria-label="Select all categories on this page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select category ${row.original.name}`}
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
      },
    ],
    [handleEditClick, handleDeleteClick],
  );

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-destructive" role="alert">
          Failed to load service categories. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="w-full overflow-x-auto  ">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isTableLoading || isPending}
          onSearchAction={handleSearch}
          enableRowSelection
          enableSorting
          enableSearch
          enableColumnVisibility
          searchPlaceholder="Search by category name or slug..."
          totalCount={data?.total_items ?? 0}
          className="w-full"
          tableClassName="min-w-full"
          onAddAction={handleAddClick}
          actionLabel="Add Category"
          pagination={{
            page: currentPage,
            totalPages: data?.total_page ?? 1,
            onPageChange: handlePageChange,
            dataCount: data?.total_items ?? 0,
          }}
          noDataText={
            <NoDataFound
              title="No categories found"
              description={
                searchTerm
                  ? "No categories match your search. Try different keywords."
                  : "Service categories will appear here once added."
              }
            />
          }
        />
      </div>

      <ServiceCategoryFormModal
        open={isFormModalOpen}
        onCloseAction={handleFormModalClose}
        onSubmitAction={handleFormSubmit}
        initialData={
          selectedCategory ? { name: selectedCategory.name } : undefined
        }
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={handleDeleteModalClose}
        title="Delete Category"
        description={
          selectedCategory
            ? `Are you sure you want to delete the category "${selectedCategory.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this category? This action cannot be undone."
        }
        confirmLabel={
          deleteMutation.isPending ? "Deleting..." : "Delete Category"
        }
        onConfirm={confirmDeleteCategory}
        loading={deleteMutation.isPending}
        confirmVariant="destructive"
      />
    </div>
  );
}
