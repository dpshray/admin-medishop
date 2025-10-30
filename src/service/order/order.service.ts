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

    async assignOrder(order_uuid: string, vendor_uuid: string) {
        try {
            const response = await this.postRequest({
                url: `/admin/orders/${order_uuid}/assign/${vendor_uuid}`,
                config: {
                    auth: true,
                },
            })
            return response?.data
        } catch (error) {
            throw error
        }
    }

    async cancelOrder(order_uuid: string) {
        try {
            const response = await this.postRequest({
                url: `/admin/orders/${order_uuid}/cancel-assign`,
                config: {
                    auth: true,
                },
            })
            return response?.data
        } catch (error) {
            throw error
        }
    }

    async getAssignableVendorOrders(order_uuid: string, params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: `/admin/orders/${order_uuid}/vendors`,
                config: {
                    auth: true,
                    params
                }
            })
            console.log('response from getAssignedVendorOrders', response?.data)
            return response?.data
        } catch (error) {
            throw error
        }
    }


}

const orderService = new OrderService()
export default orderService
