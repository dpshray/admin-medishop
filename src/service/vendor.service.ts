import HttpServices from "@/service/http.service";


class VendorService extends HttpServices {

    async getAllVendor(params?: { per_page?: number; page?: number, verified_vendors?: number }) {
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

}

const vendorService = new VendorService();
export default vendorService;
