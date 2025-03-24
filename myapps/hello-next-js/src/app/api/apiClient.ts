import axios, { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = axios.create({
    //baseURL: `https://${process.env.NEXT_PUBLIC_API_CLIENT_ID}.mockapi.io/api`,
    baseURL: "https://67e0cf0458cc6bf78522f5a9.mockapi.io/api",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
});
