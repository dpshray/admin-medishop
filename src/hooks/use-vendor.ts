'use client'
import {useMemo} from "react"
import {useQuery} from "@tanstack/react-query"
import vendorService from "@/service/vendor.service"
import {QUERY_REFETCH_INTERVAL} from "@/config/app-constant"
import {ParamsType} from "@/types/types"

const useVendor = (params: ParamsType = {}) => {
    const {data, isLoading, isError} = useQuery({
        queryKey: ["vendors", params],
        queryFn: async () => {
            const queryParam: ParamsType = {
                page: params.page,
                per_page: params.per_page,
                search: params.search,
                verified_vendors: params.verified_vendors,
            }
            return await vendorService.getAllVendor(queryParam)
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchInterval: QUERY_REFETCH_INTERVAL,
    })

    const vendors = useMemo(() => data?.items, [data?.items])

    return {
        vendors,
        isLoading,
        isError,
        currentPage: data?.page,
        totalPages: data?.total_page,
        totalItems: data?.total_items,
    }
}

export default useVendor
