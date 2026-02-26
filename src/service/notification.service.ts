import HttpServices from "@/service/http.service";
import { ParamsType } from "@/types/types";

class NotificationService extends HttpServices {
  async getAllNotifications(params: ParamsType) {
    try {
      const res = await this.getRequest({
        url: "/admin/notification",
        config: {
          auth: true,
          params,
        },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  async sendNotification(data: any) {
    try {
      return await this.postRequest({
        url: "/admin/notify/client",
        data,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
