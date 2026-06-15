import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import reportService from "@/service/report.service";
import { PageParams } from "@/config/app-constant";
import { toast } from "sonner";

export const useGetAdminSalesReport = (params?: PageParams) => {
  return useQuery({
    queryKey: ["admin-sales-report", params],
    queryFn: async () => {
      return reportService.getAdminSalesReports(params);
    },
  });
};

export const useGetProductsPerformaceReport = (params?: PageParams) => {
  return useQuery({
    queryKey: ["product-performance", params],
    queryFn: async () => {
      return reportService.getProductsPerformaceReport(params);
    },
  });
};

export const useGetVendorPerformanceReport = (params?: PageParams) => {
  return useQuery({
    queryKey: ["vendor-performance", params],
    queryFn: async () => {
      return reportService.getVendorPerformanceReport(params);
    },
  });
};

export const useGetCommissionPayout = (params?: PageParams) => {
  return useQuery({
    queryKey: ["commission-payout", params],
    queryFn: async () => {
      return reportService.getCommissionPayout(params);
    },
  });
};

export const useGetCommissionPayoutByVendorId = (
  id: string,
  params?: PageParams,
) => {
  return useQuery({
    queryKey: ["commission-payout-by-vendor-id", id, params],
    queryFn: async () => {
      return reportService.getCommissionPayoutByVendorId(id, params);
    },
  });
};

export const useUpdatePayoutStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      remarks,
    }: {
      id: string;
      status: string;
      remarks: string;
    }) => {
      return reportService.updatePayoutStatus(id, status, remarks);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["commission-payout"] });
      toast.success(
        res?.data?.message || "Commission payout updated successfully",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update commission payout",
      );
    },
  });
};

//vendor-side
export const useGetVendorCommissionPayout = (params?: PageParams) => {
  return useQuery({
    queryKey: ["vendor-commission-payout", params],
    queryFn: async () => {
      return reportService.getVendorCommissionPayout(params);
    },
  });
};

export const useRequestVendorCommissionPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return reportService.requestVendorCommissionPayout();
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-commission-payout"] });
      toast.success(
        res?.data?.message || "Vendor commission payout requested successfully",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to request vendor commission payout",
      );
    },
  });
};
