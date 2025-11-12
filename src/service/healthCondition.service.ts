import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";

class HealthConditionService extends HttpServices {
    async getHealthConditionList(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: "admin/health-condition",
                config: {
                    auth: true,
                    params
                }
            })
            console.log('Health Condition List', res?.data)
            return res?.data
        } catch (error) {
            throw error
        }
    }

    async deleteHealthCondition(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/health-condition/${slug}`,
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error
        }
    }

    async getHealthCondition(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/health-condition/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }
    async updateHealthCondition(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/health-condition/${slug}`,
                data:{
                    '_method': 'PUT',
                    ...data
                },
                config: {
                    auth: true,
                    file:true
                },
            })
        } catch (error) {
            throw error
        }
    }

    async createHealthCondition(data: any) {
        try {
            return await this.postRequest({
                url: `/admin/health-condition`,
                data,
                config: {
                    auth: true,
                    file:true
                },
            })
        } catch (error) {
            throw error
        }
    }

}

const healthConditionService = new HealthConditionService();
export default healthConditionService;