import HttpServices from "@/service/http.service";

export interface PackageParams {
    page: number;
    per_page: number;
    status?: number;
    search?: string;
}

class PackageService extends HttpServices {


    async getAllPackages(params?: PackageParams) {
        try {
            const res = await this.getRequest({
                url: `/admin/package`,
                config: {
                    auth: true,
                    params: params
                },
            });
            return res?.data
        } catch (error) {
            throw error
        }
    }

    async deletePackage(slug: string) {
        try {
            await this.deleteRequest({
                url: `/admin/package/${slug}`,
                config: {
                    auth: true,
                }
            });
        } catch (error) {
            throw error;
        }
    }

    async createPackage(data: any) {
        try {
            return await this.postRequest({
                url: `/admin/package`,
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

    async updatePackage(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/package/${slug}`,
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

    async getPackageDetail(slug: string) {
        try {
            const res = await this.getRequest({
                url: `/admin/package/${slug}`,
                config: {
                    auth: true,
                },
            });
            return res?.data
        } catch (error) {
            throw error
        }

    }

    async addProductToPackage(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/package/${slug}/add-product`,
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

}

const packageService = new PackageService();
export default packageService;
