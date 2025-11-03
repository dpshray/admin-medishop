import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class VendorProductService extends HttpServices {

    async vendorProductListByAdmin(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: "/admin/vendorproductlist",
                config: {
                    auth: true,
                    params
                }
            })
            return res?.data
        } catch (error) {
            throw error
        }
    }

    async deleteVendorProduct(id: number) {
        try {
            return await this.deleteRequest({
                url: `/admin/vendor-product-prices/${id}`,
                config: {
                    auth: true,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async vendorProductDetails(id: number) {
        try {
            const res = await this.getRequest({
                url: `/admin/vendor-product-prices-detail/${id}`,
                config: {
                    auth: true,
                },
            });
            return res?.data;
        } catch (error) {
            throw error;
        }
    }

    async acceptAndRejectVendorProduct(id: number, isApproved: boolean) {
        try {
            return await this.patchRequest({
                url: `/admin/vendor-product-prices/${id}/approve`,
                data: {is_approved: isApproved},
                config: {auth: true},
            });
        } catch (error) {
            throw error
        }
    }

    async getVendorProducts(params?: any) {
        try {
            const res = await this.getRequest({
                url: '',
                config: {
                    auth: true,
                    params
                }

            })
            return res?.data
        } catch (error) {
            throw error
        }
    }


}

const vendorProductService = new VendorProductService();
export default vendorProductService;