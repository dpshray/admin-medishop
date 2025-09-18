import {useQuery} from "@tanstack/react-query"
import tagService from "@/service/tag.service"

import {PaginatedResponse} from "@/types/types"
import categoriesService from "@/service/categories.service";

export interface Tag {
    id: number
    name: string
    slug: string
}

export interface Category {
    id: number
    name: string
    slug: string
}

export const useTags = () => {
    const query = useQuery<PaginatedResponse<Tag>, Error>({
        queryKey: ["tags"],
        queryFn: () => tagService.getAllTags(),
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
        queryFn: () => categoriesService.getAllCategories(),
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
