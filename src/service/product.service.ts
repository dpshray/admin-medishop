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

    async createProduct(data: any) {
        try {
            const response = await this.postRequest({
                url: "/admin/product",
                data,
                config: {
                    auth: true,
                    file: true,
                }
            })
            console.log('response from createProduct', response?.data)
            return response
        } catch (error) {
            throw error
        }
    }


}

const productService = new ProductService();
export default productService;