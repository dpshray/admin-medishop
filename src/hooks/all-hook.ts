import {useQuery} from "@tanstack/react-query"
import tagService from "@/service/(tags)/tag.service"

import {PaginatedResponse, ParamsType} from "@/types/types"
import categoriesService from "@/service/(category)/categories.service";
import brandService from "@/service/brand.service";
import productService from "@/service/product/product.service";
import genericNameService from "@/service/generic-name.service";

export interface Tag {
    id: number
    name: string
    slug: string
}

export interface ProductUnit {
    name: string
}

export interface Category {
    id: number
    name: string
    slug: string
}

export interface Brand {
    id: number
    name: string
}


const useTags = () => {
    const query = useQuery<PaginatedResponse<Tag>, Error>({
        queryKey: ["tags"],
        queryFn: async () => {
            return await tagService.getAllTags()
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })

    const tags = query.data?.items ?? []
    const totalPages = query.data?.total_page ?? 1
    const totalItems = query.data?.total_items ?? 0
    const currentPage = query.data?.page ?? 1

    return {
        ...query,
        tags,
        totalPages,
        totalItems,
        currentPage,
    }
}

const useCategories = () => {
    const query = useQuery<PaginatedResponse<Category>, Error>({
        queryKey: ["categories"],
        queryFn: async () => {
            return await categoriesService.getAllCategories()
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })

    const categories = query.data?.items ?? []
    const totalPages = query.data?.total_page ?? 1
    const totalItems = query.data?.total_items ?? 0
    const currentPage = query.data?.page ?? 1

    return {
        ...query,
        categories,
        totalPages,
        totalItems,
        currentPage,
    }
}


const useBrands = () => {
    const query = useQuery<PaginatedResponse<Brand>, Error>({
        queryKey: ["brands"],
        queryFn: async () => {
            const res = await brandService.getAllBrands()
            console.log("Response from brand table", res)
            return res
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })
    const brands = query.data?.items ?? []
    const totalPages = query.data?.total_page ?? 1
    const totalItems = query.data?.total_items ?? 0
    const currentPage = query.data?.page ?? 1

    return {
        ...query,
        brands,
        totalPages,
        totalItems,
        currentPage,
    }
}


const useProductUnits = () => {
    const query = useQuery<any, Error>({
        queryKey: ["product-units"],
        queryFn: async () => {
            const res = await productService.getProductUnitList()
            return res?.data
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })

    return {
        ...query,
        productUnits: query?.data ?? [],
    }
}
const useGenericName = () => {
    const query = useQuery<any, Error>({
        queryKey: ["generic-name"],
        queryFn: async () => {
            const params: ParamsType = { per_page: 1000 }
            const res: any = await genericNameService.getAllGenericNames(params)
            console.log("Response from generic name table", res)
            return res
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })

    return {
        ...query,
        genericNames: query.data?.items ?? [],
        total_page: query.data?.total_page,
        total_items: query.data?.total_items,
        page: query.data?.page
    }
}


export {
    useTags,
    useCategories,
    useBrands,
    useProductUnits,
    useGenericName
}