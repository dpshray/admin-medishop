import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class OrderService extends HttpServices {

    async getAllOrders(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: "/admin/user-order",
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

    async deleteOrder(order_uuid: string) {
        try {
            const response = await this.deleteRequest({
                url: `/admin/user-order/${order_uuid}`,
                config: {
                    auth: true,
                }
            })
            return response?.data
        } catch (error) {
            throw error
        }
    }

    async getOrderDetails(uuid: string) {
        try {
            const response = await this.getRequest({
                url: `admin/user-order/${uuid}`,
                config: {
                    auth: true,
                }
            })
            return response?.data
        } catch (error) {
            throw error
        }
    }

}

const orderService = new OrderService()
export default orderService
