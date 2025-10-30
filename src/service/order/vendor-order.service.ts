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
}

const vendorOrderService = new VendorOrderService();
export default vendorOrderService;