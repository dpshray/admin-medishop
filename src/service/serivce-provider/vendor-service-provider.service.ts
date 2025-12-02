import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";

class VendorServiceProviderService extends HttpServices {

    async getAllVendorServiceProviders(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/vendor/service',
                config: {
                    auth: true,
                    params
                }
            })
            return response?.data
        } catch (error) {
            throw error
        }
    }

    async getVendorServiceProviderBySlug(slug: string) {
        try {
            return await this.getRequest({
                url: `/vendor/service/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }
    async createVendorServiceProvider(data: any) {
        try {
            return await this.postRequest({
                url: '/vendor/service',
                data,
                config: {
                    auth: true,
                    file: true
                }
            })
        } catch (error) {
            throw error
        }
    }
    async deleteVendorServiceProvider(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/vendor/service/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }
}

const vendorServiceProviderService = new VendorServiceProviderService();
export default vendorServiceProviderService;