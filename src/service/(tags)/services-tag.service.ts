import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class ServicesTagService extends HttpServices {
    async getAllServicesTags(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: 'admin/service-tag',
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

    async deleteServicesTag(slug: string) {
        try {
            await this.deleteRequest({
                url: `/admin/service-tag/${slug}`,
                config: {
                    auth: true,
                }
            });
        } catch (error) {
            throw error;
        }
    }

    async getServicesTagBySlug(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/service-tag/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async updateServicesTag(slug: string, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/service-tag/${slug}`,
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async createServicesTag(data: any) {
        try {
            return await this.postRequest({
                url: `/admin/service-tag`,
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

const servicesTagService = new ServicesTagService();
export default servicesTagService;