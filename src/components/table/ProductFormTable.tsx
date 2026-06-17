"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/ReusableTable";
import { Checkbox } from "@/components/ui/checkbox";
import { NoDataFound } from "@/lib/helper";
import { RowActions } from "@/lib/action-button";
import ActionModal from "@/components/modal/ConfirmModal";
import ProductFormModal from "@/components/modal/ProductFormModal";
import { useDeleteProductForm, useGetProductForms } from "@/hooks/useProduct";

export interface ProductFormUnitType {
  id: number;
  uuid: string;
  name: string;
}

export interface ProductFormPackageType {
  id: number;
  uuid: string;
  name: string;
  unit_types: ProductFormUnitType[];
}

export interface ProductForm {
  id: number;
  uuid: string;
  name: string;
  package_types: ProductFormPackageType[];
  created_at?: string;
  updated_at?: string;
}

const getAllUnits = (packageTypes: ProductFormPackageType[]) => {
  const seen = new Set<string>();
  const units: ProductFormUnitType[] = [];
  for (const pt of packageTypes) {
    for (const u of pt.unit_types) {
      if (!seen.has(u.name)) {
        seen.add(u.name);
        units.push(u);
      }
    }
  }
  return units;
};

export default function ProductFormTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductForm | null>(null);

  const { data, isLoading } = useGetProductForms({
    page: currentPage,
    per_page: pageSize,
    search: searchQuery,
  });

  const { mutate: deleteProductForm, isPending: isDeleting } =
    useDeleteProductForm();

  const tableData = useMemo(() => data?.data?.items ?? [], [data]);

  const handleEdit = useCallback((item: ProductForm) => {
    setSelectedItem(item);
    setFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: ProductForm) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedItem) return;
    deleteProductForm(selectedItem.uuid, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedItem(null);
      },
    });
  }, [selectedItem, deleteProductForm]);

  const handleAddNew = useCallback(() => {
    setSelectedItem(null);
    setFormModalOpen(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  // Columns
  const columns: ColumnDef<ProductForm>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Form Type",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-gray-900">
            {row.original.name}
          </p>
        ),
        size: 160,
      },
      {
        id: "package_types_with_units",
        header: "Package Types & Units",
        cell: ({ row }) => {
          const packageTypes = row.original.package_types;
          if (packageTypes.length === 0) {
            return <span className="text-xs text-gray-400">—</span>;
          }
          return (
            <div className="space-y-1.5 max-w-sm">
              {packageTypes.map((pt) => (
                <div key={pt.uuid} className="flex items-start gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium shrink-0 mt-0.5"
                  >
                    {pt.name}
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {pt.unit_types.length > 0 ? (
                      pt.unit_types.map((u) => (
                        <Badge
                          key={u.uuid}
                          variant="outline"
                          className="text-xs font-normal text-gray-500"
                        >
                          {u.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">no units</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        },
        size: 380,
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
          const date = row.original.created_at;
          return (
            <p className="text-sm text-gray-500">
              {date ? format(new Date(date), "MMM dd, yyyy • hh:mm a") : "—"}
            </p>
          );
        },
        size: 200,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <RowActions
            row={row}
            onEditAction={() => handleEdit(row.original)}
            onDeleteAction={() => handleDelete(row.original)}
          />
        ),
        size: 100,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleEdit, handleDelete],
  );

  return (
    <div className="space-y-6 w-full">
      <DataTable
        data={tableData}
        columns={columns}
        pagination={{
          page: currentPage,
          totalPages: data?.data?.total_page ?? 1,
          pageSize: pageSize,
          onPageChange: handlePageChange,
          dataCount: data?.data?.total_items ?? 0,
        }}
        loading={isLoading}
        noDataText={
          <NoDataFound
            title="No Product Forms Found"
            description="Start by adding your first product form type"
          />
        }
        searchPlaceholder="Search product forms..."
        enableSearch={true}
        onSearchAction={handleSearch}
        enableColumnVisibility={true}
        enableRowSelection={true}
        enableSorting={true}
        actionLabel="Add Product Form"
        onAddAction={handleAddNew}
      />

      <ProductFormModal
        open={formModalOpen}
        onOpenChange={(open) => {
          setFormModalOpen(open);
          if (!open) setSelectedItem(null);
        }}
        editItem={selectedItem}
      />

      <ActionModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Product Form"
        description={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
