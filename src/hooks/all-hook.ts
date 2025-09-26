import {useQuery} from "@tanstack/react-query"
import tagService from "@/service/tag.service"

import {PaginatedResponse} from "@/types/types"
import categoriesService from "@/service/categories.service";
import brandService from "@/service/brand.service";
import productService from "@/service/product.service";

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

export const useTags = () => {
    const query = useQuery<PaginatedResponse<Tag>, Error>({
        queryKey: ["tags"],
        queryFn: async () => {
            const res = await tagService.getAllTags()
            console.log("Response from tag table", res)
            return res
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

export const useCategories = () => {
    const query = useQuery<PaginatedResponse<Category>, Error>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoriesService.getAllCategories()
            console.log("Response from category table", res)
            return res
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


export const useBrands = () => {
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


export const useProductUnits = () => {
    const query = useQuery<any, Error>({
        queryKey: ["product-units"],
        queryFn: async () => {
            const res = await productService.getProductUnitList()
            console.log("Response from product unit table", res?.data)
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