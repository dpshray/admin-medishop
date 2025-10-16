import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class VendorService extends HttpServices {

    async getAllVendor(params?: { per_page?: number; page?: number, verified_vendors?: number, search?: string }) {
        try {
            const response = await this.getRequest({
                url: "/admin/vendor",
                config: {
                    auth: true,
                    params,
                }
            })
            return response?.data
        } catch (error) {
            console.log('Error from getAllVendor', error)
            throw error;
        }
    }

    async deleteVendor(uuid: string) {
        try {
            return await this.deleteRequest({
                url: `admin/vendor/${uuid}`,
                config: {
                    auth: true
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async createVendor(data: any) {
        try {
            return await this.postRequest({
                url: "/admin/vendor",
                data,
                config: {
                    auth: true,
                    file: true,
                }
            })

        } catch (error) {
            console.log('Error from createVendor', error)
            throw error;
        }
    }

    async updateVendor(uuid: string, data: any) {
        try {
            return await this.postRequest({
                url: `admin/vendor/${uuid}`,
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
            console.log('Error from updateVendor', error)
            throw error;
        }
    }

    async getVendor(uuid: string) {
        try {
            return await this.getRequest({
                url: `/admin/vendor/${uuid}`,
                config: {
                    auth: true,
                }

            })
        } catch (error) {
            console.log('Error from getVendor', error)
            throw error;
        }

    }

    async getProductsByVendor(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: "/vendor/product",
                config: {
                    auth: true,
                    params,
                }
            })
            return res?.data
        } catch (error) {
            console.log('Error from getProductsByVendor', error)
            throw error;
        }
    }

    async addProductByVendor(product_uuid: string, data: any) {
        try {
            return await this.postRequest({
                url: `/vendor/product/${product_uuid}`,
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            console.log('Error from addProductByVendor', error)
            throw error;
        }
    }
}


const vendorService = new VendorService();
export default vendorService;
