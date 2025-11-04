import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class KitBagService extends HttpServices {
    async getAllKitBags(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: "/admin/kitbag",
                config: {
                    auth: true,
                    params
                }
            })
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteKitBag(uuid: string) {
        try {
          return   await this.deleteRequest({
                url: `/admin/kitbag/${uuid}`,
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error;
        }
    }
    async getKitBag(uuid: string) {
        try {
         return   await this.getRequest({
                url: `/admin/kitbag/${uuid}`,
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error;
        }
    }
}

const kitBagService = new KitBagService();
export default kitBagService;
