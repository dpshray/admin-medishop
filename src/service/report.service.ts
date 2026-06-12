import { PageParams } from "@/config/app-constant";
import HttpServices from "@/service/http.service";

class ReportService extends HttpServices {
  async getAdminSalesReports(params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: "/admin/reports/sales-overview",
        config: {
          auth: true,
          params,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getProductsPerformaceReport(params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: "/admin/productperformance",
        config: {
          auth: true,
          params,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getVendorPerformanceReport(params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: "/admin/vendorperformance",
        config: {
          auth: true,
          params,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
}

const reportService = new ReportService();
export default reportService;
