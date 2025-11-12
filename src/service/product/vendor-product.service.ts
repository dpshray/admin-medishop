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

    /*Vendor Product Side*/

//Vendor Product List
    async getVendorProductsList(params?: any) {
        try {
            const res = await this.getRequest({
                url: '/vendor/product-list',
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

//Vendor available product
    async getVendorAvailableProducts(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: "vendor/available-product",
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

    async getVendorProductDetail(slug: string) {
        try {
            const res = await this.getRequest({
                url: `/vendor/product-detail/${slug}`,
                config: {
                    auth: true,
                }
            })
            return res?.data
        } catch (error) {
            throw error
        }
    }
    ///vendor/product-delete/cb7c026b-9cab-435f-912a-f4d498e45628
    async deleteVendorProductFromVendor(uuid: string) {
        try {
            return await this.deleteRequest({
               url: `/vendor/product-delete/${uuid}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }



}

const vendorProductService = new VendorProductService();
export default vendorProductService;