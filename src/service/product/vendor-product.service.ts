import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class VendorProductService extends HttpServices {

    async vendorProductList(params?: ParamsType) {
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
            return  await this.deleteRequest({
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

    async acceptVendorProduct(id: number) {
        //TODO
    }

    async rejectVendorProduct(id: number) {
        //TODO
    }
}

const vendorProductService = new VendorProductService();
export default vendorProductService;