import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class CategoriesService extends HttpServices {


    async getAllCategories(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/admin/category',
                config: {
                    auth: true,
                    params
                }
            })
            return response?.data
        } catch (error) {
            throw error;
        }
    }

    async createCategory(data: any) {
        try {
            return await this.postRequest({
                url: '/admin/category',
                data,
                config: {
                    auth: true,
                    file: true,
                }
            })

        } catch (error) {
            throw error;
        }
    }

    async updateCategory(id: number, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/category/${id}`,
                data: {
                    ...data,
                    _method: "PUT",
                },
                config: {
                    auth: true,
                    file: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async deleteCategory(id: number) {
        try {
            return await this.deleteRequest({
                url: `/admin/category/${id}`,
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error;
        }
    }

    async getCategoryBySlug(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/category/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

}

const categoriesService = new CategoriesService();
export default categoriesService;
