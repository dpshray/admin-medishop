import HttpServices from "@/service/http.service";
import { ParamsType } from "@/types/types";

class VendorService extends HttpServices {
  async getAllVendor(params?: ParamsType) {
    try {
      const response = await this.getRequest({
        url: "/admin/vendor",
        config: {
          auth: true,
          params,
        },
      });
      return response?.data;
    } catch (error) {
      console.error("Error from getAllVendor", error);
      throw error;
    }
  }

  async deleteVendor(uuid: string) {
    try {
      return await this.deleteRequest({
        url: `admin/vendor/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createVendor(data: any) {
    try {
      return await this.postRequest({
        url: "/admin/vendor",
        data,
        config: {
          auth: true,
          file: true,
        },
      });
    } catch (error) {
      console.error("Error from createVendor", error);
      throw error;
    }
  }

  async updateVendor(uuid: string, data: any) {
    try {
      return await this.postRequest({
        url: `admin/vendor/${uuid}`,
        data: {
          ...data,
          _method: "PUT",
        },
        config: {
          auth: true,
          file: true,
        },
      });
    } catch (error) {
      console.error("Error from updateVendor", error);
      throw error;
    }
  }

  async getVendor(uuid: string) {
    try {
      return await this.getRequest({
        url: `/admin/vendor/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      console.error("Error from getVendor", error);
      throw error;
    }
  }

  async addProductByVendor(product_uuid: string, data: any) {
    try {
      return await this.postRequest({
        url: `/vendor/product/${product_uuid}`,
        data,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      console.error("Error from addProductByVendor", error);
      throw error;
    }
  }

  async vendorDashboard() {
    try {
      return await this.getRequest({
        url: "/vendor/dashboard",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      console.error("Error from vendorDashboard", error);
      throw error;
    }
  }

  //fetch all product by vendor by admin
  async getAllProductOfVendor(uuid: string, params?: ParamsType) {
    try {
      const response = await this.getRequest({
        ///admin/fetch-vendor-products/0eebfe00-8bfd-4957-9947-503731e37a33?per_page=1
        url: `/admin/fetch-vendor-products/${uuid}`,
        config: {
          auth: true,
          params,
        },
      });
      return response?.data;
    } catch (error) {
      console.error("Error from fetchAllProductOfVendor", error);
      throw error;
    }
  }

  async updateBatchNumbers(product_uuid: string, data: any) {
    try {
      return await this.postRequest({
        url: `/vendor/update-batch-numbers/${product_uuid}`,
        data,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      console.error("Error from updateBatchNumbers", error);
      throw error;
    }
  }
}

const vendorService = new VendorService();
export default vendorService;
