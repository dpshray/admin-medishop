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

  async getCommissionPayout(params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: "/admin/commission-payout",
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

  async getCommissionPayoutByVendorId(id: number, params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: `/admin/commission-payout/${id}/orders`,
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

  async updatePayoutStatus(payoutId: string, status: string, remarks: string) {
    try {
      const res = await this.postRequest({
        url: `/admin/commission-payout/${payoutId}/status`,
        config: {
          auth: true,
        },
        data: {
          status,
          remarks,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  //vendor side
  async getVendorCommissionPayout(params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: "/vendor/commission-payout",
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

  async requestVendorCommissionPayout() {
    try {
      const res = await this.postRequest({
        url: "/vendor/commission-payout/request",
        config: {
          auth: true,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getVendorSalesReport(params?: PageParams) {
    try {
      const res = await this.getRequest({
        url: "/vendor/sale-report",
        config: {
          auth: true,
          params,
        },
      });
      return res?.data;
    } catch (error) {
      throw error;
    }
  }
}

const reportService = new ReportService();
export default reportService;
