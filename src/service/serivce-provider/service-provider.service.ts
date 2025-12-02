import HttpServices from "@/service/http.service";

class ServiceProviderService extends HttpServices {

    async createServiceProvider(data: any) {
        try {
            return await this.postRequest({
                url: '/admin/service',
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

    async getAllServiceProviders(params?: any) {
        try {
            const response = await this.getRequest({
                url: '/admin/service',
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

    async getServiceProviderBySlug(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/service/${slug}`,
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error
        }
    }

    async updateServiceProvider(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/service/${slug}`,
                data: {
                    ...data,
                    "_method": "PATCH"
                },
                config: {
                    auth: true,
                    file: true
                }
            })
        } catch (error) {
            throw error
        }
    }

    async deleteServiceProvider(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/service/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }
}

const serviceProvider = new ServiceProviderService();
export default serviceProvider;