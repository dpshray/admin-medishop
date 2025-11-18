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

    // order assign to vendor
    async orderAssignToVendor(order_uuid: string, vendor_uuid: string, order_items_ids: number[]) {
        try {
            return await this.postRequest({
                url: `/admin/order/${order_uuid}/assign/${vendor_uuid}`,
                data: {order_items_ids},
                config: {
                    auth: true,
                },
            })
        } catch (error) {
            throw error
        }
    }

// order assign to admin/myself
    async orderAssignToAdmin(order_uuid: string) {
        try {
            return await this.getRequest({
                url: `/admin/order/${order_uuid}/assign`,
                config: {
                    auth: true,
                },
            })
        } catch (error) {
            throw error
        }
    }

    async cancelOrder(order_uuid: string) {
        try {
            const response = await this.postRequest({
                url: `/admin/orders/${order_uuid}/cancel-order`,
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
            return response?.data
        } catch (error) {
            throw error
        }
    }


}

const orderService = new OrderService()
export default orderService
