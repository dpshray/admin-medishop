"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/table/ReusableTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import categoriesService from "@/service/(category)/categories.service";
import { RowActions } from "@/lib/action-button";
import ActionModal from "@/components/modal/ConfirmModal";
import { toast } from "sonner";
import { CategoryFormModal } from "@/components/categories/CategoryFromModal";
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage";
import { ParamsType } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface Category {
  id: number;
  slug: string;
  name: string;
  image: string;
  menu_order?: number;
  discount_percent?: number;
}

interface CategoryResponse {
  items: Category[];
  total_page: number;
  total_items?: number;
}

type ModalMode = "create" | "edit" | null;

export default function CategoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<
    CategoryResponse,
    Error
  >({
    queryKey: ["admin-categories", currentPage, search],
    queryFn: async () => {
      const params: ParamsType = { page: currentPage, search: search };
      const response = await categoriesService.getAllCategories(params);
      setTotalPages(response.total_page);
      setTotalItems(response.total_items || 0);
      return response;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => data?.items || [], [data?.items]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesService.deleteCategory(id),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Category deleted successfully");
      setDeleteModalOpen(false);
      setSelectedCategory(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete category",
      );
    },
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleAddCategory = useCallback(() => {
    setSelectedCategory(null);
    setModalMode("create");
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    setModalMode("edit");
  }, []);

  const handleDeleteCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  }, []);

  const confirmDeleteCategory = useCallback(() => {
    if (!selectedCategory) return;
    deleteMutation.mutate(selectedCategory.id);
  }, [selectedCategory, deleteMutation]);

  const handleFormSubmit = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleCloseFormModal = useCallback(() => {
    setModalMode(null);
    setSelectedCategory(null);
  }, []);

  const columns: ColumnDef<Category>[] = useMemo(
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
            aria-label="Select all categories"
            className="mx-auto"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select category ${row.original.name}`}
            className="data-[state=checked]:bg-primaryColor data-[state=checked]:text-primary-foreground mx-auto"
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "image",
        header: "Image",
        size: 120,
        cell: ({ row }) => (
          <GlobalTableHoverImage
            src={row.original.image}
            alt={`${row.original.name} category image`}
            size={32}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Category Name",
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">
              {row.original.name}
            </span>
            <Badge
              variant="outline"
              className="w-fit text-xs text-muted-foreground"
            >
              {row.original.slug}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "menu_order",
        header: "Menu Order",
        size: 120,
        cell: ({ row }) => (
          <span className="text-sm text-foreground font-medium">
            {row.original.menu_order ?? "0"}
          </span>
        ),
      },
      {
        accessorKey: "discount_percent",
        header: "Discount (%)",
        size: 150,
        cell: ({ row }) => (
          <span className="text-sm text-foreground font-medium">
            {row.original.discount_percent ?? "0"}%
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => (
          <RowActions
            row={row}
            onEditAction={() => handleEditCategory(row.original)}
            onDeleteAction={() => handleDeleteCategory(row.original)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleEditCategory, handleDeleteCategory],
  );

  const formModalInitialData = useMemo(() => {
    if (!selectedCategory) return undefined;

    return {
      id: selectedCategory.id,
      slug: selectedCategory.slug,
      name: selectedCategory.name,
      image: selectedCategory.image,
      menu_order: selectedCategory.menu_order ?? 0,
      discount_percent: selectedCategory.discount_percent ?? 0,
    };
  }, [selectedCategory]);

  const deleteModalDescription = useMemo(
    () =>
      selectedCategory
        ? `Are you sure you want to delete "${selectedCategory.name}"? This action cannot be undone.`
        : "Are you sure you want to delete this category?",
    [selectedCategory],
  );

  if (isError) {
    return (
      <div className="p-6" role="alert">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertCircle
            className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-sm font-semibold text-destructive">
              Failed to load categories
            </h3>
            <p className="mt-1 text-sm text-destructive/90">
              {error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable<Category, any>
        data={categories}
        columns={columns}
        loading={isLoading}
        onAddAction={handleAddCategory}
        onSearchAction={handleSearch}
        actionLabel="Add Category"
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: handlePageChange,
          dataCount: totalItems,
        }}
        enableRowSelection
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search categories by name..."
        noDataText={
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-foreground">
              No categories found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search criteria."
                : "Get started by creating your first category."}
            </p>
          </div>
        }
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Category"
        description={deleteModalDescription}
        confirmLabel="Delete Category"
        confirmVariant="destructive"
        onConfirm={confirmDeleteCategory}
        loading={deleteMutation.isPending}
      />

      {modalMode && (
        <CategoryFormModal
          mode={modalMode}
          open={true}
          onCloseAction={handleCloseFormModal}
          onSubmitAction={handleFormSubmit}
          slug={selectedCategory?.slug}
          isLoading={false}
          initialData={formModalInitialData}
        />
      )}
    </div>
  );
}
