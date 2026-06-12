import HttpServices from "@/service/http.service";
import { toast } from "sonner";

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
        },
      });
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
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(data: any) {
    try {
      return await this.postRequest({
        url: "/user/profile",
        data: {
          ...data,
          _method: "PUT",
        },
        config: {
          auth: true,
          file: true,
        },
      });
    } catch (error: any) {
      // console.log('Error from updateProfile', error)
      toast.error(error?.message || "Failed to update profile");
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
