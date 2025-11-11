import HttpServices from "@/service/http.service";

class AuthService extends HttpServices {
    async login(data: any) {
        try {
            return await this.postRequest({
                url: "/login",
                data,
            });
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            return await this.postRequest({
                url: "/logout",
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async getLoggedInUser() {
        try {
            return await this.getRequest({
                url: "/user/profile",
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async updateProfile(data: any) {
        try {
            return await this.postRequest({
                url: "/user/profile",
                data:{
                    ...data,
                    "_method": "PUT"
                },
                config: {
                    auth: true,
                    file: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }
}


const authService = new AuthService();
export default authService;
