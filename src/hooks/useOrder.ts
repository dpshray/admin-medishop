import orderService from "@/service/order/order.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAssignNcm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({order_uuid, data}: { order_uuid: string; data: any }) => orderService.assignNcm(order_uuid, data),
        onSuccess: () => {
            toast.success("NCM assigned successfully.");
            queryClient.invalidateQueries({queryKey: ["order"]});
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Assignment failed.");
        },
    });
}

export function useAssignVendorNcm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({order_uuid, data}: { order_uuid: string; data: any }) => orderService.assignVendorNcm(order_uuid, data),
        onSuccess: () => {
            toast.success("NCM assigned successfully.");
            queryClient.invalidateQueries({queryKey: ["orderDetails"]});
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Assignment failed.");
        },
    });
}

export function useGetNcmBranch() {
    return useQuery({
        queryKey: ["ncm-branch"],
        queryFn: async () => {
            return await orderService.getNcmBranch();
        },
    });
}

export function useGetNcmAssignedOrders(orderId: number) {
    return useQuery({
        queryKey: ["ncm-assigned-orders", orderId],
        queryFn: () => orderService.getNcmAssignedOrders(orderId),
    });
}