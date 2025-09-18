import HttpService from "@/service/http.service";
import {ParamsType} from "@/types/types";


class TagService extends HttpService {


    async getAllTags(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/admin/tag',
                config: {
                    auth: true,
                    params
                }
            })
            return response?.data
        } catch (error) {
            console.error("Failed to fetch tags:", error);
            throw error;
        }
    }

    async deleteTag(id: number) {
        try {
            await this.deleteRequest({
                url: `/admin/tag/${id}`,
                config: {
                    auth: true,
                }
            });
        } catch (error) {
            console.error("Failed to delete tag:", error);
            throw error;
        }
    }

    async updateTag(id: number, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/tag/${id}`,
                data,
                config: {
                    auth: true,
                }
            })
        } catch
            (error) {
            console.error("Failed to update tag:", error);
            throw error;
        }
    }

    async createTag(data: any) {
        try {
            return await this.postRequest({
                url: '/admin/tag',
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            console.error("Failed to create tag:", error);
            throw error;
        }
    }


}

const tagService = new TagService();
export default tagService;
