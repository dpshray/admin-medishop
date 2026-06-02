import { useQuery } from "@tanstack/react-query";
import dashboardService from "@/service/dashboard.service";

export const useGetDashboardTotals = () => {
  return useQuery({
    queryKey: ["dashboard-totals"],
    queryFn: async () => await dashboardService.getDashboardTotals(),
  });
};

export const useGetUserTotals = () => {
  return useQuery({
    queryKey: ["user-totals"],
    queryFn: async () => await dashboardService.getUserTotals(),
  });
};

export const useGetVendorTotals = () => {
  return useQuery({
    queryKey: ["vendor-totals"],
    queryFn: async () => await dashboardService.getVendorTotals(),
  });
};

export const useGetBrandTotals = () => {
  return useQuery({
    queryKey: ["brand-totals"],
    queryFn: async () => await dashboardService.getBrandTotals(),
  });
};

export const useGetProductTotals = () => {
  return useQuery({
    queryKey: ["product-totals"],
    queryFn: async () => await dashboardService.getProductTotals(),
  });
};

export const useGetPackageTotals = () => {
  return useQuery({
    queryKey: ["package-totals"],
    queryFn: async () => await dashboardService.getPackageTotals(),
  });
};

export const useGetOrderTotals = () => {
  return useQuery({
    queryKey: ["order-totals"],
    queryFn: async () => await dashboardService.getOrderTotals(),
  });
};

export const useGetProductRequestTotals = () => {
  return useQuery({
    queryKey: ["product-request-totals"],
    queryFn: async () => await dashboardService.getProductRequestTotals(),
  });
};

export const useGetServiceBookingTotals = () => {
  return useQuery({
    queryKey: ["service-booking-totals"],
    queryFn: async () => await dashboardService.getServiceBookingTotals(),
  });
};
