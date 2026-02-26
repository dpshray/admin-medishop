"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/ReusableTable";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  QUERY_STALE_TIME,
} from "@/config/app-constant";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import notificationService from "@/service/notification.service";
import { NotificationModal } from "@/components/notification/NotificationModal";
import { Checkbox } from "@/components/ui/checkbox";

interface Notification {
  notification_uuid: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function NotificationTable() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-notifications", currentPage, search],
    queryFn: async () => {
      const res = await notificationService.getAllNotifications({
        page: currentPage,
        per_page: DEFAULT_PAGE_SIZE,
        search,
      });
      return {
        ...res,
        items: res.data.map(
          (item: any): Notification => ({
            notification_uuid: item.uuid,
            title: item.title,
            message: item.body,
            created_at: item.created_at,
            read: Boolean(item.read_at),
          }),
        ),
      };
    },
  });

  const columns: ColumnDef<Notification>[] = useMemo(
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
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select order ${row.original.title}`}
          />
        ),
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="font-semibold text-sm">{row.original.title}</div>
        ),
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-[400px]">
            {row.original.message}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.created_at
              ? format(new Date(row.original.created_at), "dd-MMM-yyyy, HH:mm")
              : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "read",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full",
              row.original.read
                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
            )}
          >
            {row.original.read ? "Read" : "Unread"}
          </span>
        ),
      },
    ],
    [],
  );

  const handleSendNotification = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

  const handleSearch = useCallback((value: string) => {
    startTransition(() => {
      setCurrentPage(DEFAULT_PAGE);
      setSearch(value);
    });
  }, []);

  const handleModalSubmit = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6 w-full px-2 md:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage and review system notifications
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load notifications. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full px-2 md:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage and review system notifications
          </p>
        </div>
      </div>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        loading={isLoading}
        enableSearch
        enableSorting
        onSearchAction={handleSearch}
        onAddAction={handleSendNotification}
        actionLabel="Send Notification"
        searchPlaceholder="Search by title or message..."
        totalCount={data?.total_items ?? 0}
        pagination={{
          page: currentPage,
          totalPages: data?.total_page ?? 1,
          onPageChange: handlePageChange,
          dataCount: data?.total_items ?? 0,
        }}
        noDataText="No notifications found. Try adjusting your search criteria."
      />

      <NotificationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmitAction={handleModalSubmit}
      />
    </div>
  );
}
