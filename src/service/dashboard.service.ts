import HttpService from "@/service/http.service";

class DashboardService extends HttpService {
  async getDashboardTotals() {
    try {
      return await this.getRequest({
        url: "/admin/main-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserTotals() {
    try {
      return await this.getRequest({
        url: "/admin/user-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorTotals() {
    try {
      return await this.getRequest({
        url: "/admin/vendor-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getBrandTotals() {
    try {
      return await this.getRequest({
        url: "/admin/brand-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getProductTotals() {
    try {
      return await this.getRequest({
        url: "/admin/product-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getPackageTotals() {
    try {
      return await this.getRequest({
        url: "/admin/package-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getOrderTotals() {
    try {
      return await this.getRequest({
        url: "/admin/order-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getProductRequestTotals() {
    try {
      return await this.getRequest({
        url: "/admin/product-request-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getServiceBookingTotals() {
    try {
      return await this.getRequest({
        url: "/admin/service-booking-dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
