import HttpService from "@/service/http.service";
import {ParamsType} from "@/types/types";


class PrescriptionService extends HttpService {

    async getAllPrescriptions(params?: ParamsType) {
        try {
            const response = await this.getRequest({
                url: '/admin/prescription',
                config: {
                    auth: true,
                    params
                }
            })
            return response?.data
        } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
            throw error;
        }
    }

    async deletePrescription(id: number) {
        try {
            await this.deleteRequest({
                url: `/admin/prescription/${id}`,
                config: {
                    auth: true,
                }
            });
        } catch (error) {
            console.error("Failed to delete prescription:", error);
            throw error;
        }
    }

}

const prescriptionService = new PrescriptionService();
export default prescriptionService;
