import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { toast } from "sonner";

export const baseURL = "https://api.saharaspicehub.com/api"
export const imageURL = "https://api.saharaspicehub.com/storage"
// export const baseURL = "https://latcuapidemo.efinanci.com/api"
// export const imageURL = "https://latcuapidemo.efinanci.com/storage"

export const apiRequest = async <T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    token?: string,
    data?: any
  ): Promise<T> => {
    const url = `${baseURL}${endpoint}`;
  
    const config: AxiosRequestConfig = {
      url,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(data && { data }),
    };
  
    try {
      const response: AxiosResponse<T> = await axios.request(config);
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (error.response?.status === 401) {
          if (data?.message) {
            //toast.error(data.message);
          }
  
         // window.location.href = "/login";
        } else if (error.response?.status === 403) {
          //window.location.href = "/login";
        }
        throw error; // Rethrow the error for further handling if needed
      }
      throw new Error("An error occurred during the API request.");
    }
  };