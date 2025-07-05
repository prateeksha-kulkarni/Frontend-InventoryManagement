import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8081',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // stored after login
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;

//import axios from './axiosConfig'; // this file you wrote

//export const fetchProducts = async () => {
//    const response = await axios.get('/api/products'); // full URL will be: http://localhost:8080/api/products
//    return response.data;
//};
