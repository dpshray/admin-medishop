import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config: any) => {
        console.log("➡️ FULL REQUEST URL:", config.baseURL + config.url);
        return config;
    },
    (error: AxiosError) => {
        console.error("Request Error from axios:", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error: AxiosError) => {

        console.error("Response Error from axios:", error);
        if (error.status === 401) {
            window.location.href = "/login";

        }

        return Promise.reject(error?.response?.data);
    }
);

export default axiosInstance;


