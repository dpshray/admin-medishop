"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import productService from "@/service/product/product.service"
import {PaginatedResponse, ParamsType} from "@/types/types"
import { toast } from "sonner"

interface UseProductsOptions {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    staleTime?: number
}

export function useProducts(params: ParamsType = {}, options?: UseProductsOptions) {
    const {data, isLoading, isError} = useQuery<PaginatedResponse<any>>({
        queryKey: ["products", params],
        queryFn: async () => {
            const res = await productService.getAllProducts(params)
            console.log("Response from product Hook", res.items)
            return res
        },
        enabled: options?.enabled ?? true,
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
    })

    return {
        totalPages: data?.total_page ?? 0,
        products: data?.items ?? [],
        currentPage: data?.page ?? 1,
        totalItems: data?.total_items ?? 0,
        isLoading,
        isError,
    }
}

export const useDeleteProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({productUuid, imageUuid}: { productUuid: string; imageUuid: string }) => {
            await productService.deleteProductImage(productUuid, imageUuid)
        },
        onSuccess: () => {
            toast.success("Product image deleted successfully")
            queryClient.invalidateQueries({queryKey: ["products"]});
        },

        onError: () => {
            toast.error("Failed to delete product image")
        }
    })
}