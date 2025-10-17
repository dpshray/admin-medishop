import HttpServices from "@/service/http.service";
import {ParamsType} from "@/types/types";


class UserService extends HttpServices {

    async getAllUser(params?: ParamsType) {
        try {
            const res = await this.getRequest({
                url: '/admin/users',
                config: {
                    auth: true,
                    params
                },

            })
            return res.data;
        } catch (error) {
            throw error;
        }

    }
   async deleteUser(id: number) {
        try {
            const res = await this.deleteRequest({
                url: `/admin/users/${id}`,
                config: {
                    auth: true,
                },
            })
            return res.data;
        } catch (error) {
            throw error;
        }
    }

}

const userService = new UserService();
export default userService;
