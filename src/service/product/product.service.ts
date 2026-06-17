import { PageParams } from "@/config/app-constant";
import HttpServices from "@/service/http.service";
import { ParamsType } from "@/types/types";

class ProductService extends HttpServices {
  async getAllProducts(params?: ParamsType) {
    try {
      const response = await this.getRequest({
        url: "/admin/product",
        config: {
          auth: true,
          params,
        },
      });
      console.log("response from getAllProducts", response?.data);
      return response?.data;
    } catch (error) {
      throw error;
    }
  }

  async getSingleProduct(uuid: string) {
    try {
      return await this.getRequest({
        //admin/product/2ed76270-091f-4b9c-b448-d7c2d332a598
        url: `/admin/product/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(uuid: string) {
    try {
      return await this.deleteRequest({
        url: `/admin/product/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createProduct(data: any) {
    try {
      return await this.postRequest({
        url: "/admin/product",
        data,
        config: {
          auth: true,
          file: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(uuid: string, data: any) {
    try {
      return await this.postRequest({
        url: `/admin/product/${uuid}`,
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
      throw error;
    }
  }

  async getProductUnitList() {
    try {
      return await this.getRequest({
        url: "/admin/product-units",
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorListByProduct(product_uuid: string, params?: ParamsType) {
    try {
      const res = await this.getRequest({
        url: `/admin/product/${product_uuid}/vendors`,
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

  async deleteProductImage(product_uuid: string, image_uuid: string) {
    try {
      return await this.deleteRequest({
        url: `/admin/product/${product_uuid}/media/${image_uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteVariantImage(variant_uuid: string, image_uuid: string) {
    try {
      return await this.deleteRequest({
        url: `/admin/product/${variant_uuid}/variants/${image_uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getProductForms(params?: PageParams) {
    const response = await this.getRequest({
      url: "/admin/product-variant-types",
      config: {
        auth: true,
        params,
      },
    });
    return response;
  }

  async createProductForm(data: any) {
    try {
      return await this.postRequest({
        url: "/admin/product-variant-types",
        data,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProductForm(uuid: string, data: any) {
    try {
      return await this.postRequest({
        url: `/admin/product-variant-types/${uuid}`,
        data: {
          ...data,
          _method: "PUT",
        },
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteProductForm(uuid: string) {
    try {
      return await this.deleteRequest({
        url: `/admin/product-variant-types/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deletePackageType(uuid: string) {
    try {
      return await this.deleteRequest({
        url: `/admin/package-types/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUnitType(uuid: string) {
    try {
      return await this.deleteRequest({
        url: `/admin/unit-types/${uuid}`,
        config: {
          auth: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

const productService = new ProductService();
export default productService;
