import HttpService from "@/service/http.service";
import {ParamsType} from "@/types/types";

class ServiceCategoriesService extends HttpService {
    async getAllCategories(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/admin/service-category',
                config: {
                    auth: true,
                    params,
                },
            });
            return response?.data;
        } catch (error: any) {
            console.error("Failed to fetch service categories:", error);
            throw new Error(error?.message || "Unable to fetch service categories");
        }
    }

    async createServiceCategory(data: any) {
        try {
            return await this.postRequest({
                url: '/admin/service-category',
                data,
                config: {
                    auth: true,
                },
            });
        } catch (error) {
            throw error;
        }
    }
    async deleteServiceCategory(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/service-category/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }
    async getServiceCategoryBySlug(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/service-category/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }
    async updateServiceCategory(slug: string, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/service-category/${slug}`,
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }
}

const serviceCategoriesService = new ServiceCategoriesService();
export default serviceCategoriesService;
