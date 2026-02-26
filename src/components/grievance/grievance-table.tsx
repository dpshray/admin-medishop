"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import grievanceService from "@/service/grievance.service";
import { DataTable } from "@/components/table/ReusableTable";
import ActionModal from "@/components/modal/ConfirmModal";
import { Checkbox } from "@/components/ui/checkbox";
import { RowActions } from "@/lib/action-button";
import { StatusBadge } from "@/lib/helper";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GrievanceModal } from "@/components/grievance/grievance-modal";

export interface Grievance {
  uuid: string;
  status: "PENDING" | "UNDER_PROCESS" | "RESOLVED" | "REJECTED";
  subject: string;
  name: string;
  email: string;
  submitted_at: string;
}

export default function GrievanceTable() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGrievanceSlug, setSelectedGrievanceSlug] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error } = useQuery({
    queryKey: ["grievances", currentPage, search],
    queryFn: async () => {
      const params = { page: currentPage, search };
      return grievanceService.getAllGrievance(params);
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleSearch = useCallback((value: string) => {
    startTransition(() => {
      setCurrentPage(1);
      setSearch(value);
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

  const handleDeleteAction = useCallback((row: Grievance) => {
    setSelectedGrievance(row);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditAction = useCallback((row: Grievance) => {
    setSelectedGrievanceSlug(row.uuid);
    setIsEditModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedGrievance(null);
  }, []);

  const confirmDeleteGrievance = useCallback(async () => {
    if (!selectedGrievance) return;
    try {
      await grievanceService.deleteGrievance(selectedGrievance.uuid);
      await queryClient.invalidateQueries({ queryKey: ["grievances"] });
      toast.success("Grievance deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedGrievance(null);
    } catch (error) {
      toast.error("Failed to delete grievance. Please try again.");
      console.error("Delete error:", error);
    }
  }, [selectedGrievance, queryClient]);

  const columns = useMemo<ColumnDef<Grievance>[]>(
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
            aria-label="Select all grievances"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select grievance ${row.original.subject}`}
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="font-medium text-sm">{row.original.subject}</div>
        ),
      },
      {
        accessorKey: "submitted_by",
        header: "Submitted By",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.name}{" "}
            <a href={`mailto:${row.original.email}`} className="underline">
              ({row.original.email})
            </a>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "submitted_at",
        header: "Submitted At",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.submitted_at}
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <RowActions
            row={row}
            onDeleteAction={() => handleDeleteAction(row.original)}
            onEditAction={() => handleEditAction(row.original)}
          />
        ),
        size: 80,
      },
    ],
    [handleDeleteAction, handleEditAction],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load grievances. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <DataTable
        data={data?.items ?? []}
        columns={columns}
        loading={isPending}
        onSearchAction={handleSearch}
        enableRowSelection
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search by subject, submitter..."
        totalCount={data?.total_items ?? 0}
        pagination={{
          page: currentPage,
          totalPages: data?.total_page ?? 1,
          onPageChange: handlePageChange,
          dataCount: data?.total_items ?? 0,
        }}
        noDataText="No grievances found. Try adjusting your search criteria."
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={handleModalClose}
        title="Delete Grievance"
        description={`Are you sure you want to delete the grievance "${selectedGrievance?.subject}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteGrievance}
        confirmVariant="destructive"
      />

      {selectedGrievanceSlug && (
        <GrievanceModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          slug={selectedGrievanceSlug}
          onSubmitAction={() =>
            queryClient.invalidateQueries({ queryKey: ["grievances"] })
          }
        />
      )}
    </div>
  );
}
