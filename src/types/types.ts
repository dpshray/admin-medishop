export interface PaginationParams {
    page?: number | null
    per_page?: number | null
}

export interface PaginatedResponse<T> {
    items: T[]
    total_page: number
    total_items?: number
    page?: number
}

export interface ParamsType extends PaginationParams {
    search?: string
    status?: number
    verified_vendors?: number

    [key: string]: any
}

export type ValueType = string | number

export interface OptionType {
    value: ValueType
    label: string
}


 export interface PageParamsProps<T extends Record<string, string>> {
    params: T
}
