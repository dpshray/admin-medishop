import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";

class VendorOrderService extends HttpServices {
    async getVendorOrders(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: `/vendor/orders`,
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

    async getVendorOrderDetail(slug: string) {
        try {
            const res = await this.getRequest({
                url: `/vendor/orders/${slug}`,
                config: {
                    auth: true,
                },
            });
            return res?.data
        } catch (error) {
            throw error
        }
    }

    async updateVendorOrderStatus(slug: string, data: { status: string }) {
        try {
            return await this.putRequest({
                url: `/vendor/orders/${slug}`,
                data,
                config: {
                    auth: true,
                },
            });

        } catch (error) {
            throw error
        }
    }
}

const vendorOrderService = new VendorOrderService();
export default vendorOrderService;