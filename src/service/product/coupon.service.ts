import HttpServices from "@/service/http.service";


class CouponService extends HttpServices {
    async createCoupon(data: any) {
        try {
            return await this.postRequest({
                url: "/admin/coupon",
                config: {
                    auth: true,
                }
            })

        } catch (error) {
            throw error;
        }
    }
    async deleteCoupon(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/coupon/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }
    async getCouponBySlug(slug: string) {
        try {
            return await this.getRequest({
                url: `/admin/coupon/${slug}`,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }
    async updateCoupon(slug: string, data: any) {
        try {
            return this.postRequest({
                url: `/admin/coupon/${slug}`,
                data: {
                    ...data,
                    _method: "PUT",
                },
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    async getAllCoupons() {
        try {
            const res = await this.getRequest({
                url: "/admin/coupon",
                config: {
                    auth: true,
                }
            })
            return res.data;
        } catch (error) {
            throw error;
        }
    }
}

const couponService = new CouponService();
export default couponService;