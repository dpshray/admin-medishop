import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";

class BookingServiceService extends HttpServices {
    async getAllBookingServices(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/admin/service-booking',
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

    async getBookingServiceByUuid(uuid: string) {
        try {
            return await this.getRequest({
                url: `/admin/service-booking/${uuid}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }


    /* admin Vendor service booking service */


    async getAllVendorForBookingServices(slug: string, params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: `/admin/service/${slug}/vendor`,
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
    async assignVendorForBookingService(booking_uuid: string, vendor_uuid: string) {
        try {
            return await this.getRequest({
                url: `/admin/assign-booking/${booking_uuid}/vendor/${vendor_uuid}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }

    }

}

const bookingService = new BookingServiceService();
export default bookingService;