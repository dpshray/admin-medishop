import HttpServices from "@/service/http.service";

class BrandService extends HttpServices {
    async getAllBrands(params?: { per_page?: number; page?: number }) {
        try {
            return await this.getRequest({
                url: "/admin/brand",
                config: {
                    auth: true,
                    params,
                },
            });
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

}

const brandService = new BrandService();
export default brandService;
