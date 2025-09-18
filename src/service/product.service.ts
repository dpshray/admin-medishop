import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";

class ProductService extends HttpServices {
    async getAllProducts(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: "/admin/product",
                config: {
                    auth: true,
                    params,
                }
            })
            console.log('response from getAllProducts', response?.data)
            return response?.data
        } catch (error) {
            throw error

        }
    }

    async getSingleProduct(uuid: string) {
    }

    async deleteProduct(uuid: string) {
    }


}

const productService = new ProductService();
export default productService;