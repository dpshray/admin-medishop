import HttpServices from "@/service/http.service";

class BatchService extends HttpServices {

    ///vendor/get-variant-batch-numbers/{id} list of batch numbers

    async getVariantBatchNumbers(id: number) {
        try {
            const res = await this.getRequest({
                url: `/vendor/get-variant-batch-numbers/${id}`,
                config: {
                    auth: true,
                }
            })
            return res?.data
        } catch (error) {
            throw error
        }
    }


    ///vendor/order-items/batch-assign

    async assignBatchToOrderItems(data:any) {
        try {
            return await this.postRequest({
                url: `/vendor/order-items/batch-assign`,
                data,
                config: {
                    auth: true,
                }
            })
        } catch (error) {
            throw error
        }
    }

}

const batchService = new BatchService();
export default batchService;