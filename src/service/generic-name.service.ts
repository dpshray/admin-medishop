import HttpService from "@/service/http.service";
import {ParamsType} from "@/types/types";


class GenericNameService extends HttpService {


    async createGenericName(data: any) {
        try {
            return await this.postRequest({
                //admin/product-generic-name
                url: '/admin/generic-product-name',
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async deleteGenericName(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/generic-product-name/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async getGenericName(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/generic-product-name/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async updateGenericName(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/generic-product-name/${slug}`,
                data: {
                    ...data,
                    _method: "PUT"
                },
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async getAllGenericNames(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: '/admin/generic-product-name',
                config: {
                    auth: true,
                    params
                }
            })
            return res.data;
        } catch (error) {
            throw error;
        }
    }

}

const genericNameService = new GenericNameService();
export default genericNameService;