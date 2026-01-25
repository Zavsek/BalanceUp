import axios from "axios";
import { getAuth } from "firebase/auth";
import {API_URL} from "../constants/ApiConfig";

export const axiosInstance = axios.create({
  baseURL: `${API_URL}`, 
  timeout: 30000,
   });

   axiosInstance.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();

    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;