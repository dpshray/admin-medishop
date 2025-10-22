import HttpService from "@/service/http.service";
import {ParamsType} from "@/types/types";

class BannerService extends HttpService {

    async getAllBanners(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/admin/banner',
                config: {
                    auth: true,
                    params
                }
            })
            return response?.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteBanner(uuid: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/banner/${uuid}`,
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error
        }
    }

    async updateBanner(uuid: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/banner/${uuid}`,
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
            throw error
        }
    }

    async toggleBannerStatus(uuid: string) {
        try {
            return await this.getRequest({
                url: `/admin/toggle-banner-status/${uuid}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }

    async getBannerById(uuid: string) {
        try {
            return await this.getRequest({
                url: `/admin/banner/${uuid}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async createBanner(data: any) {
        try {
            return await this.postRequest({
                url: `/admin/banner`,
                data,
                config: {
                    auth: true,
                    file: true,
                }
            })
        } catch (error) {
            throw error
        }
    }

}

const bannerService = new BannerService();
export default bannerService;
