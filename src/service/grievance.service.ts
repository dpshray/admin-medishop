import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";

class GrievanceService extends HttpServices {

    async getAllGrievance(param: ParamsType) {
        try {
            const res = await this.getRequest({
                url: '/admin/grievance',
                config: {
                    auth: true,
                    params: param
                }
            })
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    async getSingleGrievance(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/grievance/${slug}`,
                config: {
                    auth: true
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async deleteGrievance(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/grievance/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async updateGrievance(slug: string, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/grievance/${slug}`,
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

}

const grievanceService = new GrievanceService();
export default grievanceService;