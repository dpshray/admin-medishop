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

    async getLoggedInUser() {}
}

const authService = new AuthService();
export default authService;
