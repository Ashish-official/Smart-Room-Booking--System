import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { type Booking } from '../types/boking';
const BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('booking_session_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[Axios Outgoing Request] -> ${config.method?.toUpperCase()} to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[Axios Incoming Response] -> Status ${response.status} from ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 422:
          console.error('Server rejected booking timeframe conflicts.');
          break;
        case 500:
          console.error('High-level backend cluster anomaly.');
          break;
        default:
          console.error(` [Axios Exception]: Returned status code ${status}`);
      }
      return Promise.reject(error);
    }
    if (!error.response && (error.code === 'ERR_NETWORK' || error.request)) {
      console.warn('⚠️ Live server endpoint unreachable. Axios Interceptor activating local storage mock data fallback...');
      
      const mockDb: Booking[] = JSON.parse(localStorage.getItem('__mock_bookings_db') || '[]');

      if (originalRequest.url?.includes('/bookings') && originalRequest.method === 'get') {
        const urlObj = new URL(originalRequest.url, BASE_URL);
        const targetRoom = urlObj.searchParams.get('room') || 'Red';                              
        const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
        const limit = parseInt(urlObj.searchParams.get('limit') || '5', 10);

        const filtered = mockDb.filter(b => b.room === targetRoom);
        
        const startIndex = (page - 1) * limit;
        const slicedData = filtered.slice(startIndex, startIndex + limit);

        return Promise.resolve({
          data: {
            data: slicedData,
            total: filtered.length,
            page,
            limit
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest,
        } as AxiosResponse);
      }
      if (originalRequest.url?.includes('/bookings') && originalRequest.method === 'post') {
        const parseBody = JSON.parse(originalRequest.data);
        
        const newRecord: Booking = {
          id: `BKG-${Math.floor(100 + Math.random() * 900)}`,
          ...parseBody
        };

        mockDb.unshift(newRecord); 
        localStorage.setItem('__mock_bookings_db', JSON.stringify(mockDb));

        return Promise.resolve({
          data: newRecord,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: originalRequest,
        } as AxiosResponse);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
