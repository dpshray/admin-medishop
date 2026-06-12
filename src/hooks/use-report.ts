import { useQuery } from "@tanstack/react-query";
import reportService from "@/service/report.service";
import { PageParams } from "@/config/app-constant";

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
