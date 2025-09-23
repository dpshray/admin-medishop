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
        try {
           const res=await this.getRequest({
                //admin/product/2ed76270-091f-4b9c-b448-d7c2d332a598
                url: `/admin/product/${uuid}`,
                config: {
                    auth: true,
                }
            })
            console.log('response from getSingleProduct', res?.data)
            return res
        } catch (error) {
            throw error
        }
    }

    async deleteProduct(uuid: string) {
    }

    async createProduct(data: any) {
        try {
            return await this.postRequest({
                url: "/admin/product",
                data,
                config: {
                    auth: true,
                    file: true,
                }
            })
        } catch (error) {
            throw error
        }
    }

    async updateProduct(uuid: string, data: any) {
        try {
            await this.postRequest({
                url: `/admin/product/${uuid}`,
                data: {
                    ...data,
                    "_method": "PUT"
                },
                config: {
                    auth: true,
                    file: true,
                }
            })
        } catch (error) {
            throw error

        }
    }


}

const productService = new ProductService();
export default productService;