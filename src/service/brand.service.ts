import HttpServices from "@/service/http.service";

class BrandService extends HttpServices {
    async getAllBrands(params?: { per_page?: number; page?: number }) {
        try {
            const res = await this.getRequest({
                url: "/admin/brand",
                config: {
                    auth: true,
                    params,
                },
            });
            return res?.data
        } catch (error) {
            throw error;
        }
    }

    async deleteBrand(id: number) {
        try {
            return await this.deleteRequest({
                url: `/admin/brand/${id}`,
                config: {
                    auth: true,
                }
            });
        } catch (error) {
            throw error;
        }

    }

    async updateBrand(id: number, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/brand/${id}`,
                data: {
                    ...data,
                    _method: "PUT",
                },
                config: {
                    auth: true,
                    file: true,
                },

            });
        } catch (error) {
            throw error;
        }
    }


    async createBrand(data: any) {
        try {
            return await this.postRequest({
                url: "/admin/brand",
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

    getBrandBySlug(slug: string) {
        try {
            return this.getRequest({
                url: `/admin/brand/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

}

const brandService = new BrandService();
export default brandService;
